import React, { useState, useEffect } from 'react';
import BubbleChart from './components/BubbleChart';
import { getAuthorizationUrl, getStoredAccessToken, clearTokens } from './utils/spotifyAuth';
import { getUserProfile, getAllSavedAlbums } from './utils/spotifyApi';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = getStoredAccessToken();
    if (token) {
      checkAuthAndLoadAlbums(token);
    }
  }, []);

  const checkAuthAndLoadAlbums = async (token) => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile(token);
      setUser(userProfile);
      setIsAuthenticated(true);
      
      // Fetch saved albums
      await loadSavedAlbums(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      clearTokens();
      setIsAuthenticated(false);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAlbums = async (token) => {
    try {
      setLoading(true);
      const savedAlbums = await getAllSavedAlbums(token);
      setAlbums(savedAlbums);
      
      // Output albums to console
      console.log('=== User\'s Saved Albums ===');
      console.log(`Total albums: ${savedAlbums.length}`);
      savedAlbums.forEach((item, index) => {
        const album = item.album;
        console.log(`${index + 1}. ${album.name} by ${album.artists.map(a => a.name).join(', ')}`);
        console.log(`   - Release Date: ${album.release_date}`);
        console.log(`   - Total Tracks: ${album.total_tracks}`);
        console.log(`   - Album Art: ${album.images[0]?.url || 'N/A'}`);
        console.log(`   - Spotify URL: ${album.external_urls.spotify}`);
        console.log('---');
      });
      
      // Transform albums for bubble chart
      const transformedData = savedAlbums.map((item, index) => {
        const album = item.album;
        return {
          id: album.id,
          name: album.name,
          radius: Math.random() * 30 + 20,
          group: album.artists[0]?.name || 'Unknown Artist',
          img: album.images[0]?.url || `https://picsum.photos/seed/${index}/200`,
          album: album,
          artist: album.artists[0]?.name,
          releaseDate: album.release_date,
          totalTracks: album.total_tracks
        };
      });
      
      setData(transformedData);
    } catch (error) {
      console.error('Failed to load albums:', error);
      setError(`Failed to load albums: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    setAlbums([]);
    setData([]);
    setError(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo">Hacksify</div>
        <nav>
          <button className="nav-btn active">Home</button>
          <button className="nav-btn">Stream</button>
          <button className="nav-btn">Library</button>
        </nav>
        <div className="user-profile">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white' }}>{user.display_name || user.id}</span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff5500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1db954',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Login with Spotify
            </button>
          )}
        </div>
      </header>
      <main className="visualizer-container">
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'white',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>Loading...</div>
            {isAuthenticated && <div style={{ color: '#888', fontSize: '14px' }}>Fetching your saved albums...</div>}
          </div>
        ) : error ? (
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
                onClick={handleLogin}
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
        ) : !isAuthenticated ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '20px',
            color: 'white'
          }}>
            <h2>Welcome to Hacksify</h2>
            <p style={{ color: '#888' }}>Visualize your music taste with interactive bubbles</p>
            <button 
              onClick={handleLogin}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1db954',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Continue with Spotify
            </button>
          </div>
        ) : albums.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'white',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>No saved albums found</div>
            <div style={{ color: '#888', fontSize: '14px' }}>Save some albums on Spotify to see them here!</div>
          </div>
        ) : (
          <>
            <BubbleChart data={data} />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '15px',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              maxWidth: '300px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                📊 Albums Loaded: {albums.length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Check console for full album details
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;