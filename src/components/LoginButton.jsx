import React from 'react';
import spotifyLogo from '../assets/images/Spotify Icon/Spotify_icon.svg.png';

/**
 * Login/Logout button component
 */
const LoginButton = ({ isAuthenticated, user, onLogin, onLogout }) => {
  if (isAuthenticated && user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#000000' }}>{user.display_name || user.id}</span>
        <button 
          onClick={onLogout}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ff5500',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={onLogin}
      style={{
        padding: '0',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img 
        src={spotifyLogo} 
        alt="Spotify Logo" 
        style={{
          height: '48px',
          width: 'auto'
        }}
      />
    </button>
  );
};

export default LoginButton;
