import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ControlPanelPage from './pages/ControlPanelPage';
import StatisticsPage from './pages/StatisticsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import './i18n';
import './index.css';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/control-panel" 
          element={
            user.role === 'admin' ? 
            <ControlPanelPage /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/statistics" 
          element={
            ['admin', 'manager'].includes(user.role) ? 
            <StatisticsPage /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/activity-log" 
          element={
            ['admin', 'manager', 'security_officer'].includes(user.role) ? 
            <ActivityLogPage /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize the app
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">MHV</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;