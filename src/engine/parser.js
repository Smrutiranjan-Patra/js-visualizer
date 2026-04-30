import * as acorn from 'acorn';

export const parseCodeToTasks = (code) => {
    const tasks = [];
    try {
        const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });

        // Simple walker to find expression statements
        ast.body.forEach((node) => {
            if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
                const callee = node.expression.callee;
                const calleePropertyName = callee.property?.name;
                const calleeName = callee.name;

                const taskMap = {
                    log: callee.object?.name === 'console' && calleePropertyName === 'log' ? {
                        type: 'SYNC',
                        name: `console.log(${node.expression.arguments[0]?.value || ''})`,
                        metadata: { val: node.expression.arguments[0]?.value }
                    } : null,
                    setTimeout: calleeName === 'setTimeout' ? {
                        type: 'MACRO_TASK',
                        name: 'setTimeout callback',
                        metadata: { delay: node.expression.arguments[1]?.value || 0 }
                    } : null,
                    setInterval: calleeName === 'setInterval' ? {
                        type: 'MACRO_TASK',
                        name: 'setInterval callback',
                        metadata: { interval: node.expression.arguments[1]?.value || 0 }
                    } : null,
                    then: calleePropertyName === 'then' ? {
                        type: 'MICRO_TASK',
                        name: 'Promise.then()',
                    } : null,
                    catch: calleePropertyName === 'catch' ? {
                        type: 'MICRO_TASK',
                        name: 'Promise.catch()',
                    } : null
                };

                Object.values(taskMap).forEach((taskConfig) => {
                    if (taskConfig) {
                        tasks.push({
                            id: Math.random().toString(36),
                            line: node.loc.start.line,
                            ...taskConfig
                        });
                    }
                });
            }
        });
        return tasks;
    } catch (err) {
        return [{ type: 'ERROR', message: err.message }];
    }
};
