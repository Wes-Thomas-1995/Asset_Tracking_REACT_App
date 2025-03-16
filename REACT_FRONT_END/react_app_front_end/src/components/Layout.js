import React, { createContext, useState } from 'react';
import Sidebar from './Layout/sidebar';

export const SidebarContext = createContext();

const Layout = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <Sidebar onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 flex-grow`}
        style={{
          marginLeft: isSidebarExpanded ? '21rem' : '5rem',
          padding: '1rem',
        }}
      >
        <div className="bg-base-200 shadow-lg rounded-lg p-6">
          {React.cloneElement(children, { isSidebarExpanded }) || (
            <p>This is placeholder content for the main content area.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;