import { useState } from 'react';
import { getSavedAlbums } from '../utils/spotifyApi';
import initialAlbumsData from '../data/initialAlbums.json';

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
 * Custom hook for managing albums data
 */
export const useAlbums = () => {
  const [data, setData] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInitialAlbums = () => {
    const initialData = transformInitialAlbums();
    setData(initialData);
  };

  const loadSavedAlbums = async (token) => {
    try {
      setLoading(true);
      setData([]); // Clear existing data before loading new albums
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
          
          // Incrementally add to display
          setData(prevData => [...prevData, ...transformedBatch]);
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
    loading,
    error,
    loadInitialAlbums,
    loadSavedAlbums,
    setError
  };
};
