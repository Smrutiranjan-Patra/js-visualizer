import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

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
  
  const currentYear = new Date().getFullYear();

  const appTheme = {
    algorithm: isDarkModeEnabled ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#38bdf8',
      colorBgElevated: isDarkModeEnabled ? '#111827' : '#ffffff',
      colorText: isDarkModeEnabled ? '#cbd5e1' : '#475569',
      colorTextHeading: isDarkModeEnabled ? '#f8fafc' : '#0f172a',
      colorBorderSecondary: isDarkModeEnabled ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.25)',
    },
    components: {
      Popover: {
        colorBgElevated: isDarkModeEnabled ? '#111827' : '#ffffff',
        colorText: isDarkModeEnabled ? '#cbd5e1' : '#475569',
        colorTextHeading: isDarkModeEnabled ? '#f8fafc' : '#0f172a',
      },
    },
  };

  useEffect(() => {
    const theme = isDarkModeEnabled ? 'dark' : 'light';

    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle('light-mode', !isDarkModeEnabled);
  }, [isDarkModeEnabled]);

  return (
    <ConfigProvider theme={appTheme}>
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
        <footer className="app-footer">
          <span>Copyright © {currentYear} Smrutiranjan Patra</span>
        </footer>
      </div>
    </ConfigProvider>
  )
}

export default App
