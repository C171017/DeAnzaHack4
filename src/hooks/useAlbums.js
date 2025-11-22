import { useState, useEffect } from 'react';
import { getSavedAlbums } from '../utils/spotifyApi';
import initialAlbumsData from '../data/initialAlbums.json';
import { GENRES, GENRE_COLORS, GENRE_TEXT_FONT_SIZE, GENRE_COLLISION_PADDING } from '../components/BubbleChart/constants';

// Import initial album images
import album1 from '../assets/images/initial-screen-albums/album-1.jpg';
import album2 from '../assets/images/initial-screen-albums/album-2.jpg';
import album3 from '../assets/images/initial-screen-albums/album-3.jpg';
import album4 from '../assets/images/initial-screen-albums/album-4.jpg';
import album5 from '../assets/images/initial-screen-albums/album-5.jpg';
import album6 from '../assets/images/initial-screen-albums/album-6.jpg';
import album7 from '../assets/images/initial-screen-albums/album-7.jpg';
import album8 from '../assets/images/initial-screen-albums/album-8.jpg';
import album9 from '../assets/images/initial-screen-albums/album-9.jpg';
import album10 from '../assets/images/initial-screen-albums/album-10.jpg';
import album11 from '../assets/images/initial-screen-albums/album-11.jpg';
import album12 from '../assets/images/initial-screen-albums/album-12.jpg';
import album13 from '../assets/images/initial-screen-albums/album-13.jpg';
import album14 from '../assets/images/initial-screen-albums/album-14.jpg';
import album15 from '../assets/images/initial-screen-albums/album-15.jpg';
import album16 from '../assets/images/initial-screen-albums/album-16.jpg';
import album17 from '../assets/images/initial-screen-albums/album-17.jpg';
import album18 from '../assets/images/initial-screen-albums/album-18.jpg';
import album19 from '../assets/images/initial-screen-albums/album-19.jpg';
import album20 from '../assets/images/initial-screen-albums/album-20.jpg';
import album21 from '../assets/images/initial-screen-albums/album-21.jpg';
import album22 from '../assets/images/initial-screen-albums/album-22.jpg';
import album23 from '../assets/images/initial-screen-albums/album-23.jpg';
import album24 from '../assets/images/initial-screen-albums/album-24.jpg';
import album25 from '../assets/images/initial-screen-albums/album-25.jpg';
import album26 from '../assets/images/initial-screen-albums/album-26.jpg';

const initialAlbums = [
  album1, album2, album3, album4, album5, album6, 
  album7, album8, album9, album10, album11,
  album12, album13, album14, album15, album16,
  album17, album18, album19, album20, album21,
  album22, album23, album24, album25, album26
];

/**
 * Transform initial albums data for bubble chart
 */
const transformInitialAlbums = () => {
  return initialAlbumsData.map((albumData, index) => ({
    id: albumData.id,
    name: albumData.name,
    radius: 50,
    group: 'Initial Albums',
    img: initialAlbums[index],
    artist: albumData.artists[0]?.name || 'Various Artists',
    releaseDate: albumData.release_date,
    totalTracks: null,
    spotifyUrl: albumData.external_urls?.spotify || null
  }));
};

/**
 * Create initial genre data for library
 */
const createInitialGenres = () => {
  const genreCollisionRadius = (GENRE_TEXT_FONT_SIZE / 2) + GENRE_COLLISION_PADDING;
  return GENRES.map(genre => ({
    id: `genre-${genre}`,
    name: genre,
    radius: genreCollisionRadius,
    circleRadius: 80,
    isGenre: true,
    color: GENRE_COLORS[genre] || '#CCCCCC',
    x: undefined,
    y: undefined
  }));
};

/**
 * Deduplicate albums by ID, keeping the last occurrence of each unique ID
 * This ensures no duplicate keys in React lists
 */
const deduplicateAlbumsById = (albums) => {
  const seen = new Map();
  const result = [];
  
  // Process in reverse to keep the last occurrence of each ID
  for (let i = albums.length - 1; i >= 0; i--) {
    const album = albums[i];
    if (!seen.has(album.id)) {
      seen.set(album.id, true);
      result.unshift(album);
    }
  }
  
  return result;
};

/**
 * Add new albums to existing albums array with deduplication
 * Filters out albums that already exist by ID, then combines and deduplicates
 * @param {Array} prevAlbums - Existing albums array
 * @param {Array} newAlbums - New albums to add
 * @returns {Array} Deduplicated combined array
 */
const addAlbumsWithDeduplication = (prevAlbums, newAlbums) => {
  const existingIds = new Set(prevAlbums.map(a => a.id));
  const filteredNewAlbums = newAlbums.filter(a => !existingIds.has(a.id));
  
  if (filteredNewAlbums.length === 0) {
    return prevAlbums; // No new albums to add
  }
  
  const combined = [...prevAlbums, ...filteredNewAlbums];
  // Final deduplication pass to ensure no duplicates (safety net)
  return deduplicateAlbumsById(combined);
};

/**
 * Custom hook for managing albums data
 */
export const useAlbums = () => {
  const [data, setData] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [libraryAlbums, setLibraryAlbums] = useState([]);
  const [canvasAlbums, setCanvasAlbums] = useState([]);
  const [libraryGenres, setLibraryGenres] = useState([]);
  const [canvasGenres, setCanvasGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize genres in library on mount
  useEffect(() => {
    const initialGenres = createInitialGenres();
    setLibraryGenres(initialGenres);
  }, []);

  const loadInitialAlbums = () => {
    const initialData = transformInitialAlbums();
    setData(initialData);
    setLibraryAlbums([]);
    setCanvasAlbums([]);
    // Reset genres to library
    const initialGenres = createInitialGenres();
    setLibraryGenres(initialGenres);
    setCanvasGenres([]);
  };

  // Move album from library to canvas
  const moveAlbumToCanvas = (album) => {
    // Remove from library (only if it exists - safety check)
    setLibraryAlbums(prev => {
      const filtered = prev.filter(a => a.id !== album.id);
      // Only update if there was actually a change to prevent unnecessary re-renders
      return filtered.length !== prev.length ? filtered : prev;
    });
    
    setCanvasAlbums(prev => {
      // Check if album already exists on canvas
      const existingIndex = prev.findIndex(a => a.id === album.id);
      if (existingIndex >= 0) {
        // Update existing album position (on drop with new position)
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...album,
          // Always use the new position if provided
          x: album.x !== undefined ? album.x : updated[existingIndex].x,
          y: album.y !== undefined ? album.y : updated[existingIndex].y
        };
        return updated;
      }
      // Initialize position if not set (will be updated on drop)
      const albumWithPosition = {
        ...album,
        x: album.x !== undefined ? album.x : Math.random() * (1920 - album.radius * 2) + album.radius,
        y: album.y !== undefined ? album.y : Math.random() * (1920 - album.radius * 2) + album.radius
      };
      return [...prev, albumWithPosition];
    });
  };

  // Move album from canvas to library
  const moveAlbumToLibrary = (album) => {
    setCanvasAlbums(prev => prev.filter(a => a.id !== album.id));
    setLibraryAlbums(prev => {
      // Remove any existing album with the same ID first, then add the new one
      // This ensures no duplicates even with async state updates
      const filtered = prev.filter(a => a.id !== album.id);
      return [...filtered, album];
    });
  };

  // Move genre from library to canvas
  const moveGenreToCanvas = (genre) => {
    // Remove from library
    setLibraryGenres(prev => prev.filter(g => g.id !== genre.id));
    
    setCanvasGenres(prev => {
      // Check if genre already exists on canvas
      const existingIndex = prev.findIndex(g => g.id === genre.id);
      if (existingIndex >= 0) {
        // Update existing genre position (on drop with new position)
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...genre,
          // Always use the new position if provided
          x: genre.x !== undefined ? genre.x : updated[existingIndex].x,
          y: genre.y !== undefined ? genre.y : updated[existingIndex].y
        };
        return updated;
      }
      // Initialize position if not set (will be updated on drop)
      const genreWithPosition = {
        ...genre,
        x: genre.x !== undefined ? genre.x : Math.random() * (1920 - genre.radius * 2) + genre.radius,
        y: genre.y !== undefined ? genre.y : Math.random() * (1920 - genre.radius * 2) + genre.radius
      };
      return [...prev, genreWithPosition];
    });
  };

  // Move genre from canvas to library
  const moveGenreToLibrary = (genre) => {
    setCanvasGenres(prev => prev.filter(g => g.id !== genre.id));
    setLibraryGenres(prev => {
      // Check if genre already exists in library
      if (prev.find(g => g.id === genre.id)) {
        return prev;
      }
      return [...prev, genre];
    });
  };

  const loadSavedAlbums = async (token) => {
    try {
      setLoading(true);
      setData([]); // Clear existing data before loading new albums
      setLibraryAlbums([]); // Clear library albums
      setCanvasAlbums([]); // Clear canvas albums
      // Reset genres to library
      const initialGenres = createInitialGenres();
      setLibraryGenres(initialGenres);
      setCanvasGenres([]);
      const DISPLAY_LIMIT = 50;
      let allAlbums = [];
      let displayedCount = 0;
      let offset = 0;
      const limit = 50;
      let hasMore = true;
      
      console.log('=== Loading User\'s Saved Albums ===');

      while (hasMore) {
        const response = await getSavedAlbums(token, limit, offset);
        const newAlbums = response.items;
        allAlbums = allAlbums.concat(newAlbums);
        
        // Display only the first 50 albums incrementally
        if (displayedCount < DISPLAY_LIMIT) {
          const albumsToDisplay = newAlbums.slice(0, DISPLAY_LIMIT - displayedCount);
          
          // Transform albums for bubble chart
          const transformedBatch = albumsToDisplay.map((item, index) => {
            const album = item.album;
            return {
              id: album.id,
              name: album.name,
              radius: 70,
              group: album.artists[0]?.name || 'Unknown Artist',
              img: album.images[0]?.url || `https://picsum.photos/seed/${displayedCount + index}/200`,
              album: album,
              artist: album.artists[0]?.name,
              releaseDate: album.release_date,
              totalTracks: album.total_tracks,
              spotifyUrl: album.external_urls?.spotify || null
            };
          });
          
          // Incrementally add to library (not canvas) with deduplication
          setLibraryAlbums(prev => addAlbumsWithDeduplication(prev, transformedBatch));
          setData(prevData => addAlbumsWithDeduplication(prevData, transformedBatch));
          displayedCount += albumsToDisplay.length;
          
          console.log(`Loaded and displayed ${displayedCount} albums...`);
        }
        
        hasMore = response.next !== null;
        offset += limit;
        
        // Safety limit to prevent infinite loops
        if (offset > 1000) {
          console.warn('Reached safety limit of 1000 albums');
          break;
        }
      }
      
      setAlbums(allAlbums);
      console.log(`Total albums loaded: ${allAlbums.length}`);
      console.log(`Displaying: ${Math.min(displayedCount, DISPLAY_LIMIT)} albums`);
      
      // Output first 50 albums to console
      allAlbums.slice(0, DISPLAY_LIMIT).forEach((item, index) => {
        const album = item.album;
        console.log(`${index + 1}. ${album.name} by ${album.artists.map(a => a.name).join(', ')}`);
        console.log(`   - Release Date: ${album.release_date}`);
        console.log(`   - Total Tracks: ${album.total_tracks}`);
        console.log(`   - Album Art: ${album.images[0]?.url || 'N/A'}`);
        console.log(`   - Spotify URL: ${album.external_urls.spotify}`);
        console.log('---');
      });
    } catch (error) {
      console.error('Failed to load albums:', error);
      setError(`Failed to load albums: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    albums,
    libraryAlbums,
    canvasAlbums,
    libraryGenres,
    canvasGenres,
    loading,
    error,
    loadInitialAlbums,
    loadSavedAlbums,
    moveAlbumToCanvas,
    moveAlbumToLibrary,
    moveGenreToCanvas,
    moveGenreToLibrary,
    setError
  };
};
