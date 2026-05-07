import * as acorn from 'acorn';

const createEnv = (parent = null) => ({
    parent,
    functions: new Map(),
    getFunction(name) {
        return this.functions.has(name)
            ? this.functions.get(name)
            : this.parent?.getFunction(name);
    },
    setFunction(name, fnValue) {
        this.functions.set(name, fnValue);
    }
});

const createTask = ({ type, name, line, message, childTasks = [], execute = () => ({}), repeating = false, intervalId = null }) => ({
    id: Math.random().toString(36).slice(2),
    type,
    name,
    line,
    message,
    childTasks,
    execute,
    repeating,
    intervalId
});

const getSource = (code, node) => code.slice(node.start, node.end);

const evaluateExpression = (node, runtime, code) => {
    if (!node) return undefined;

    switch (node.type) {
        case 'Literal':
            return node.value;
        case 'Identifier':
            return runtime.variables[node.name] ?? node.name;
        case 'FUNCTION_VALUE':
            return node;
        case 'INTERVAL_ID':
            return node.id;
        case 'TemplateLiteral':
            return node.quasis.map((quasi, index) => {
                const text = quasi.value.cooked;
                const expressionValue = index < node.expressions.length
                    ? evaluateExpression(node.expressions[index], runtime, code)
                    : '';
                return `${text}${expressionValue ?? ''}`;
            }).join('');
        case 'BinaryExpression': {
            const left = evaluateExpression(node.left, runtime, code);
            const right = evaluateExpression(node.right, runtime, code);
            switch (node.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                case '===': return left === right;
                case '!==': return left !== right;
                case '==': return left == right;
                case '!=': return left != right;
                case '<': return left < right;
                case '<=': return left <= right;
                case '>': return left > right;
                case '>=': return left >= right;
                default:
                    return `${left} ${node.operator} ${right}`;
            }
        }
        case 'LogicalExpression': {
            const left = evaluateExpression(node.left, runtime, code);
            if (node.operator === '&&') return left ? evaluateExpression(node.right, runtime, code) : left;
            if (node.operator === '||') return left ? left : evaluateExpression(node.right, runtime, code);
            return undefined;
        }
        case 'UnaryExpression': {
            const value = evaluateExpression(node.argument, runtime, code);
            switch (node.operator) {
                case '!': return !value;
                case '+': return +value;
                case '-': return -value;
                case '~': return ~value;
                case 'typeof': return typeof value;
                default: return value;
            }
        }
        case 'MemberExpression': {
            const objectValue = evaluateExpression(node.object, runtime, code);
            const property = node.computed
                ? evaluateExpression(node.property, runtime, code)
                : node.property.name;
            return objectValue?.[property] ?? `${objectValue ?? 'undefined'}.${property}`;
        }
        case 'ConditionalExpression':
            return evaluateExpression(node.test, runtime, code)
                ? evaluateExpression(node.consequent, runtime, code)
                : evaluateExpression(node.alternate, runtime, code);
        case 'SequenceExpression':
            return evaluateExpression(node.expressions.at(-1), runtime, code);
        case 'CallExpression': {
            if (node.callee.type === 'Identifier' && ['Promise', 'setTimeout', 'setInterval', 'clearInterval'].includes(node.callee.name)) {
                return undefined;
            }
            return getSource(code, node);
        }
        default:
            return getSource(code, node);
    }
};

const parseCallbackToTasks = (callback, env, code) => {
    if (!callback) return [];
    if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
        return parseFunctionBody(callback, createEnv(env), code);
    }
    if (callback.type === 'Identifier') {
        const fnValue = env.getFunction(callback.name);
        return fnValue ? fnValue.bodyTasks : [];
    }
    return [];
};

const createFunctionValue = (fnNode, env, code) => ({
    node: fnNode,
    bodyTasks: parseFunctionBody(fnNode, createEnv(env), code)
});

const collectDeclarations = (nodes, env, code) => {
    nodes.forEach((node) => {
        if (node.type === 'FunctionDeclaration' && node.id?.name) {
            env.setFunction(node.id.name, createFunctionValue(node, env, code));
        }

        if (node.type === 'VariableDeclaration') {
            node.declarations.forEach((declarator) => {
                if (declarator.id.type === 'Identifier' && declarator.init && ['ArrowFunctionExpression', 'FunctionExpression'].includes(declarator.init.type)) {
                    env.setFunction(declarator.id.name, createFunctionValue(declarator.init, env, code));
                }
            });
        }
    });
};

const parseFunctionBody = (fnNode, env, code) => {
    if (fnNode.body.type === 'BlockStatement') {
        return parseStatements(fnNode.body.body, env, code);
    }
    const expression = parseExpression(fnNode.body, env, code);
    return [...expression.tasks];
};

const parseStatements = (nodes, env, code) => {
    const tasks = [];
    nodes.forEach((node) => tasks.push(...parseStatement(node, env, code)));
    return tasks;
};

const parseStatement = (node, env, code) => {
    switch (node.type) {
        case 'BlockStatement':
            return parseStatements(node.body, env, code);
        case 'ExpressionStatement': {
            const expression = parseExpression(node.expression, env, code);
            const expressionTasks = [...expression.tasks];
            const hasSyncTask = expressionTasks.some((task) => task.type === 'SYNC');

            if (!hasSyncTask && expressionTasks.length > 0) {
                const wrapperTask = createTask({
                    type: 'SYNC',
                    name: `Expression statement`,
                    line: node.loc.start.line,
                    childTasks: expressionTasks,
                    execute: () => ({ childTasks: [] })
                });
                return [wrapperTask];
            }

            return expressionTasks;
        }
        case 'VariableDeclaration': {
            const tasks = [];
            node.declarations.forEach((declarator) => {
                const init = declarator.init ? parseExpression(declarator.init, env, code) : { tasks: [], expression: undefined };
                if (declarator.id.type === 'Identifier') {
                    const task = createTask({
                        type: 'SYNC',
                        name: `Variable declaration: ${declarator.id.name}`,
                        line: node.loc.start.line,
                        execute: (runtime) => {
                            const value = init.expression ? evaluateExpression(init.expression, runtime, code) : undefined;
                            if (value && value.type === 'FUNCTION_VALUE') {
                                runtime.functions = runtime.functions || {};
                                runtime.functions[declarator.id.name] = value;
                                runtime.variables[declarator.id.name] = value;
                            } else {
                                runtime.variables[declarator.id.name] = value;
                            }
                            return { childTasks: [] };
                        }
                    });
                    task.childTasks = [...init.tasks];
                    tasks.push(task);
                } else {
                    tasks.push(...init.tasks);
                }
            });
            return tasks;
        }
        case 'FunctionDeclaration':
            if (node.id?.name) {
                env.setFunction(node.id.name, createFunctionValue(node, env, code));
            }
            return [];
        case 'IfStatement': {
            const tasks = [];
            const test = parseExpression(node.test, env, code);
            tasks.push(...test.tasks);

            const consequentTasks = parseStatement(node.consequent, env, code);
            const alternateTasks = node.alternate ? parseStatement(node.alternate, env, code) : [];

            const ifTask = createTask({
                type: 'SYNC',
                name: 'if statement',
                line: node.loc.start.line,
                execute: (runtime) => {
                    const testValue = test.expression ? evaluateExpression(test.expression, runtime, code) : false;
                    return { childTasks: testValue ? consequentTasks : alternateTasks };
                }
            });
            tasks.push(ifTask);
            return tasks;
        }
        case 'WhileStatement': {
            const tasks = [];
            const test = parseExpression(node.test, env, code);
            tasks.push(...test.tasks);
            tasks.push(...parseStatement(node.body, env, code));
            return tasks;
        }
        case 'DoWhileStatement': {
            const tasks = [];
            tasks.push(...parseStatement(node.body, env, code));
            const test = parseExpression(node.test, env, code);
            tasks.push(...test.tasks);
            return tasks;
        }
        case 'ForStatement': {
            const tasks = [];
            if (node.init) {
                if (node.init.type === 'VariableDeclaration') {
                    tasks.push(...parseStatement(node.init, env, code));
                } else {
                    tasks.push(...parseExpression(node.init, env, code).tasks);
                }
            }
            if (node.test) tasks.push(...parseExpression(node.test, env, code).tasks);
            if (node.update) tasks.push(...parseExpression(node.update, env, code).tasks);
            tasks.push(...parseStatement(node.body, env, code));
            return tasks;
        }
        case 'ForInStatement':
        case 'ForOfStatement': {
            const tasks = [];
            tasks.push(...parseExpression(node.left, env, code).tasks);
            tasks.push(...parseExpression(node.right, env, code).tasks);
            tasks.push(...parseStatement(node.body, env, code));
            return tasks;
        }
        case 'ReturnStatement':
            return node.argument ? parseExpression(node.argument, env, code).tasks : [];
        case 'SwitchStatement': {
            const tasks = [];
            tasks.push(...parseExpression(node.discriminant, env, code).tasks);
            node.cases.forEach((caseNode) => {
                caseNode.consequent.forEach((consequentNode) => {
                    tasks.push(...parseStatement(consequentNode, env, code));
                });
            });
            return tasks;
        }
        case 'TryStatement': {
            const tasks = [];
            tasks.push(...parseStatement(node.block, env, code));
            if (node.handler) tasks.push(...parseStatement(node.handler.body, env, code));
            if (node.finalizer) tasks.push(...parseStatement(node.finalizer, env, code));
            return tasks;
        }
        case 'LabeledStatement':
            return parseStatement(node.body, env, code);
        case 'ThrowStatement':
            return parseExpression(node.argument, env, code).tasks;
        default:
            return [];
    }
};

const parseExpression = (node, env, code) => {
    if (!node) return { tasks: [], expression: undefined };

    switch (node.type) {
        case 'Literal':
        case 'TemplateLiteral':
        case 'Identifier':
            return { tasks: [], expression: node };
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
            return { tasks: [], expression: { type: 'FUNCTION_VALUE', bodyTasks: parseFunctionBody(node, createEnv(env), code) } };
        case 'AssignmentExpression': {
            const right = parseExpression(node.right, env, code);
            const tasks = [...right.tasks];
            if (node.left.type === 'Identifier') {
                const assignTask = createTask({
                    type: 'SYNC',
                    name: `Assignment: ${node.left.name}`,
                    line: node.loc.start.line,
                    execute: (runtime) => {
                        let value = right.expression ? evaluateExpression(right.expression, runtime, code) : undefined;
                        if (node.operator !== '=') {
                            const currentValue = Number(runtime.variables[node.left.name] ?? 0);
                            switch (node.operator) {
                                case '+=':
                                    value = currentValue + value;
                                    break;
                                case '-=':
                                    value = currentValue - value;
                                    break;
                                case '*=':
                                    value = currentValue * value;
                                    break;
                                case '/=':
                                    value = currentValue / value;
                                    break;
                                case '%=':
                                    value = currentValue % value;
                                    break;
                                case '<<=':
                                    value = currentValue << value;
                                    break;
                                case '>>=':
                                    value = currentValue >> value;
                                    break;
                                case '>>>=':
                                    value = currentValue >>> value;
                                    break;
                                case '&=':
                                    value = currentValue & value;
                                    break;
                                case '^=':
                                    value = currentValue ^ value;
                                    break;
                                case '|=':
                                    value = currentValue | value;
                                    break;
                                default:
                                    value = right.expression ? evaluateExpression(right.expression, runtime, code) : undefined;
                            }
                        }
                        runtime.variables[node.left.name] = value;
                        return { childTasks: [] };
                    }
                });
                tasks.push(assignTask);
            }
            return { tasks, expression: undefined };
        }
        case 'UpdateExpression': {
            const argResult = parseExpression(node.argument, env, code);
            const tasks = [...argResult.tasks];
            if (node.argument.type === 'Identifier') {
                const updateTask = createTask({
                    type: 'SYNC',
                    name: `Update: ${node.argument.name}${node.operator}`,
                    line: node.loc.start.line,
                    execute: (runtime) => {
                        const current = Number(runtime.variables[node.argument.name] ?? 0);
                        const next = node.operator === '++' ? current + 1 : current - 1;
                        runtime.variables[node.argument.name] = next;
                        return { childTasks: [] };
                    }
                });
                tasks.push(updateTask);
            }
            return { tasks, expression: undefined };
        }
        case 'BinaryExpression': {
            const left = parseExpression(node.left, env, code);
            const right = parseExpression(node.right, env, code);
            return { tasks: [...left.tasks, ...right.tasks], expression: node };
        }
        case 'LogicalExpression': {
            const left = parseExpression(node.left, env, code);
            const right = parseExpression(node.right, env, code);
            return { tasks: [...left.tasks, ...right.tasks], expression: node };
        }
        case 'UnaryExpression': {
            const argument = parseExpression(node.argument, env, code);
            return { tasks: [...argument.tasks], expression: node };
        }
        case 'ConditionalExpression': {
            const test = parseExpression(node.test, env, code);
            const consequent = parseExpression(node.consequent, env, code);
            const alternate = parseExpression(node.alternate, env, code);
            return { tasks: [...test.tasks, ...consequent.tasks, ...alternate.tasks], expression: node };
        }
        case 'SequenceExpression': {
            const tasks = [];
            node.expressions.forEach((expr) => {
                const result = parseExpression(expr, env, code);
                tasks.push(...result.tasks);
            });
            return { tasks, expression: node };
        }
        case 'MemberExpression': {
            const object = parseExpression(node.object, env, code);
            const property = node.computed ? parseExpression(node.property, env, code) : { tasks: [], expression: node.property };
            return { tasks: [...object.tasks, ...property.tasks], expression: node };
        }
        case 'CallExpression': {
            const tasks = [];
            const callee = node.callee;
            const args = node.arguments.map((arg) => parseExpression(arg, env, code));
            args.forEach((arg) => tasks.push(...arg.tasks));

            const calleePropertyName = callee.property?.name;
            const calleeName = callee.name;

            if (callee.object?.name === 'console' && calleePropertyName === 'log') {
                const logTask = createTask({
                    type: 'SYNC',
                    name: 'console.log',
                    line: node.loc.start.line,
                    execute: (runtime) => {
                        const values = node.arguments.map((arg) => evaluateExpression(arg, runtime, code));
                        return { message: values.join(' '), childTasks: [] };
                    }
                });
                tasks.push(logTask);
                return { tasks, expression: undefined };
            }

            const isGlobalTimeout = calleeName === 'setTimeout' || (callee.object?.name === 'window' && calleePropertyName === 'setTimeout');
            const isGlobalInterval = calleeName === 'setInterval' || (callee.object?.name === 'window' && calleePropertyName === 'setInterval');
            const isGlobalClearInterval = calleeName === 'clearInterval' || (callee.object?.name === 'window' && calleePropertyName === 'clearInterval');

            if (isGlobalTimeout) {
                const callbackTasks = parseCallbackToTasks(node.arguments[0], env, code);
                const timeoutTask = createTask({
                    type: 'MACRO_TASK',
                    name: 'setTimeout callback',
                    line: node.loc.start.line,
                    childTasks: callbackTasks,
                    execute: () => ({ childTasks: [] })
                });
                tasks.push(timeoutTask);
                return { tasks, expression: undefined };
            }

            if (isGlobalInterval) {
                const callbackTasks = parseCallbackToTasks(node.arguments[0], env, code);
                const intervalId = `interval_${Math.random().toString(36).slice(2)}`;
                const intervalTask = createTask({
                    type: 'MACRO_TASK',
                    name: 'setInterval callback',
                    line: node.loc.start.line,
                    childTasks: callbackTasks,
                    repeating: true,
                    intervalId,
                    execute: () => ({ childTasks: [] })
                });
                tasks.push(intervalTask);
                return { tasks, expression: { type: 'INTERVAL_ID', id: intervalId } };
            }

            if (isGlobalClearInterval) {
                const arg = node.arguments[0] ? parseExpression(node.arguments[0], env, code) : { tasks: [], expression: undefined };
                tasks.push(...arg.tasks);
                const clearTask = createTask({
                    type: 'SYNC',
                    name: 'clearInterval',
                    line: node.loc.start.line,
                    execute: (runtime) => {
                        const id = arg.expression ? evaluateExpression(arg.expression, runtime, code) : undefined;
                        if (id) {
                            runtime.clearedIntervals.add(id);
                        }
                        return { childTasks: [] };
                    }
                });
                tasks.push(clearTask);
                return { tasks, expression: undefined };
            }

            if (calleePropertyName === 'then' || calleePropertyName === 'catch') {
                const callback = node.arguments[0];
                const callbackTasks = parseCallbackToTasks(callback, env, code);
                const microTask = createTask({
                    type: 'MICRO_TASK',
                    name: `Promise.${calleePropertyName}()`,
                    line: node.loc.start.line,
                    childTasks: callbackTasks,
                    execute: () => ({ childTasks: [] })
                });
                tasks.push(microTask);
                return { tasks, expression: undefined };
            }

            if (callee.type === 'Identifier' && env.getFunction(callee.name)) {
                const fnValue = env.getFunction(callee.name);
                const callTask = createTask({
                    type: 'SYNC',
                    name: `${callee.name}()`,
                    line: node.loc.start.line,
                    childTasks: fnValue.bodyTasks,
                    execute: () => ({ childTasks: [] })
                });
                tasks.push(callTask);
                return { tasks, expression: undefined };
            }

            if (callee.type === 'ArrowFunctionExpression' || callee.type === 'FunctionExpression') {
                const fnValue = parseExpression(callee, env, code).expression;
                if (fnValue?.type === 'FUNCTION_VALUE') {
                    const callTask = createTask({
                        type: 'SYNC',
                        name: 'anonymous function call',
                        line: node.loc.start.line,
                        childTasks: fnValue.bodyTasks,
                        execute: () => ({ childTasks: [] })
                    });
                    tasks.push(callTask);
                    return { tasks, expression: undefined };
                }
            }

            return { tasks, expression: node };
        }
        default:
            return { tasks: [], expression: node };
    }
};

export const parseCodeToTasks = (code) => {
    try {
        const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true, ranges: true });
        const env = createEnv();
        collectDeclarations(ast.body, env, code);
        return parseStatements(ast.body, env, code);
    } catch (err) {
        return [{ type: 'ERROR', message: err.message }];
    }
};
