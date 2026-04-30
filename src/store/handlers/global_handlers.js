import { parseCodeToTasks } from "../../engine/parser.js";

const runSimulation = (set, get) => {
    const { code } = get();
    const parsedTasks = parseCodeToTasks(code);

    set({
        // Initialize the simulation state
        callStack: parsedTasks.filter(t => t.type === 'SYNC').reverse(),
        webApi: parsedTasks.filter(t => t.type !== 'SYNC'),
        microtaskQueue: [],
        taskQueue: [],
        logs: [],
        isExecuting: true
    });
}

const step = (set, get) => {
    const { callStack, microtaskQueue, taskQueue, webApi, addLog } = get();

    // 1. Process Call Stack (LIFO)
    if (callStack.length > 0) {
        const newStack = [...callStack];
        const task = newStack.pop();

        if (task.type === 'SYNC') {
            addLog(task.metadata?.val || 'undefined', 'SYNC');
        }

        set({ callStack: newStack });
        return;
    }

    // 2. If Stack is empty, Web APIs move to Queues (Simulation shortcut)
    // In a real browser, this happens via timers, but for step-by-step:
    if (webApi.length > 0) {
        const nextAsync = webApi[0];
        const remainingWeb = webApi.slice(1);

        if (nextAsync.type === 'MICRO_TASK') {
            set({
                microtaskQueue: [...microtaskQueue, nextAsync],
                webApi: remainingWeb
            });
        } else {
            set({
                taskQueue: [...taskQueue, nextAsync],
                webApi: remainingWeb
            });
        }
        return;
    }

    // 3. If Stack is empty, check Microtask Queue (FIFO)
    if (microtaskQueue.length > 0) {
        const [nextMicro, ...rest] = microtaskQueue;
        addLog(`Moving Microtask: ${nextMicro.name}`, 'MICRO');
        set({
            callStack: [nextMicro],
            microtaskQueue: rest
        });
        return;
    }

    // 4. If Microtasks are empty, check Task Queue (FIFO)
    if (taskQueue.length > 0) {
        const [nextTask, ...rest] = taskQueue;
        addLog(`Moving Task: ${nextTask.name}`, 'MACRO');
        set({
            callStack: [nextTask],
            taskQueue: rest
        });
        return;
    }

    // 5. Everything Finished
    set({ isExecuting: false });
    addLog("Execution Finished.", "SYNC");
}

const reset = (set) => {
    set({
        callStack: [],
        webApi: [],
        microtaskQueue: [],
        taskQueue: [],
        logs: [],
        isExecuting: false,
        isPaused: true
    });
}

export {
    runSimulation,
    step,
    reset
}
