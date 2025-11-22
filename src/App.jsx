import React, { useEffect } from 'react';
import BubbleChart from './components/BubbleChart';
import EmptyCanvas from './components/EmptyCanvas';
import AlbumLibrary from './components/AlbumLibrary';
import LoginButton from './components/LoginButton';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAlbums } from './hooks/useAlbums';
import { getAuthorizationUrl, getStoredAccessToken } from './utils/spotifyAuth';
import './App.css';

function App() {
  const { isAuthenticated, user, loading: authLoading, error: authError, checkAuth, logout } = useSpotifyAuth();
  const { data, albums, loading: albumsLoading, error: albumsError, loadInitialAlbums, loadSavedAlbums, setError } = useAlbums();

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
  };

  const loading = authLoading || albumsLoading;
  const error = authError || albumsError;

  return (
    <div className="App">
      <div className="fixed-login-button">
        <LoginButton
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>
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
            <EmptyCanvas />
          )
        )}
      </main>
      {isAuthenticated && (
        <AlbumLibrary 
          albums={data} 
          loading={albumsLoading}
        />
      )}
    </div>
  );
}

export default App;