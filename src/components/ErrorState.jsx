import React from 'react';

/**
 * Error state component
 */
const ErrorState = ({ error, isAuthenticated, onRetry }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      color: '#ff5500',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>❌ {error}</div>
      {!isAuthenticated && (
        <button 
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
