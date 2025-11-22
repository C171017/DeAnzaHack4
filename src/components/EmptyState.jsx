import React from 'react';

/**
 * Empty state component (no albums found)
 */
const EmptyState = () => {
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
      <div>No saved albums found</div>
      <div style={{ color: '#888', fontSize: '14px' }}>
        Save some albums on Spotify to see them here!
      </div>
    </div>
  );
};

export default EmptyState;
