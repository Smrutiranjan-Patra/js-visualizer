import React from 'react';

// styles
import './styles/App.css';

// components
import Header from './components/Header.jsx';
import CodeEditor from "./components/Editor.jsx"
import Console from './components/Console.jsx';

import useStore from './store/useStore';

function App() {

  const store = useStore()

  return (
    <div className='wrapper'>
      <Header />
      <div className="container">
        <div className='left-container'>
          <div className='code-editor'>
            <CodeEditor />
          </div>
          <div className="output-div">
            <Console />
          </div>
        </div>
        <div className="right-container">
          <div className='call-stack'> Call Stack</div>
          <div className="micro-task-queue"> Mirco Stack Queue</div>
          <div className='task-queue'> Task Queue </div>
        </div>
      </div>
    </div>
  )
}

export default App
