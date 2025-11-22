import React from 'react';

/**
 * Loading state component
 */
const LoadingState = ({ isAuthenticated }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      color: '#000000',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>Loading...</div>
      {isAuthenticated && (
        <div style={{ color: '#888', fontSize: '14px' }}>
          Fetching your saved albums...
        </div>
      )}
    </div>
  );
};

export default LoadingState;
