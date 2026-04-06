import React, { useEffect, useRef } from 'react';
import { CodeOutlined, DeleteOutlined } from '@ant-design/icons';
import useStore from '../store/useStore';

const Console = () => {

    const { logs, resetLogs } = useStore();

    const scrollRef = useRef(null);

    // Auto-scroll logic remains the same
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <>
            <div className="console-header">
                <div className="header-left">
                    <CodeOutlined style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
                    <span>CONSOLE OUTPUT</span>
                </div>
                <button className="btn btn-secondary" onClick={resetLogs}> < DeleteOutlined />Clear</button>
            </div>

            <div className="console-body" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="console-empty">// Execution output will appear here...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="console-line">
                            <span className="console-prompt">{'> '}</span>
                            <span className={`log-text ${log.type}`}>{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default Console;