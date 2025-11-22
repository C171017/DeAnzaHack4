const API_BASE = 'https://api.spotify.com/v1';

// Helper to make authenticated requests
const apiRequest = async (endpoint, accessToken) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    throw new Error('Token expired. Please log in again.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`API request failed: ${error.error?.message || response.statusText}`);
  }
  
  return response.json();
};

// Get user profile
export const getUserProfile = async (accessToken) => {
  return apiRequest('/me', accessToken);
};

// Get user's saved albums (paginated)
export const getSavedAlbums = async (accessToken, limit = 50, offset = 0) => {
  return apiRequest(`/me/albums?limit=${limit}&offset=${offset}`, accessToken);
};

// Get all saved albums (handles pagination automatically)
export const getAllSavedAlbums = async (accessToken) => {
  let allAlbums = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await getSavedAlbums(accessToken, limit, offset);
    allAlbums = allAlbums.concat(response.items);
    
    hasMore = response.next !== null;
    offset += limit;
    
    // Safety limit to prevent infinite loops
    if (offset > 1000) {
      console.warn('Reached safety limit of 1000 albums');
      break;
    }
  }

  return allAlbums;
};
