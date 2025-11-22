import React from 'react';
import spotifyLogo from '../assets/images/Spotify Icon/Spotify_icon.svg.png';

/**
 * Login button component
 */
const LoginButton = ({ isAuthenticated, user, onLogin }) => {
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
