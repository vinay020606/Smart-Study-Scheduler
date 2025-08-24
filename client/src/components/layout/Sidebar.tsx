import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '📝' },
    { path: '/study-sessions', label: 'Study Sessions', icon: '⏱️' },
    { path: '/schedules', label: 'Schedules', icon: '📅' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Navigation</h2>
          <p className="sidebar-subtitle">Manage your study journey</p>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <div key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="quick-stats">
          <h3 className="stats-title">Quick Stats</h3>
          <div className="stat-item">
            <span className="stat-label">Today's Goal</span>
            <span className="stat-value">2h</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">1h 30m</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Remaining</span>
            <span className="stat-value">30m</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
