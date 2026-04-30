import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import useEventLoopStore from '../store/useStore';

const CodeEditor = () => {
    const { setCode, isDarkModeEnabled, activeLine } = useEventLoopStore();
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const decorationCollectionRef = useRef(null);
    const decorationIdsRef = useRef([]);

    const handleEditorChange = (value) => {
        setCode(value); // Save the raw string to Zustand
    };

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        decorationCollectionRef.current = editor.createDecorationsCollection?.() ?? null;
    };

    useEffect(() => {
        const editor = editorRef.current;
        const monaco = monacoRef.current;

        if (!editor || !monaco) {
            return;
        }

        const decorations = activeLine ? [{
            range: new monaco.Range(activeLine, 1, activeLine, 1),
            options: {
                isWholeLine: true,
                className: 'active-execution-line',
                glyphMarginClassName: 'active-execution-glyph',
            },
        }] : [];

        if (decorationCollectionRef.current) {
            decorationCollectionRef.current.set(decorations);
            return;
        }

        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
    }, [activeLine]);

    return (
        <Editor
            height="100%"
            defaultLanguage="javascript"
            theme={isDarkModeEnabled ? 'vs-dark' : 'light'}
            defaultValue={"// Experiment and visualize your code here"}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
                glyphMargin: true,
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
