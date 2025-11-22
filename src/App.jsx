import React, { useEffect, useState } from 'react';
import BubbleChart from './components/BubbleChart';
import EmptyCanvas from './components/EmptyCanvas';
import AlbumLibrary from './components/AlbumLibrary';
import GenreLibrary from './components/GenreLibrary';
import LoginButton from './components/LoginButton';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import Modal from './components/Modal';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAlbums } from './hooks/useAlbums';
import { getAuthorizationUrl, getStoredAccessToken } from './utils/spotifyAuth';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user, loading: authLoading, error: authError, checkAuth, logout } = useSpotifyAuth();
  const { 
    data, 
    albums, 
    libraryAlbums, 
    canvasAlbums,
    libraryGenres,
    canvasGenres,
    loading: albumsLoading, 
    error: albumsError, 
    loadInitialAlbums, 
    loadSavedAlbums, 
    moveAlbumToCanvas,
    moveAlbumToLibrary,
    moveGenreToCanvas,
    moveGenreToLibrary,
    updateCanvasItemPosition,
    setError 
  } = useAlbums();

  // Load initial album images on mount
  useEffect(() => {
    loadInitialAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check authentication and load albums on mount
  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      checkAuthAndLoadAlbums(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadAlbums = async (token) => {
    await checkAuth(token);
    // Note: We need to wait for isAuthenticated to update, so we'll handle this differently
    // For now, we'll load albums after auth check completes
  };

  // Load albums when authentication succeeds
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = getStoredAccessToken();
      if (token) {
        loadSavedAlbums(token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    try {
      const authUrl = await getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setError(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    loadInitialAlbums();
    setIsModalOpen(false);
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    }
  };

  const loading = authLoading || albumsLoading;
  const error = authError || albumsError;

  return (
    <div className="App">
      <div className="logo-container-center">
        <h1 
          className={`hacksify-logo ${isAuthenticated ? 'clickable' : ''}`}
          onClick={handleLogoClick}
        >
          Hacksify
        </h1>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-body">
          <h2 className="modal-title">Hacksify</h2>
          {user && (
            <div className="modal-user-info">
              <p className="modal-user-name">{user.display_name || user.id}</p>
              {user.email && (
                <p className="modal-user-email">{user.email}</p>
              )}
            </div>
          )}
          <button className="modal-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </Modal>
      {!isAuthenticated && (
        <div className="fixed-login-button">
            <LoginButton
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={handleLogin}
            />
        </div>
      )}
      <main className="visualizer-container">
        {!isAuthenticated ? (
          // Before login: show loading state or bubble chart with initial albums
          loading ? (
            <LoadingState isAuthenticated={isAuthenticated} />
          ) : error ? (
            <ErrorState
              error={error}
              isAuthenticated={isAuthenticated}
              onRetry={handleLogin}
            />
          ) : (
            <BubbleChart data={data} />
          )
        ) : (
          // After login: always show empty canvas (loading happens in background)
          error ? (
            <ErrorState
              error={error}
              isAuthenticated={isAuthenticated}
              onRetry={handleLogin}
            />
          ) : (
            <EmptyCanvas 
              albums={canvasAlbums}
              genres={canvasGenres}
              onAlbumDrop={moveAlbumToCanvas}
              onAlbumDragStart={(album) => {
                // Album is being dragged from canvas, will be handled on drop
              }}
              onGenreDrop={moveGenreToCanvas}
              onGenreDragStart={(genre) => {
                // Genre is being dragged from canvas, will be handled on drop
              }}
              onPositionUpdate={updateCanvasItemPosition}
            />
          )
        )}
      </main>
      {isAuthenticated && (
        <>
          <GenreLibrary 
            genres={libraryGenres}
            onGenreDragStart={(genre) => {
              // Visual feedback only, actual move happens on drop
            }}
            onGenreDrop={moveGenreToLibrary}
          />
          <AlbumLibrary 
            albums={libraryAlbums} 
            loading={albumsLoading}
            onAlbumDragStart={(album) => {
              // Visual feedback only, actual move happens on drop
            }}
            onAlbumDrop={moveAlbumToLibrary}
          />
        </>
      )}
    </div>
  );
}

export default App;