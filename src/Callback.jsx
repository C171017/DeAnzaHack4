import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAccessToken } from './utils/spotifyAuth';

function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setError(`Spotify authentication error: ${errorParam}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (code) {
      getAccessToken(code)
        .then(() => {
          // Redirect to home page after successful authentication
          navigate('/');
        })
        .catch((err) => {
          console.error('Token exchange failed:', err);
          setError(`Authentication failed: ${err.message}`);
          setTimeout(() => navigate('/'), 3000);
        });
    }
  }, [code, errorParam, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      color: 'white',
      backgroundColor: '#121212'
    }}>
      {error ? (
        <>
          <div style={{ color: '#ff5500', fontSize: '18px' }}>❌ {error}</div>
          <div>Redirecting to home...</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '18px' }}>Authenticating with Spotify...</div>
          <div style={{ color: '#888' }}>Please wait...</div>
        </>
      )}
    </div>
  );
}

export default Callback;
