import React, { useState } from "react";
import FolderTree from "../../components/CRYPTO/Library/Folder_Tree";
import FileContent from "../../components/CRYPTO/Library/File_Content";

function Library({ isSidebarExpanded }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const formatFilePath = (path) => {
    if (!path) return "";
    return path.replace(/^\//, "").replaceAll("/", "   -   ").replaceAll(".py", "");
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: "calc(100vh - 6rem)", // Matches the sidebar height
        marginBottom: "1rem",
      }}
    >
      {/* Main Title */}
      <h1 className="text-3xl font-bold mb-6 text-neutral-content text-center">
        Library
      </h1>

      {/* File Path or Placeholder */}
      {selectedFile && (
        <h3 className="text-lg font-semibold text-neutral-content text-center mb-4">
          {formatFilePath(selectedFile)}
        </h3>
      )}

      {/* Conditional Divider Placement */}
      <div className="divider" style={{ marginTop: selectedFile ? "0.5rem" : "1rem" }}></div>

      <div className="flex flex-grow mt-6">
        {/* Folder Tree */}
        <div className={`w-1/8 ${isSidebarExpanded ? "w-1/8" : "w-1/4"}`}>
          <FolderTree onFileSelect={(fileName) => setSelectedFile(fileName)} />
        </div>

        {/* File Content */}
        <div className={`w-7/8 ${isSidebarExpanded ? "w-7/8" : "w-3/4"}`}>
          {selectedFile ? (
            <FileContent
              fileName={selectedFile}
              isSidebarExpanded={isSidebarExpanded}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-content">
              Select a file to view its content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;