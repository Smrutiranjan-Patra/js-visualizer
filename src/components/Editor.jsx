import React from 'react';
import Editor from '@monaco-editor/react';
import useEventLoopStore from '../store/useStore';

const CodeEditor = () => {
    const { setCode, isDarkModeEnabled } = useEventLoopStore();

    const handleEditorChange = (value) => {
        setCode(value); // Save the raw string to Zustand
    };

    return (
        <Editor
            height="580px"
            defaultLanguage="javascript"
            theme={isDarkModeEnabled ? 'vs-dark' : 'light'}
            defaultValue={"// Experiment and visualize your code here"}
            onChange={handleEditorChange}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true, // Crucial for responsiveness in AntD Col
            }}
        />
    );
};

export default CodeEditor;
