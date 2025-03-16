import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaChartBar,
  FaBitcoin,
  FaCog,
  FaUser,
  FaRandom,
  FaChartPie,
  FaChessKing,
  FaChessQueen,
  FaChessBishop,
  FaChessRook,
  FaChessKnight,
  FaGripVertical,
  FaGripHorizontal,
} from 'react-icons/fa';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCryptoExpanded, setIsCryptoExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  }, [isExpanded, onToggle]);

  const menuItems = [
    { id: 1, label: 'Home', icon: <FaHome />, path: '/DASHBOARD' },
    { id: 2, label: 'Simulations', icon: <FaChartBar />, path: '/SIMULATIONS' },
    { id: 3, label: 'Equities', icon: <FaChartPie />, path: '/EQUITIES' },
    { id: 4, label: 'Crypto', icon: <FaBitcoin /> }, // No direct path for Crypto
    { id: 5, label: 'Other', icon: <FaRandom />, path: '/OTHER' },
  ];

  const cryptoSubmenu = [
    { id: 'crypto-1', label: 'Portfolio', path: '/CRYPTO/PORTFOLIO', icon: <FaChessKing /> },
    { id: 'crypto-2', label: 'Analytics', path: '/CRYPTO/ANALYTICS', icon: <FaChessQueen /> },
    { id: 'crypto-3', label: 'Design Zone', path: '/CRYPTO/DESIGNZONE', icon: <FaChessBishop /> },
    { id: 'crypto-4', label: 'Trading', path: '/CRYPTO/TRADING', icon: <FaChessKnight /> },
    { id: 'crypto-5', label: 'Library', path: '/CRYPTO/LIBRARY', icon: <FaChessRook /> },
  ];

  
  const footerItems = [
    { id: 6, label: 'Settings', icon: <FaCog />, path: '/SETTINGS' },
    { id: 7, label: 'Profile', icon: <FaUser />, path: '/PROFILE' },
  ];

  return (
    <div
      className={`transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-16'
      } bg-base-100 shadow-lg flex flex-col justify-between rounded-xl`}
      style={{
        position: 'fixed',
        top: '1rem',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1000,
      }}
    >
      {/* Toggle Section */}
      <div
        className={`transition-all flex ${
          isExpanded ? 'justify-between px-4 items-center' : 'justify-center'
        }`}
        style={{ paddingTop: isExpanded ? '1rem' : '1.5rem', paddingBottom: isExpanded ? '0.5rem' : '0' }}
      >
        {isExpanded && <h2 className="text-neutral-content font-bold text-xl">GOLIATH</h2>}
        <button
          className="btn btn-circle btn-sm bg-gray-400 text-black"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isExpanded ? <FaGripVertical /> : <FaGripHorizontal />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1 mt-4">
        {menuItems.map((item) => (
          <div key={item.id} className="mb-2">
            {/* Special handling for Crypto */}
            {item.label === 'Crypto' ? (
              <div>
                <div
                  className={`p-2 rounded flex ${
                    isExpanded ? 'items-center' : 'justify-center'
                  } text-neutral-content cursor-pointer`}
                  style={{ backgroundColor: 'inherit', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'inherit')}
                  onClick={() => setIsCryptoExpanded(!isCryptoExpanded)}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isExpanded && (
                    <>
                      <span className="ml-4">{item.label}</span>
                      <span className="ml-auto">
                        {isCryptoExpanded ? (
                          <IoChevronUp className="text-lg" />
                        ) : (
                          <IoChevronDown className="text-lg" />
                        )}
                      </span>
                    </>
                  )}
                </div>
                {/* Submenu for Crypto */}
                {isExpanded && isCryptoExpanded && (
                  <ul
                    className="pl-6 mt-2 space-y-1 text-neutral-content"
                    style={{ listStyleType: 'none', paddingLeft: '1rem' }}
                  >
                    {cryptoSubmenu.map((submenu) => (
                      <li
                        key={submenu.id}
                        className="rounded p-1 cursor-pointer flex items-center"
                        style={{ transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'inherit')}
                        onClick={() => navigate(submenu.path)}
                      >
                        <span className="text-xl mr-2">{submenu.icon}</span>
                        {submenu.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div
                className={`p-2 rounded flex ${
                  isExpanded ? 'items-center' : 'justify-center'
                } text-neutral-content cursor-pointer`}
                style={{ transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'inherit')}
                onClick={() => navigate(item.path)}
              >
                <span className="text-xl">{item.icon}</span>
                {isExpanded && <span className="ml-4">{item.label}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Items */}
      <div className="space-y-4 pb-2">
        {footerItems.map((item) => (
          <div
            key={item.id}
            className={`p-2 rounded flex ${
              isExpanded ? 'items-center' : 'justify-center'
            } text-neutral-content cursor-pointer`}
            style={{ transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'inherit')}
            onClick={() => navigate(item.path)}
          >
            <span className="text-xl">{item.icon}</span>
            {isExpanded && <span className="ml-4">{item.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;