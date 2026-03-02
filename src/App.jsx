import React, { useEffect, useState } from 'react';
import BubbleChart from './components/BubbleChart';
import EmptyCanvas from './components/EmptyCanvas';
import AlbumLibrary from './components/AlbumLibrary';
import GenreLibrary from './components/GenreLibrary';
import LoginButton from './components/LoginButton';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAlbums } from './hooks/useAlbums';
import { getAuthorizationUrl, getStoredAccessToken } from './utils/spotifyAuth';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('home');
  const { isAuthenticated, user, loading: authLoading, error: authError, logout } = useSpotifyAuth();
  const { 
    data, 
    albums, 
    libraryAlbums,
    canvasAlbums,
    libraryGenres,
    canvasGenres,
    loading: albumsLoading, 
    error: albumsError, 
    loadSavedAlbums, 
    moveAlbumToCanvas,
    moveAlbumToLibrary,
    moveGenreToCanvas,
    moveGenreToLibrary,
    updateCanvasItemPosition,
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
  const activeAlbumCount = canvasAlbums.length;
  const activeGenreCount = canvasGenres.length;
  const streamSourceAlbums = canvasAlbums.length > 0 ? canvasAlbums : libraryAlbums;

  const openAlbumInSpotify = (album) => {
    const url = album?.spotifyUrl || album?.external_urls?.spotify || album?.album?.external_urls?.spotify;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openRandomStreamAlbum = () => {
    if (streamSourceAlbums.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * streamSourceAlbums.length);
    openAlbumInSpotify(streamSourceAlbums[randomIndex]);
  };

  const handleNextView = () => {
    if (activeView === 'home') {
      setActiveView('stream');
      return;
    }

    if (activeView === 'stream') {
      setActiveView('library');
      return;
    }

    setActiveView('home');
  };

  const renderHomeView = () => {
    if (visibleAlbums > 0) {
      return (
        <BubbleChart
          data={data}
          includeGenres={false}
          backgroundFill="#050505"
          albumShape="circle"
          showScrollbars={false}
        />
      );
    }

    return (
      <div className="dashboard-empty">
        <h2>{albumsLoading ? 'Loading your albums...' : 'No albums available yet'}</h2>
        <p>
          {albumsLoading
            ? 'Spotify is fetching your saved albums and placing them on the canvas.'
            : 'Save a few albums in Spotify, then refresh this page.'}
        </p>
      </div>
    );
  };

  const renderStreamView = () => (
    <>
      <EmptyCanvas
        albums={canvasAlbums}
        genres={canvasGenres}
        onAlbumDrop={moveAlbumToCanvas}
        onGenreDrop={moveGenreToCanvas}
        onPositionUpdate={updateCanvasItemPosition}
      />
      <GenreLibrary
        genres={libraryGenres}
        onGenreDrop={moveGenreToLibrary}
      />
      <AlbumLibrary
        albums={libraryAlbums}
        loading={albumsLoading}
        onAlbumDrop={moveAlbumToLibrary}
      />
      <div className="dashboard-overlay-card dashboard-overlay-card--left">
        <p className="dashboard-overlay-card__eyebrow">Next Step</p>
        <strong>Stream Deck</strong>
        <span>Build a smaller, faster-to-reach set of albums instead of hunting through a long playlist.</span>
        <div className="dashboard-quick-actions">
          <button
            className="dashboard-quick-action"
            onClick={() => openAlbumInSpotify(streamSourceAlbums[0])}
            type="button"
            disabled={streamSourceAlbums.length === 0}
          >
            Open Focus Pick
          </button>
          <button
            className="dashboard-quick-action"
            onClick={openRandomStreamAlbum}
            type="button"
            disabled={streamSourceAlbums.length === 0}
          >
            Shuffle Launch
          </button>
          <button
            className="dashboard-quick-action"
            onClick={() => setActiveView('library')}
            type="button"
          >
            Browse Library
          </button>
        </div>
      </div>
      <div className="dashboard-overlay-card dashboard-overlay-card--center">
        <strong>Stream Workspace</strong>
        <span>Drag albums and genres onto the canvas. Drop them back into the side trays to remove them. Use the quick actions to open a focused pick immediately.</span>
      </div>
    </>
  );

  const renderLibraryView = () => (
    <section className="dashboard-library-view" aria-label="Library overview">
      <div className="dashboard-library-panel">
        <p className="dashboard-library-panel__eyebrow">Albums</p>
        <h2>Saved collection</h2>
        <p className="dashboard-library-panel__copy">
          Double-click an album to open it in Spotify. Switch to Stream to drag albums onto the workspace.
        </p>
        <div className="dashboard-library-grid">
          {libraryAlbums.length > 0 ? (
            libraryAlbums.map((album) => (
              <button
                key={album.id}
                className="dashboard-library-card"
                type="button"
                onClick={() => {
                  if (album.spotifyUrl) {
                    window.open(album.spotifyUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <span className="dashboard-library-card__art">
                  {album.img ? <img src={album.img} alt={album.name} loading="lazy" /> : null}
                </span>
                <span className="dashboard-library-card__meta">
                  <strong>{album.name}</strong>
                  <span>{album.artist || 'Unknown Artist'}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="dashboard-library-empty-state">
              {albumsLoading ? 'Loading albums from Spotify...' : 'No albums in the library tray right now.'}
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-library-panel dashboard-library-panel--narrow">
        <p className="dashboard-library-panel__eyebrow">Genres</p>
        <h2>Available tags</h2>
        <p className="dashboard-library-panel__copy">
          These are ready to drop into Stream. Any genres currently on the canvas are tracked separately.
        </p>
        <div className="dashboard-genre-list">
          {libraryGenres.length > 0 ? (
            libraryGenres.map((genre) => (
              <div
                key={genre.id}
                className="dashboard-genre-pill"
                style={{ borderColor: genre.color || '#ffffff' }}
              >
                {genre.name}
              </div>
            ))
          ) : (
            <p className="dashboard-library-empty-state">All genres are currently on the Stream canvas.</p>
          )}
        </div>
      </div>
    </section>
  );

  const renderActiveView = () => {
    if (activeView === 'stream') {
      return renderStreamView();
    }

    if (activeView === 'library') {
      return renderLibraryView();
    }

    return renderHomeView();
  };

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
            <button
              className={`dashboard-nav__item ${activeView === 'home' ? 'dashboard-nav__item--active' : ''}`.trim()}
              onClick={() => setActiveView('home')}
              type="button"
            >
              Home
            </button>
            <button
              className={`dashboard-nav__item ${activeView === 'stream' ? 'dashboard-nav__item--active' : ''}`.trim()}
              onClick={() => setActiveView('stream')}
              type="button"
            >
              Stream
            </button>
            <button
              className={`dashboard-nav__item ${activeView === 'library' ? 'dashboard-nav__item--active' : ''}`.trim()}
              onClick={() => setActiveView('library')}
              type="button"
            >
              Library
            </button>
          </nav>
          <div className="dashboard-user">
            <span className="dashboard-user__name">Hi {greetingName}</span>
            <button className="dashboard-logout" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>

        <main className={`dashboard-stage ${activeView === 'stream' ? 'dashboard-stage--stream' : ''}`.trim()}>
          {renderActiveView()}

          <div className="dashboard-stat-card">
            <strong>
              {activeView === 'stream'
                ? `On Stream: ${activeAlbumCount} albums`
                : activeView === 'library'
                  ? `Library Ready: ${libraryAlbums.length} albums`
                  : `Albums Displayed: ${visibleAlbums}`}
            </strong>
            <span>
              {activeView === 'stream'
                ? `${activeGenreCount} genres placed on the stream canvas`
                : activeView === 'library'
                  ? `${libraryGenres.length} genres available to drag into Stream`
                  : albumsLoading
                    ? 'Syncing your Spotify library...'
                    : `Showing ${visibleAlbums} of ${totalAlbums} saved albums`}
            </span>
          </div>

          <button
            className="dashboard-next"
            onClick={handleNextView}
            type="button"
            aria-label={activeView === 'home' ? 'Open Stream workspace' : activeView === 'stream' ? 'Open Library page' : 'Return Home'}
          >
            <span className="dashboard-next__label">
              {activeView === 'home' ? 'Stream' : activeView === 'stream' ? 'Library' : 'Home'}
            </span>
            <span aria-hidden="true">&rarr;</span>
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
