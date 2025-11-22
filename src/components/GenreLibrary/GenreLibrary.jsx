import React, { useState } from 'react';
import './GenreLibrary.css';

const GenreLibrary = ({ genres = [], onGenreDragStart, onGenreDrop }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleDragStart = (e, genre) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(genre));
    // Don't move immediately - only move on drop
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const genreData = JSON.parse(e.dataTransfer.getData('application/json'));
      // Add genre back to library (removed from canvas)
      if (onGenreDrop && genreData) {
        onGenreDrop(genreData);
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
      className={`genre-library ${isCollapsed ? 'collapsed' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="genre-library-header">
        <h2>Genres</h2>
        <div className="genre-library-header-right">
          <span className="genre-count">{genres.length}</span>
          <button 
            className="collapse-button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand library' : 'Collapse library'}
            title={isCollapsed ? 'Expand library' : 'Collapse library'}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>
      <div className="genre-library-content">
        {genres.length === 0 ? (
          <div className="genre-library-empty">
            <p>No genres in library</p>
          </div>
        ) : (
          genres.map((genre) => (
            <div
              key={genre.id}
              className="genre-library-item"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, genre)}
              style={{
                borderLeft: `4px solid ${genre.color || '#CCCCCC'}`
              }}
            >
              <div className="genre-library-item-name" title={genre.name}>
                {genre.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    {isCollapsed && (
      <button 
        className="genre-library-expand-tab"
        onClick={toggleCollapse}
        aria-label="Expand library"
        title="Expand library"
      >
        Genres
      </button>
    )}
    </>
  );
};

export default GenreLibrary;
