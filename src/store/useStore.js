import { create } from 'zustand';
import { parseCodeToTasks } from '../engine/parser';
import { runSimulation, step } from './handlers/global_handlers.js';

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

    // --- ACTIONS ---

    setCode: (newCode) => set({ code: newCode }),

    addLog: (message, type) => set((state) => ({
        logs: [...state.logs, {
            message,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]
    })),

    resetLogs: () => set({ logs: [] }),

    step: (...args) => step(set, get, ...args),

    runSimulation: (...args) => runSimulation(set, get, ...args)
}));

export default useStore;