import React, { useState, useEffect, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';

function PythonCodeEditor({ onCodeChange, initialCode, isSidebarExpanded, onExecuteCode }) {
  const [code, setCode] = useState(initialCode || ''); // Local state for the editor code
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize the Monaco editor theme
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('custom-transparent', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#00000000', // Transparent background
        },
      });
    });
  }, []);

  // Update the editor layout when the sidebar state changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [isSidebarExpanded]);

  // Handle real-time changes in the editor
  const handleEditorChange = (value) => {
    setCode(value); // Update the local state
    if (onCodeChange) {
      onCodeChange(value); // Inform the parent of changes (optional, for real-time feedback)
    }
  };

  // Handle the "Execute Code" button click
  const handleExecuteCode = () => {
    if (onExecuteCode) {
      onExecuteCode(code); // Pass the current code to the parent component's handler
    }
  };

  return (
    <div
      className="mb-10 mt-10"
      ref={editorContainerRef}
      style={{
        width: isSidebarExpanded ? 'calc(100% - 21rem)' : 'calc(100% - 5rem)',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Monaco Editor */}
      <Editor
        height="400px"
        defaultLanguage="python"
        value={code} // Use local state for the editor content
        onChange={handleEditorChange}
        theme="custom-transparent"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
        }}
        onMount={(editor) => (editorRef.current = editor)}
      />

      {/* Execute Button */}
      <button
        onClick={handleExecuteCode}
        className="btn btn-outline btn-warning mt-8"
        style={{ width: '100%' }}
      >
        Execute Code
      </button>
    </div>
  );
}

export default PythonCodeEditor;