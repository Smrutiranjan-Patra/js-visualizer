import { create } from 'zustand';
import {
    addLog,
    getInitialDarkMode,
    reset,
    resetLogs,
    runSimulation,
    setCode,
    startAutoRun,
    step,
    stopAutoRun,
    toggleTheme
} from './handlers/global_handlers.js';

// Notice the (set, get) here - this is crucial
const useStore = create((set, get) => ({
    // --- STATE ---
    callStack: [],
    webApi: [],
    microtaskQueue: [],
    taskQueue: [],
    logs: [], // Using 'logs' to match your runSimulation logic
    code: '',
    isExecuting: false,
    isPaused: true,
    isAutoRunning: false,
    isDarkModeEnabled: getInitialDarkMode(),

    // --- ACTIONS ---

    setCode: (...args) => setCode(set, ...args),

    toggleTheme: (...args) => toggleTheme(set, ...args),

    addLog: (...args) => addLog(set, ...args),

    resetLogs: (...args) => resetLogs(set, ...args),

    runSimulation: (...args) => runSimulation(set, get, ...args),

    startAutoRun: (...args) => startAutoRun(set, get, ...args),

    stopAutoRun: (...args) => stopAutoRun(set, ...args),

    step: (...args) => step(set, get, ...args),

    reset: (...args) => reset(set, get, ...args),
}));

export default useStore;
