import React from 'react';
import Editor from '@monaco-editor/react';
import { Card } from 'antd';
import useEventLoopStore from '../store/useStore';

const CodeEditor = () => {
    const { setCode } = useEventLoopStore();

    const handleEditorChange = (value) => {
        setCode(value); // Save the raw string to Zustand
    };

    return (
        <Editor
            height="580px"
            defaultLanguage="javascript"
            theme="vs-dark"
            defaultValue={``}
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