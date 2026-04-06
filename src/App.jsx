import React from 'react';

// styles
import './styles/App.css';

// components
import Header from './components/Header.jsx';
import CodeEditor from "./components/Editor.jsx"
import Console from './components/Console.jsx';
import CallStack from './components/CallStack.jsx';
import Queue from './components/Queue.jsx';

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
          <div className='call-stack'>
            <CallStack />
          </div>
          <div className="micro-task-queue">
            <Queue type="micro" title="Microtask Queue" />
          </div>
          <div className='task-queue'>
            <Queue type="macro" title="Task Queue" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
