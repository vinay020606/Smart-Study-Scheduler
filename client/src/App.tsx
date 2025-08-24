import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Tasks from './components/tasks/Tasks';
import StudySessions from './components/study-sessions/StudySessions';
import Schedules from './components/schedules/Schedules';
import Profile from './components/profile/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Types
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="app-content">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/study-sessions" element={<StudySessions />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
