import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span>Smart Study Scheduler</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={getFullName(user.firstName, user.lastName)} />
              ) : (
                getInitials(user?.firstName || 'U', user?.lastName || 'U')
              )}
            </div>
            <span className="user-name">
              {user ? getFullName(user.firstName, user.lastName) : 'User'}
            </span>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
