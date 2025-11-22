const CLIENT_ID = '91cf2887acc54bb1ab12ac44348596ea';

// Determine redirect URI based on environment
const getRedirectUri = () => {
  const hostname = window.location.hostname;
  
  // Use production domain when deployed (must match Spotify dashboard exactly)
  if (hostname === 'music.c171017.com' || hostname.includes('c171017.com')) {
    return 'https://music.c171017.com/callback';
  }
  
  // For local development - use the actual hostname (must match Spotify dashboard exactly)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = window.location.port || '8080';
    // Use the actual hostname to match what's registered in Spotify dashboard
    return `http://127.0.0.1:${port}/callback`;
  }
  
  // Fallback to current origin
  return window.location.origin + '/callback';
};

const REDIRECT_URI = getRedirectUri();

// Debug logging to help troubleshoot
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 Spotify Auth Configuration:');
  console.log('   Redirect URI:', REDIRECT_URI);
  console.log('   Current URL:', window.location.href);
  console.log('   Hostname:', window.location.hostname);
  console.log('   Make sure this redirect URI is registered in Spotify Dashboard!');
}

// Scopes needed for saved albums
const SCOPES = [
  'user-library-read',  // Access to saved albums and tracks
  'user-read-email',    // User email
  'user-read-private'   // User profile info
].join(' ');

// Generate PKCE code verifier
export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Generate code challenge from verifier
export const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Get authorization URL
export const getAuthorizationUrl = async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  
  // Store verifier for later use
  sessionStorage.setItem('code_verifier', verifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI, // Must match exactly what's in Spotify dashboard
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });
  
  const authUrl = `https://accounts.spotify.com/authorize?${params}`;
  
  // Debug: Log the authorization URL (without sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Redirecting to Spotify with URI:', REDIRECT_URI);
  }
  
  return authUrl;
};

// Exchange authorization code for access token
export const getAccessToken = async (code) => {
  const verifier = sessionStorage.getItem('code_verifier');
  
  if (!verifier) {
    throw new Error('Code verifier not found');
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${error.error_description || error.error}`);
  }
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  
  // Clear verifier after use
  sessionStorage.removeItem('code_verifier');
  
  return data;
};

// Get current access token
export const getStoredAccessToken = () => {
  return localStorage.getItem('spotify_access_token');
};

// Clear stored tokens
export const clearTokens = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
};
