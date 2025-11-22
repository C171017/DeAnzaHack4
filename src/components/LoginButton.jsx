import React from 'react';

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
        padding: '8px 16px',
        backgroundColor: '#1db954',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Login with Spotify
    </button>
  );
};

export default LoginButton;
