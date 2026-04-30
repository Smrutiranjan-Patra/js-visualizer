import React, { useEffect } from 'react'
import logo from '../assets/logo.png'
import { PauseCircleOutlined, PlayCircleOutlined, StepForwardOutlined, UndoOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import useStore from '../store/useStore';


function Header() {

    const {
        runSimulation,
        step,
        reset,
        isDarkModeEnabled,
        isAutoRunning,
        startAutoRun,
        stopAutoRun,
        toggleTheme,
    } = useStore();

    useEffect(() => {
        if (!isAutoRunning) {
            return undefined;
        }

        const autoRunTimer = window.setInterval(() => {
            useStore.getState().step();
        }, 700);

        return () => window.clearInterval(autoRunTimer);
    }, [isAutoRunning]);

    const handleAutoRun = () => {
        if (isAutoRunning) {
            stopAutoRun();
            return;
        }

        startAutoRun();
    };

    return (
        <div className='header-wrapper'>
            <div className='logo-wrapper'>
                <img src={logo} alt="Logo" className='logo' />
                <p className='name'>JS VISUALIZER</p>
                <button
                    className="theme-toggle"
                    type="button"
                    onClick={toggleTheme}>
                    {isDarkModeEnabled ? <SunOutlined /> : <MoonOutlined />}
                </button>
            </div>

            <div className="actions">
                <button className="btn btn-primary" onClick={runSimulation}> <PlayCircleOutlined /> Run </button>
                <button className="btn btn-auto" onClick={handleAutoRun}>
                    {isAutoRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    {isAutoRunning ? 'Pause' : 'Auto Run'}
                </button>
                <button className="btn btn-success" onClick={step}> <StepForwardOutlined />Step</button>
                <button className="btn btn-secondary" onClick={reset}> < UndoOutlined />Reset</button>
            </div>
        </div>
    )
}

export default Header
