import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ABCCurve from './pages/ABCCurve';
import MarginContribution from './pages/MarginContribution';
import DailySales from './pages/DailySales';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Navbar />}
        <div className="container mx-auto">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Dashboard /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/abc" 
              element={
                isAuthenticated ? 
                <ABCCurve /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/margin" 
              element={
                isAuthenticated ? 
                <MarginContribution /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/daily" 
              element={
                isAuthenticated ? 
                <DailySales /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;