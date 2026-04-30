import React from 'react';
import useStore from '../store/useStore';
import { CloudServerOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

const WebApiBridge = () => {
    const webApi = useStore((state) => state.webApi);

    return (
        <div className="web-api-bridge">
            <div className="bridge-label">
                <CloudServerOutlined /> <span>WEB API Processing</span>
            </div>
            <div className="bridge-tasks">
                <AnimatePresence>
                    {webApi.map((task) => (
                        <MotionDiv
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="bridge-task-pill"
                        >
                            {task.name}
                        </MotionDiv>
                    ))}
                </AnimatePresence>
                {webApi.length === 0 && <span className="empty-hint">Waiting...</span>}
            </div>
        </div>
    );
};

export default WebApiBridge
