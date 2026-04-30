import React from 'react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';

const MotionDiv = motion.div;

const callStackInfo = (
    <div className="popover-description">
        Holds synchronous functions that are currently being executed. The top item runs first, then leaves the stack when it finishes.
    </div>
);

const CallStack = () => {
    // REMOVED the broken comparison function. 
    // This is now a clean reactive selector.
    const callStack = useStore((state) => state.callStack);

    return (
        <div className="call-stack">
            <div className="panel-header">
                <span>Call Stack</span>
                <Popover content={callStackInfo} title="Call Stack">
                    <button className="panel-info-button" type="button" aria-label="Call Stack info">
                        <InfoCircleOutlined className="panel-info-icon" />
                    </button>
                </Popover>
            </div>
            <AnimatePresence mode="popLayout">
                {callStack.map((task) => (
                    <MotionDiv
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="task-block sync-block"
                    >
                        {task.name}
                    </MotionDiv>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CallStack;
