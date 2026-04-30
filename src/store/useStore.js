import { create } from 'zustand';
import { runSimulation, step, reset } from './handlers/global_handlers.js';

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
    isDarkModeEnabled: getInitialDarkMode(),

    // --- ACTIONS ---

    setCode: (newCode) => set({ code: newCode }),

    toggleTheme: () => set((state) => {
        const isDarkModeEnabled = !state.isDarkModeEnabled;

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('theme', isDarkModeEnabled ? 'dark' : 'light');
        }

        return { isDarkModeEnabled };
    }),

    addLog: (message, type) => set((state) => ({
        logs: [...state.logs, {
            message,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]
    })),

    resetLogs: () => set({ logs: [] }),

    runSimulation: (...args) => runSimulation(set, get, ...args),
    
    step: (...args) => step(set, get, ...args),
    
    reset: (...args) => reset(set, get, ...args),
}));

export default useStore;
