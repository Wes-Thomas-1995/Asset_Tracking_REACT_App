// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/HOME/Dashboard';
import Equities from './pages/EQUITIES/Equities';
import Other from './pages/OTHER/Other';
import Simulations from './pages/SIMULATIONS/Simulations';
import Settings from './pages/SETTINGS/Settings';
import Profile from './pages/PROFILE/Profile';
import Analytics from './pages/CRYPTO/Analytics_Crypto';
import Portfolio from './pages/CRYPTO/Portfolio_Crypto';
import DesignZone from './pages/CRYPTO/Design_Zone_Crypto';
import Trading from './pages/CRYPTO/Trading_Crypto';
import Library from './pages/CRYPTO/Library_Crypto';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/DASHBOARD" element={<Dashboard />} />
          <Route path="/EQUITIES" element={<Equities />} />
          <Route path="/OTHER" element={<Other />} />
          <Route path="/SIMULATIONS" element={<Simulations />} />
          <Route path="/SETTINGS" element={<Settings />} />
          <Route path="/PROFILE" element={<Profile />} />
          <Route path="/CRYPTO/ANALYTICS" element={<Analytics />} />
          <Route path="/CRYPTO/PORTFOLIO" element={<Portfolio />} />
          <Route path="/CRYPTO/DESIGNZONE" element={<DesignZone />} />
          <Route path="/CRYPTO/TRADING" element={<Trading />} />
          <Route path="/CRYPTO/LIBRARY" element={<Library />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;