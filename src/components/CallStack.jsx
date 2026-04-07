import React from 'react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const CallStack = () => {
    // REMOVED the broken comparison function. 
    // This is now a clean reactive selector.
    const callStack = useStore((state) => state.callStack);

    return (
        <div className="call-stack">
            <AnimatePresence mode="popLayout">
                {callStack.map((task) => (
                    <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="task-block sync-block"
                    >
                        {task.name}
                    </motion.div>
                ))}
            </AnimatePresence>
            {callStack.length === 0 && <div className="empty-label">Empty Stack</div>}
        </div>
    );
};

export default CallStack;