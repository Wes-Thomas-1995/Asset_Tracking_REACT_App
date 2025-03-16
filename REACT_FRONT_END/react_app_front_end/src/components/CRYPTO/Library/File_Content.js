import React, { useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";

const FileContent = ({ fileName, isSidebarExpanded }) => {
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Define the custom transparent theme for Monaco Editor
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme("custom-transparent", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#00000000", // Transparent background
        },
      });
    });
  }, []);

  useEffect(() => {
    if (!fileName) return;

    const fetchFileContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/API/FILE_CONTENT/?file=${encodeURIComponent(fileName)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFileContent(data.file_content);
      } catch (error) {
        console.error("Error fetching file content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [fileName]);

  const saveFileContent = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/API/SAVE_FILE/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: fileName, content: fileContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file content:", error);
      alert("Failed to save the file.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <button className="btn btn-primary loading">Loading...</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor */}
      <div className="flex-grow">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={fileContent || ""}
          onChange={(value) => setFileContent(value)}
          theme="custom-transparent" // Apply transparent theme
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Save Button */}
      <button
        className={`btn ${isSaving ? "loading" : "btn-primary"} mt-4`}
        onClick={saveFileContent}
        disabled={isSaving}
        style={{
          alignSelf: "center",
          width: "80%",
        }}
      >
        Save File
      </button>
    </div>
  );
};

export default FileContent;