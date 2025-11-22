import { useState, useEffect } from 'react';
import { getStoredAccessToken, clearTokens } from '../utils/spotifyAuth';
import { getUserProfile } from '../utils/spotifyApi';

/**
 * Custom hook for managing Spotify authentication state
 */
export const useSpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = getStoredAccessToken();
    if (token) {
      checkAuth(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async (token) => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile(token);
      setUser(userProfile);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Auth check failed:', error);
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    checkAuth,
    logout
  };
};
