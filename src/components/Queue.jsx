import React from 'react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';

const MotionDiv = motion.div;

const Queue = ({ type, title }) => {
    // Dynamically select the correct array based on the 'type' prop
    const tasks = useStore((state) =>
        type === 'micro' ? state.microtaskQueue : state.taskQueue
    );

    return (
        <div className={type === 'micro' ? "micro-task-queue" : "task-queue"}>
            <div className="panel-header">
                <span>{title}</span>
                <Popover content={"This is sample content"} title={title}>
                    <button className="panel-info-button" type="button" aria-label={`${title} info`}>
                        <InfoCircleOutlined className="panel-info-icon" />
                    </button>
                </Popover>
            </div>
            <div className="queue-inner">
                <AnimatePresence>
                    {tasks.map((task) => (
                        <MotionDiv
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`task-block ${type}-block`}
                        >
                            {task.name}
                        </MotionDiv>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Queue;
