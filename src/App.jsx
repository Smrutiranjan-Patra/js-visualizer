import React, { useEffect } from 'react';

// styles
import './styles/App.scss';

// components
import Header from './components/Header.jsx';
import CodeEditor from "./components/Editor.jsx"
import Console from './components/Console.jsx';
import CallStack from './components/CallStack.jsx';
import Queue from './components/Queue.jsx';
import EngineBridge from './components/EngineBridge.jsx';

import useStore from './store/useStore';

function App() {

  const isDarkModeEnabled = useStore((state) => state.isDarkModeEnabled);

  useEffect(() => {
    const theme = isDarkModeEnabled ? 'dark' : 'light';

    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle('light-mode', !isDarkModeEnabled);
  }, [isDarkModeEnabled]);

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
          <CallStack />
          <EngineBridge />
          <Queue type="micro" title="Microtask Queue" />
          <Queue type="macro" title="Task Queue" />
        </div>
      </div>
    </div>
  )
}

export default App
