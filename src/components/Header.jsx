import React from 'react'
import logo from '../assets/logo.png'
import { PlayCircleOutlined, StepForwardOutlined, UndoOutlined } from '@ant-design/icons';
import useStore from '../store/useStore';


function Header() {

    const { runSimulation, step, reset } = useStore();

    return (
        <div className='header-wrapper'>
            <div className='logo-wrapper'>
                <img src={logo} alt="Logo" className='logo' />
                <p className='name'>JS VISUALIZER</p>
            </div>

            <div className="actions">
                <button className="btn btn-primary" onClick={runSimulation}> <PlayCircleOutlined /> Run </button>
                <button className="btn btn-success" onClick={step}> <StepForwardOutlined />Step</button>
                <button className="btn btn-secondary" onClick={reset}> < UndoOutlined />Reset</button> 
            </div>
        </div>
    )
}

export default Header