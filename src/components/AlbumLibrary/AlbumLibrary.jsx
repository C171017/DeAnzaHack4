import React, { useState } from 'react';
import './AlbumLibrary.css';

const AlbumLibrary = ({ albums = [], loading = false, onAlbumDragStart, onAlbumDrop }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleDragStart = (e, album) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(album));
    // Mark album as being dragged (visual feedback only)
    if (onAlbumDragStart) {
      onAlbumDragStart(album);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const albumData = JSON.parse(e.dataTransfer.getData('application/json'));
      // Add album back to library (removed from canvas)
      if (onAlbumDrop && albumData) {
        onAlbumDrop(albumData);
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <div 
      className={`album-library ${isCollapsed ? 'collapsed' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="album-library-header">
        <h2>Your Albums</h2>
        <div className="album-library-header-right">
          <span className="album-count">
            {loading ? '...' : albums.length}
          </span>
          <button 
            className="collapse-button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand library' : 'Collapse library'}
            title={isCollapsed ? 'Expand library' : 'Collapse library'}
          >
            {isCollapsed ? '◀' : '▶'}
          </button>
        </div>
      </div>
      <div className="album-library-content">
        {loading && albums.length === 0 ? (
          <div className="album-library-empty">
            <p>Loading albums...</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="album-library-empty">
            <p>No albums loaded yet</p>
          </div>
        ) : (
          albums.map((album) => (
            <div
              key={album.id}
              className="album-library-item"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, album)}
            >
              <div className="album-library-item-image">
                <img 
                  src={album.img || 'https://via.placeholder.com/60'} 
                  alt={album.name}
                  loading="lazy"
                />
              </div>
              <div className="album-library-item-info">
                <div className="album-library-item-name" title={album.name}>
                  {album.name}
                </div>
                <div className="album-library-item-artist" title={album.artist}>
                  {album.artist || 'Unknown Artist'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    {isCollapsed && (
      <button 
        className="album-library-expand-tab"
        onClick={toggleCollapse}
        aria-label="Expand library"
        title="Expand library"
      >
        Albums
      </button>
    )}
    </>
  );
};

export default AlbumLibrary;
