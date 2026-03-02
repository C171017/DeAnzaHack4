import React, { useEffect } from 'react';
import BubbleChart from './components/BubbleChart';
import LoginButton from './components/LoginButton';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAlbums } from './hooks/useAlbums';
import { getAuthorizationUrl, getStoredAccessToken } from './utils/spotifyAuth';
import './App.css';

function App() {
  const { isAuthenticated, user, loading: authLoading, error: authError, logout } = useSpotifyAuth();
  const { 
    data, 
    albums, 
    loading: albumsLoading, 
    error: albumsError, 
    loadSavedAlbums, 
    setError 
  } = useAlbums();

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
  };

  const error = authError || albumsError;
  const userName = user?.display_name?.trim() || user?.id || 'Hi';
  const greetingName = userName.split(' ')[0];
  const totalAlbums = albums.length || data.length;
  const visibleAlbums = data.length;

  if (!isAuthenticated) {
    return (
      <div className="App">
        <section className="login-screen">
          <div className="login-screen__glow login-screen__glow--left" />
          <div className="login-screen__glow login-screen__glow--right" />
          <div className="login-card">
            <p className="login-kicker">Spotify-powered album constellation</p>
            <h1 className="login-brand">Hacksify</h1>
            <p className="login-copy">
              Start with a focused login screen, then drop users into a dark visual home made from their saved albums.
            </p>
            {error ? (
              <p className="login-error">{error}</p>
            ) : (
              <p className="login-hint">Connect your Spotify account to build your personal album map.</p>
            )}
            <LoginButton
              onLogin={handleLogin}
              disabled={authLoading}
              label={authLoading ? 'Connecting to Spotify...' : 'Continue With Spotify'}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-logo">Hacksify</div>
          <nav className="dashboard-nav" aria-label="Primary">
            <button className="dashboard-nav__item dashboard-nav__item--active" type="button">Home</button>
            <button className="dashboard-nav__item" type="button">Stream</button>
            <button className="dashboard-nav__item" type="button">Library</button>
          </nav>
          <div className="dashboard-user">
            <span className="dashboard-user__name">Hi {greetingName}</span>
            <button className="dashboard-logout" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-stage">
          {visibleAlbums > 0 ? (
            <BubbleChart
              data={data}
              includeGenres={false}
              backgroundFill="#050505"
              albumShape="circle"
              showScrollbars={false}
            />
          ) : (
            <div className="dashboard-empty">
              <h2>{albumsLoading ? 'Loading your albums...' : 'No albums available yet'}</h2>
              <p>
                {albumsLoading
                  ? 'Spotify is fetching your saved albums and placing them on the canvas.'
                  : 'Save a few albums in Spotify, then refresh this page.'}
              </p>
            </div>
          )}

          <div className="dashboard-stat-card">
            <strong>Albums Displayed: {visibleAlbums}</strong>
            <span>
              {albumsLoading ? 'Syncing your Spotify library...' : `Showing ${visibleAlbums} of ${totalAlbums} saved albums`}
            </span>
          </div>

          <button className="dashboard-next" type="button" aria-label="Next section">
            &rarr;
          </button>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
