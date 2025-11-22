import { useState, useEffect, useRef } from 'react';
import { getSavedAlbums } from '../utils/spotifyApi';
import initialAlbumsData from '../data/initialAlbums.json';
import { GENRES, GENRE_COLORS, GENRE_TEXT_FONT_SIZE, GENRE_COLLISION_PADDING } from '../components/BubbleChart/constants';

const STORAGE_KEY = 'hacksify_canvas_positions';

/**
 * Save canvas state to localStorage
 */
const saveCanvasState = (canvasAlbums, canvasGenres) => {
  try {
    const state = {
      canvasAlbums: canvasAlbums.map(album => ({
        id: album.id,
        x: album.x,
        y: album.y,
        name: album.name,
        artist: album.artist,
        img: album.img,
        radius: album.radius,
        group: album.group,
        releaseDate: album.releaseDate,
        totalTracks: album.totalTracks,
        spotifyUrl: album.spotifyUrl,
        album: album.album // Full album object if available
      })),
      canvasGenres: canvasGenres.map(genre => ({
        id: genre.id,
        x: genre.x,
        y: genre.y,
        name: genre.name,
        color: genre.color,
        radius: genre.radius,
        circleRadius: genre.circleRadius,
        isGenre: genre.isGenre
      }))
    };
    
    console.log('saving canvas state', state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save canvas state:', error);
  }
};

/**
 * Load canvas state from localStorage
 */
const loadCanvasState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load canvas state:', error);
  }
  return null;
};

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
  const isRestoringRef = useRef(false);
  const canvasAlbumsRef = useRef([]);
  const canvasGenresRef = useRef([]);

  // Initialize genres in library on mount
  useEffect(() => {
    const initialGenres = createInitialGenres();
    setLibraryGenres(initialGenres);
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    canvasAlbumsRef.current = canvasAlbums;
  }, [canvasAlbums]);
  
  useEffect(() => {
    canvasGenresRef.current = canvasGenres;
  }, [canvasGenres]);

  // Helper function to save canvas state (only called on user interactions)
  const saveCanvasStateOnInteraction = () => {
    if (!isRestoringRef.current) {
      // Use setTimeout to ensure state has updated, then read from refs
      setTimeout(() => {
        const currentAlbums = canvasAlbumsRef.current;
        const currentGenres = canvasGenresRef.current;
        if (currentAlbums.length > 0 || currentGenres.length > 0) {
          saveCanvasState(currentAlbums, currentGenres);
        }
      }, 0);
    }
  };

  // Restore canvas state from localStorage
  const restoreCanvasState = (availableAlbums, availableGenres) => {
    const savedState = loadCanvasState();
    if (!savedState) return;

    isRestoringRef.current = true;

    try {
      // Restore albums
      if (savedState.canvasAlbums && savedState.canvasAlbums.length > 0) {
        const albumMap = new Map(availableAlbums.map(a => [a.id, a]));
        const restoredAlbums = savedState.canvasAlbums
          .filter(savedAlbum => albumMap.has(savedAlbum.id))
          .map(savedAlbum => {
            const currentAlbum = albumMap.get(savedAlbum.id);
            return {
              ...currentAlbum,
              x: savedAlbum.x,
              y: savedAlbum.y
            };
          });
        
        if (restoredAlbums.length > 0) {
          setCanvasAlbums(restoredAlbums);
          // Remove restored albums from library
          const restoredAlbumIds = new Set(restoredAlbums.map(a => a.id));
          setLibraryAlbums(prev => prev.filter(a => !restoredAlbumIds.has(a.id)));
        }
      }

      // Restore genres
      if (savedState.canvasGenres && savedState.canvasGenres.length > 0) {
        const genreMap = new Map(availableGenres.map(g => [g.id, g]));
        const restoredGenres = savedState.canvasGenres
          .filter(savedGenre => genreMap.has(savedGenre.id))
          .map(savedGenre => {
            const currentGenre = genreMap.get(savedGenre.id);
            return {
              ...currentGenre,
              x: savedGenre.x,
              y: savedGenre.y
            };
          });
        
        if (restoredGenres.length > 0) {
          setCanvasGenres(restoredGenres);
          // Remove restored genres from library
          const restoredGenreIds = new Set(restoredGenres.map(g => g.id));
          setLibraryGenres(prev => prev.filter(g => !restoredGenreIds.has(g.id)));
        }
      }
    } catch (error) {
      console.error('Failed to restore canvas state:', error);
    } finally {
      // Reset flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    }
  };

  const loadInitialAlbums = () => {
    const initialData = transformInitialAlbums();
    setData(initialData);
    setLibraryAlbums([]);
    setCanvasAlbums([]);
    // Reset genres to library
    const initialGenres = createInitialGenres();
    setLibraryGenres(initialGenres);
    setCanvasGenres([]);
    
    // Restore saved positions after a short delay to ensure state is set
    setTimeout(() => {
      restoreCanvasState(initialData, initialGenres);
    }, 50);
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
    
    // Save after user interaction
    saveCanvasStateOnInteraction();
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
    
    // Save after user interaction
    saveCanvasStateOnInteraction();
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
    
    // Save after user interaction
    saveCanvasStateOnInteraction();
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
    
    // Save after user interaction
    saveCanvasStateOnInteraction();
  };

  // Update position of existing canvas item (for drag updates)
  const updateCanvasItemPosition = (item) => {
    if (item.isGenre) {
      setCanvasGenres(prev => {
        const existingIndex = prev.findIndex(g => g.id === item.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            x: item.x,
            y: item.y
          };
          return updated;
        }
        return prev;
      });
    } else {
      setCanvasAlbums(prev => {
        const existingIndex = prev.findIndex(a => a.id === item.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            x: item.x,
            y: item.y
          };
          return updated;
        }
        return prev;
      });
    }
    
    // Save after user interaction (dragging on canvas)
    saveCanvasStateOnInteraction();
  };

  const loadSavedAlbums = async (token) => {
    try {
      setLoading(true);
      setData([]); // Clear existing data before loading new albums
      setLibraryAlbums([]); // Clear library albums
      
      // Reset genres to library
      const initialGenres = createInitialGenres();
      setLibraryGenres(initialGenres);
      
      // RESTORE SAVED STATE IMMEDIATELY (before API calls) with placeholders
      const savedState = loadCanvasState();
      isRestoringRef.current = true;
      
      // Restore genres immediately (they don't need API data)
      if (savedState?.canvasGenres && savedState.canvasGenres.length > 0) {
        const genreMap = new Map(initialGenres.map(g => [g.id, g]));
        const restoredGenres = savedState.canvasGenres
          .filter(savedGenre => genreMap.has(savedGenre.id))
          .map(savedGenre => {
            const currentGenre = genreMap.get(savedGenre.id);
            return {
              ...currentGenre,
              x: savedGenre.x,
              y: savedGenre.y
            };
          });
        
        if (restoredGenres.length > 0) {
          setCanvasGenres(restoredGenres);
          const restoredGenreIds = new Set(restoredGenres.map(g => g.id));
          setLibraryGenres(prev => prev.filter(g => !restoredGenreIds.has(g.id)));
        }
      } else {
        setCanvasGenres([]);
      }
      
      // Create placeholder albums from saved state
      if (savedState?.canvasAlbums && savedState.canvasAlbums.length > 0) {
        const placeholderAlbums = savedState.canvasAlbums.map(savedAlbum => ({
          id: savedAlbum.id,
          name: 'Loading album',
          artist: savedAlbum.artist || 'Unknown Artist',
          img: null, // No image for placeholder
          radius: savedAlbum.radius || 70,
          group: savedAlbum.group || 'Unknown Artist',
          releaseDate: savedAlbum.releaseDate,
          totalTracks: savedAlbum.totalTracks,
          spotifyUrl: savedAlbum.spotifyUrl,
          x: savedAlbum.x,
          y: savedAlbum.y,
          isPlaceholder: true,
          album: savedAlbum.album // Preserve full album object if available
        }));
        setCanvasAlbums(placeholderAlbums);
      } else {
        setCanvasAlbums([]);
      }
      
      // Reset restoration flag after a short delay
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
      
      const DISPLAY_LIMIT = 50;
      let allAlbums = [];
      let allTransformedAlbums = []; // Track all transformed albums
      let displayedCount = 0;
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await getSavedAlbums(token, limit, offset);
        const newAlbums = response.items;
        allAlbums = allAlbums.concat(newAlbums);
        
        // Transform ALL new albums (for placeholder replacement)
        const allTransformedNew = newAlbums.map((item, index) => {
          const album = item.album;
          return {
            id: album.id,
            name: album.name,
            radius: 70,
            group: album.artists[0]?.name || 'Unknown Artist',
            img: album.images[0]?.url || `https://picsum.photos/seed/${offset + index}/200`,
            album: album,
            artist: album.artists[0]?.name,
            releaseDate: album.release_date,
            totalTracks: album.total_tracks,
            spotifyUrl: album.external_urls?.spotify || null
          };
        });
        
        // Replace placeholders with real album data if IDs match (for ALL albums, not just first 50)
        setCanvasAlbums(prev => {
          const updated = [...prev];
          const replacedIds = new Set();
          
          allTransformedNew.forEach(realAlbum => {
            const placeholderIndex = updated.findIndex(a => a.id === realAlbum.id && a.isPlaceholder);
            if (placeholderIndex >= 0) {
              // Replace placeholder with real album data, preserving position
              const placeholder = updated[placeholderIndex];
              updated[placeholderIndex] = {
                ...realAlbum,
                x: placeholder.x,
                y: placeholder.y,
                // Remove isPlaceholder flag
              };
              replacedIds.add(realAlbum.id);
            }
          });
          
          return updated;
        });
        
        // Display only the first 50 albums incrementally
        if (displayedCount < DISPLAY_LIMIT) {
          const albumsToDisplay = allTransformedNew.slice(0, DISPLAY_LIMIT - displayedCount);
          
          // Track all transformed albums
          allTransformedAlbums = addAlbumsWithDeduplication(allTransformedAlbums, albumsToDisplay);
          
          // Add albums to library (excluding those that are on canvas)
          setCanvasAlbums(currentCanvas => {
            const canvasAlbumIds = new Set(currentCanvas.map(a => a.id));
            const albumsForLibrary = albumsToDisplay.filter(a => !canvasAlbumIds.has(a.id));
            
            if (albumsForLibrary.length > 0) {
              setLibraryAlbums(prev => addAlbumsWithDeduplication(prev, albumsForLibrary));
            }
            
            return currentCanvas; // Don't change canvas
          });
          
          setData(prevData => addAlbumsWithDeduplication(prevData, albumsToDisplay));
          displayedCount += albumsToDisplay.length;
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

      // Note: Restoration already happened at the beginning with placeholders
      // Placeholders are replaced with real data as albums load above
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
    updateCanvasItemPosition,
    setError
  };
};
