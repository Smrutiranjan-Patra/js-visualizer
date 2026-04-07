import React from 'react';
import { ShareAltOutlined, NodeIndexOutlined } from '@ant-design/icons';
import EventLoop from './EventLoop';
import WebApiBridge from './WebApi';

const EngineBridge = () => {
    return (
        <div className="engine-bridge-container">
            <div className="bridge-header">
                <div className="header-label">
                    <NodeIndexOutlined className="bridge-icon" />
                    <span>ENGINE BRIDGE</span>
                </div>
                <div className="bridge-meta">ASYNC PROCESSING</div>
            </div>

            <div className="bridge-content">
                {/* Left Side: The Event Loop Status */}
                <div className="bridge-section loop-side">
                    <EventLoop />
                </div>

                {/* Vertical Divider Line */}
                <div className="bridge-divider"></div>

                {/* Right Side: The Web API Holder */}
                <div className="bridge-section webapi-side">
                    <WebApiBridge />
                </div>
            </div>
        </div>
    );
};

export default EngineBridge;