import React from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>👤 Profile</h1>
        <p>Manage your account and preferences</p>
      </div>
      
      <div className="profile-content">
        <div className="placeholder-content">
          <h2>Profile Management</h2>
          <p>This page will contain:</p>
          <ul>
            <li>Personal information</li>
            <li>Account settings</li>
            <li>Study preferences</li>
            <li>Notification settings</li>
            <li>Theme customization</li>
          </ul>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
