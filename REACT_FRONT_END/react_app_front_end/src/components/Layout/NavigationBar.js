// src/components/Layout/NavigationBar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavigationBar() {
  const location = useLocation();

  return (
    <div className="navbar bg-neutral text-neutral-content rounded-lg"> {/* Rounded edges */}
      
      {/* Left side - Brand button */}
      <button className="btn btn-ghost text-xl">Goliath</button>

      {/* Right side - Tab navigation */}
      <div className="flex-1 flex justify-end">
        <div role="tablist" className="tabs tabs-bordered">

            
          <Link 
            to="/DASHBOARD" 
            role="tab" 
            className={`tab text-white ${location.pathname === '/DASHBOARD' ? 'tab-active border-b-2 border-white' : 'border-white'}`}
          >
            Homepage
          </Link>


          <Link 
            to="/PORTFOLIO" 
            role="tab" 
            className={`tab text-white ${location.pathname === '/PORTFOLIO' ? 'tab-active border-b-2 border-white' : 'border-white'}`}
          >
            Portfolio
          </Link>


          <Link 
            to="/CRYPTO_ZONE" 
            role="tab" 
            className={`tab text-white ${location.pathname === '/CRYPTO_ZONE' ? 'tab-active border-b-2 border-white' : 'border-white'}`}
          >
            Crypto Trading
          </Link>


          <Link 
            to="/EQUITIES_ZONE" 
            role="tab" 
            className={`tab text-white ${location.pathname === '/EQUITIES_ZONE' ? 'tab-active border-b-2 border-white' : 'border-white'}`}
          >
            Equities Analysis
          </Link>


          <Link 
            to="/PROFILE" 
            role="tab" 
            className={`tab text-white ${location.pathname === '/PROFILE' ? 'tab-active border-b-2 border-white' : 'border-white'}`}
          >
            Profile
          </Link>


        </div>
      </div>
    </div>
  );
}

export default NavigationBar;