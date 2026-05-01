import { parseCodeToTasks } from "../../engine/parser.js";

const setCode = (set, newCode) => {
    set({ code: newCode, activeLine: null });
}

const setAutoRunSpeed = (set, speed) => {
    set({ autoRunSpeed: Number(speed) });
}

const toggleTheme = (set) => {
    set((state) => {
        const isDarkModeEnabled = !state.isDarkModeEnabled;

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('theme', isDarkModeEnabled ? 'dark' : 'light');
        }

        return { isDarkModeEnabled };
    });
}

const addLog = (set, message, type) => {
    set((state) => ({
        logs: [...state.logs, {
            message,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]
    }));
}

const resetLogs = (set) => {
    set({ logs: [] });
}

const runSimulation = (set, get) => {
    const { code } = get();
    const parsedTasks = parseCodeToTasks(code);
    const callStack = parsedTasks.filter(t => t.type === 'SYNC').reverse();

    set({
        // Initialize the simulation state
        callStack,
        webApi: parsedTasks.filter(t => t.type !== 'SYNC'),
        microtaskQueue: [],
        taskQueue: [],
        logs: [],
        isExecuting: true,
        isAutoRunning: false,
        isPaused: true,
        activeLine: callStack.at(-1)?.line ?? parsedTasks[0]?.line ?? null,
        runtime: {
            variables: {},
            clearedIntervals: new Set(),
            nextIntervalId: 1
        }
    });
}

const step = (set, get) => {
    const { callStack, microtaskQueue, taskQueue, webApi, addLog, runtime } = get();

    // 1. Process Call Stack (LIFO)
    if (callStack.length > 0) {
        const newStack = [...callStack];
        const task = newStack.pop();
        const executionResult = task.execute ? task.execute(runtime) : {};

        if (executionResult.message != null) {
            addLog(executionResult.message, 'SYNC');
        }

        const childTasks = [ ...(task.childTasks ?? []), ...(executionResult.childTasks ?? []) ];
        const syncChildren = childTasks.filter((child) => child.type === 'SYNC');
        const microChildren = childTasks.filter((child) => child.type === 'MICRO_TASK');
        const macroChildren = childTasks.filter((child) => child.type === 'MACRO_TASK');

        const updatedState = {
            callStack: [...newStack, ...syncChildren.reverse()],
            microtaskQueue: [...microtaskQueue, ...microChildren],
            taskQueue: [...taskQueue, ...macroChildren],
            activeLine: newStack.at(-1)?.line ?? syncChildren[0]?.line ?? null
        };

        if (task.repeating && task.intervalId && !runtime.clearedIntervals.has(task.intervalId)) {
            updatedState.taskQueue = [...updatedState.taskQueue, task];
        }

        if (runtime.clearedIntervals.size > 0) {
            updatedState.taskQueue = updatedState.taskQueue.filter((queuedTask) => {
                return !queuedTask.repeating || !runtime.clearedIntervals.has(queuedTask.intervalId);
            });
        }

        set(updatedState);
        return;
    }

    // 2. If Stack is empty, flush Microtasks first.
    if (microtaskQueue.length > 0) {
        const [nextMicro, ...rest] = microtaskQueue;
        set({
            callStack: [nextMicro],
            microtaskQueue: rest,
            activeLine: nextMicro.line ?? null
        });
        return;
    }

    // 3. If Stack is empty, Web APIs move to Queues (Simulation shortcut)
    // In a real browser, this happens via timers, but for step-by-step:
    if (webApi.length > 0) {
        const nextAsync = webApi[0];
        const remainingWeb = webApi.slice(1);

        if (nextAsync.type === 'MICRO_TASK') {
            set({
                microtaskQueue: [...microtaskQueue, nextAsync],
                webApi: remainingWeb,
                activeLine: nextAsync.line ?? null
            });
        } else {
            set({
                taskQueue: [...taskQueue, nextAsync],
                webApi: remainingWeb,
                activeLine: nextAsync.line ?? null
            });
        }
        return;
    }

    // 4. If Microtasks are empty, check Task Queue (FIFO)
    if (taskQueue.length > 0) {
        const [nextTask, ...rest] = taskQueue;
        set({
            callStack: [nextTask],
            taskQueue: rest,
            activeLine: nextTask.line ?? null
        });
        return;
    }

    // 5. Everything Finished
    set({ isExecuting: false, isAutoRunning: false, isPaused: true, activeLine: null });
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
        isPaused: true,
        isAutoRunning: false,
        activeLine: null,
        runtime: {
            variables: {},
            clearedIntervals: new Set(),
            nextIntervalId: 1
        }
    });
}

const getInitialDarkMode = () => {
    if (typeof window === 'undefined') {
        return true;
    }

    const savedTheme = window.localStorage.getItem('theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme === 'dark';
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true;
};

const startAutoRun = (set, get) => {
    if (!get().isExecuting) {
        runSimulation(set, get);
    }

    set({ isAutoRunning: true, isPaused: false });
}

const stopAutoRun = (set) => {
    set({ isAutoRunning: false, isPaused: true });
}

export {
    setCode,
    setAutoRunSpeed,
    toggleTheme,
    addLog,
    resetLogs,
    runSimulation,
    step,
    reset,
    getInitialDarkMode,
    startAutoRun,
    stopAutoRun
}
