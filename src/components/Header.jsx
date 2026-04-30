import React, { useEffect } from 'react'
import logo from '../assets/logo.png'
import { GithubOutlined, PauseCircleOutlined, PlayCircleOutlined, StepForwardOutlined, UndoOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import useStore from '../store/useStore';


function Header() {

    const {
        runSimulation,
        step,
        reset,
        isDarkModeEnabled,
        isAutoRunning,
        autoRunSpeed,
        setAutoRunSpeed,
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
        }, autoRunSpeed);

        return () => window.clearInterval(autoRunTimer);
    }, [isAutoRunning, autoRunSpeed]);

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
                <a
                    className="header-icon-link"
                    href="https://github.com/Smrutiranjan-Patra/js-visualizer"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open GitHub repository"
                    title="Open GitHub repository"
                >
                    <GithubOutlined />
                </a>
                <button
                    className="theme-toggle"
                    type="button"
                    onClick={toggleTheme}>
                    {isDarkModeEnabled ? <SunOutlined /> : <MoonOutlined />}
                </button>
            </div>

            <div className="actions">
                <button className="btn btn-primary" onClick={runSimulation}> <PlayCircleOutlined /> Prepare </button>
                <button className="btn btn-auto" onClick={handleAutoRun}>
                    {isAutoRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    {isAutoRunning ? 'Pause Playback' : 'Play Timeline'}
                </button>
                <label className="speed-control">
                    <span>Speed</span>
                    <select
                        value={autoRunSpeed}
                        onChange={(event) => setAutoRunSpeed(event.target.value)}
                    >
                        <option value={1200}>Slow</option>
                        <option value={700}>Normal</option>
                        <option value={350}>Fast</option>
                    </select>
                </label>
                <button className="btn btn-success" onClick={step}> <StepForwardOutlined />Next Step</button>
                <button className="btn btn-secondary" onClick={reset}> < UndoOutlined />Start Over</button>
            </div>
        </div>
    )
}

export default Header
