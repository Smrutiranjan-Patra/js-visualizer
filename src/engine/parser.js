import * as acorn from 'acorn';

export const parseCodeToTasks = (code) => {
    const tasks = [];
    try {
        const ast = acorn.parse(code, { ecmaVersion: 2020 });

        // Simple walker to find expression statements
        ast.body.forEach((node) => {
            if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
                const callee = node.expression.callee;

                // Detect console.log
                if (callee.object?.name === 'console' && callee.property?.name === 'log') {
                    tasks.push({
                        id: Math.random().toString(36),
                        type: 'SYNC',
                        name: `console.log(${node.expression.arguments[0]?.value || ''})`,
                        metadata: { val: node.expression.arguments[0]?.value }
                    });
                }

                // Detect setTimeout
                if (callee.name === 'setTimeout') {
                    tasks.push({
                        id: Math.random().toString(36),
                        type: 'MACRO_TASK',
                        name: 'setTimeout callback',
                        metadata: { delay: node.expression.arguments[1]?.value || 0 }
                    });
                }

                // Detect Promise.resolve().then()
                if (callee.property?.name === 'then') {
                    tasks.push({
                        id: Math.random().toString(36),
                        type: 'MICRO_TASK',
                        name: 'Promise.then()',
                    });
                }
            }
        });
        return tasks;
    } catch (err) {
        return [{ type: 'ERROR', message: err.message }];
    }
};