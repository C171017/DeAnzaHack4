import React from 'react';
import './AlbumLibrary.css';

const AlbumLibrary = ({ albums, onAlbumDragStart, onAlbumDrop }) => {
  const handleDragStart = (e, album) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(album));
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
      if (onAlbumDrop) {
        onAlbumDrop(albumData);
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  return (
    <div 
      className="album-library"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="album-library-header">
        <h2>Your Albums</h2>
        <span className="album-count">{albums.length}</span>
      </div>
      <div className="album-library-content">
        {albums.length === 0 ? (
          <div className="album-library-empty">
            <p>No albums in library</p>
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
  );
};

export default AlbumLibrary;
