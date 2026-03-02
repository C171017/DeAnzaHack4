import React from 'react';
import spotifyLogo from '../assets/images/Spotify Icon/Spotify_icon.svg.png';

/**
 * Login button component
 */
const LoginButton = ({ onLogin, disabled = false, label = 'Login with Spotify', className = '' }) => {
  return (
    <button 
      onClick={onLogin}
      className={`spotify-login-button ${className}`.trim()}
      type="button"
      disabled={disabled}
    >
      <span className="spotify-login-button__icon" aria-hidden="true">
        <img 
          src={spotifyLogo} 
          alt="" 
        />
      </span>
      <span>{label}</span>
    </button>
  );
};

export default LoginButton;
