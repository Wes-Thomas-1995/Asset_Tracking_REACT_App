import React, { useEffect, useState } from "react";

const FolderTree = ({ onFileSelect }) => {
  const [folderTree, setFolderTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolderTree = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/API/FOLDER_TREE/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFolderTree(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching folder tree:", error);
        setLoading(false);
      }
    };

    fetchFolderTree();
  }, []);

  const renderTree = (node, currentPath = "") => {
    if (!node || typeof node !== "object") return null;

    return Object.keys(node).map((key) => {
      if (key === "files") {
        return node[key]
          .filter((file) => file !== ".DS_Store") // Skip .DS_Store files
          .map((file, index) => {
            const filePath = `${currentPath}/${file}`; // Construct full file path
            return (
              <li key={`file-${index}`}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onFileSelect(filePath); // Trigger file selection with full path
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  {file}
                </a>
              </li>
            );
          });
      }

      const folderPath = `${currentPath}/${key}`; // Construct full folder path
      return (
        <li key={`folder-${key}`}>
          <details>
            <summary>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
              {key}
            </summary>
            <ul>{renderTree(node[key], folderPath)}</ul>
          </details>
        </li>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button className="btn btn-primary loading">Loading...</button>
      </div>
    );
  }

  return (
    <ul className="menu menu-xs bg-base-200 rounded-lg w-full max-w-xs text-neutral-content">
      {folderTree ? renderTree(folderTree) : <p>No folder data found</p>}
    </ul>
  );
};

export default FolderTree;