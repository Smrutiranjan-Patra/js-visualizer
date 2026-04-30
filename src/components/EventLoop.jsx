import React from 'react';
import useStore from '../store/useStore';
import { SyncOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const EventLoop = () => {
    const isExecuting = useStore((state) => state.isExecuting);

    return (
        <div className="event-loop-visual">
            <MotionDiv
                animate={{ rotate: isExecuting ? 360 : 0 }}
                transition={isExecuting ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
                className="loop-icon-wrapper"
            >
                <SyncOutlined className="loop-icon" />
            </MotionDiv>
            <div className="loop-status">
                {isExecuting ? "ENGINE RUNNING" : "ENGINE IDLE"}
            </div>
        </div>
    );
};

export default EventLoop;
