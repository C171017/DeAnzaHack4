import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page3.css';

// Generate the same music data as BlankPage
const generateMusicData = () => {
  const artists = [
    'The Weeknd', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Post Malone',
    'Ariana Grande', 'Ed Sheeran', 'Dua Lipa', 'Justin Bieber', 'The Chainsmokers',
    'Imagine Dragons', 'Coldplay', 'Maroon 5', 'Bruno Mars', 'Adele',
    'Eminem', 'Kanye West', 'Travis Scott', 'Kendrick Lamar', 'J. Cole',
    'BTS', 'Blackpink', 'Lana Del Rey', 'Lorde', 'SZA',
    'Doja Cat', 'Olivia Rodrigo', 'Harry Styles', 'Bad Bunny', 'J Balvin',
    'The Beatles', 'Queen', 'Led Zeppelin', 'Pink Floyd', 'Radiohead',
    'Arctic Monkeys', 'Tame Impala', 'Glass Animals', 'MGMT', 'Foster the People'
  ];

  const musicNames = [
    'Midnight Dreams', 'Electric Nights', 'Ocean Waves', 'City Lights', 'Starry Sky',
    'Golden Hour', 'Sunset Boulevard', 'Neon Dreams', 'Crystal Clear', 'Velvet Touch',
    'Moonlight Sonata', 'Thunder Road', 'Silent Storm', 'Dancing Shadows', 'Echo Chamber',
    'Digital Love', 'Cosmic Dance', 'Neon Nights', 'Starlight Express', 'Midnight Run',
    'Electric Pulse', 'Sound Waves', 'Rhythm Nation', 'Beat Drop', 'Bass Line',
    'Melody Lane', 'Harmony Street', 'Chord Progress', 'Note Perfect', 'Tune In',
    'Frequency Shift', 'Wave Length', 'Sound Check', 'Audio File', 'Track Record',
    'Playlist Mix', 'Album Art', 'Cover Song', 'Original Mix', 'Remix Version',
    'Live Session', 'Studio Take', 'Demo Track', 'Final Cut', 'Bonus Track',
    'Hidden Gem', 'Deep Cut', 'B-Side', 'Rare Find', 'Classic Hit',
    'New Release', 'Fresh Drop', 'Hot Track', 'Top Chart', 'Hit Single',
    'Summer Vibes', 'Winter Blues', 'Spring Fever', 'Autumn Leaves', 'Seasonal Mix',
    'Party Anthem', 'Chill Beats', 'Workout Mix', 'Study Playlist', 'Road Trip',
    'Late Night', 'Early Morning', 'Afternoon Delight', 'Evening Drive', 'Night Shift',
    'Feel Good', 'Mood Booster', 'Energy Boost', 'Relax Mode', 'Focus Time',
    'Dance Floor', 'Club Banger', 'House Party', 'Rave Ready', 'Festival Mix',
    'Acoustic Session', 'Unplugged', 'Live Performance', 'Concert Hall', 'Intimate Set',
    'Electronic Beat', 'Synth Wave', 'Retro Future', 'Cyber Punk', 'Neon Pop',
    'Soulful Sound', 'Jazz Fusion', 'Blues Rock', 'Funk Groove', 'R&B Smooth',
    'Hip Hop Flow', 'Rap Verse', 'Trap Beat', 'Drill Sound', 'Boom Bap'
  ];

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Blues', 'Country',
    'Classical', 'Reggae', 'Funk', 'Soul', 'Indie', 'Alternative', 'Metal',
    'Punk', 'Folk', 'Gospel', 'Latin', 'K-Pop', 'EDM', 'House', 'Techno',
    'Dubstep', 'Trap', 'Drill', 'Lo-Fi', 'Ambient', 'Synthwave', 'Disco'
  ];

  const moods = [
    'Energetic', 'Calm', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Melancholic',
    'Uplifting', 'Dark', 'Bright', 'Intense', 'Relaxed', 'Nostalgic', 'Futuristic',
    'Dreamy', 'Powerful', 'Gentle', 'Bold', 'Mysterious', 'Playful', 'Serious',
    'Euphoric', 'Chill', 'Passionate', 'Peaceful', 'Rebellious', 'Hopeful', 'Moody'
  ];

  const colors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black',
    'White', 'Gray', 'Brown', 'Cyan', 'Magenta', 'Gold', 'Silver', 'Violet',
    'Indigo', 'Turquoise', 'Coral', 'Lavender', 'Maroon', 'Navy', 'Teal',
    'Olive', 'Crimson', 'Amber', 'Emerald', 'Sapphire', 'Ruby', 'Pearl'
  ];

  const DATA = [];
  const TAGGSS = [];
  
  for (let i = 0; i < 100; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const musicName = musicNames[Math.floor(Math.random() * musicNames.length)];
    const imageUrl = `https://picsum.photos/seed/music${i}/300/300`;
    
    // Generate 1-3 random tags
    const numTags = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    const tagTypes = ['genre', 'mood', 'color'];
    const tags = [];
    
    // Shuffle tag types and pick random ones
    const shuffledTypes = tagTypes.sort(() => Math.random() - 0.5);
    
    for (let j = 0; j < numTags; j++) {
      const tagType = shuffledTypes[j];
      let tagValue;
      
      if (tagType === 'genre') {
        tagValue = genres[Math.floor(Math.random() * genres.length)];
      } else if (tagType === 'mood') {
        tagValue = moods[Math.floor(Math.random() * moods.length)];
      } else {
        tagValue = colors[Math.floor(Math.random() * colors.length)];
      }
      
      tags.push({
        type: tagType,
        value: tagValue
      });
    }
    
    const musicEntry = {
      id: i + 1,
      name: musicName,
      artist: artist,
      image: imageUrl,
      tags: tags
    };
    
    DATA.push(musicEntry);
    TAGGSS.push(...tags);
  }
  
  return { DATA, TAGGSS };
};

function Page3() {
  const navigate = useNavigate();
  const [DATTAA, setDATTAA] = useState(null);
  const [TAGGSS, setTAGGSS] = useState([]);

  // Load or generate data on mount
  useEffect(() => {
    // Check if DATTAA exists in localStorage
    const storedDATTAA = localStorage.getItem('DATTAA');
    const storedTAGGSS = localStorage.getItem('TAGGSS');
    
    if (storedDATTAA && storedTAGGSS) {
      // Use stored data
      try {
        const parsedDATA = JSON.parse(storedDATTAA);
        const parsedTAGGSS = JSON.parse(storedTAGGSS);
        setDATTAA(parsedDATA);
        setTAGGSS(parsedTAGGSS);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        // If parsing fails, generate new data
        const { DATA, TAGGSS: newTAGGSS } = generateMusicData();
        setDATTAA(DATA);
        setTAGGSS(newTAGGSS);
        localStorage.setItem('DATTAA', JSON.stringify(DATA));
        localStorage.setItem('TAGGSS', JSON.stringify(newTAGGSS));
      }
    } else {
      // Generate new data and store it
      const { DATA, TAGGSS: newTAGGSS } = generateMusicData();
      setDATTAA(DATA);
      setTAGGSS(newTAGGSS);
      localStorage.setItem('DATTAA', JSON.stringify(DATA));
      localStorage.setItem('TAGGSS', JSON.stringify(newTAGGSS));
    }
  }, []);

  // Use DATTAA instead of DATA
  const DATA = DATTAA || [];

  return (
    <div className="page3">
      <div className="page3-header">
        <button 
          className="back-button"
          onClick={() => navigate('/blank')}
        >
          ← Back to Music Collection
        </button>
        <h1>Music Chart with Tags</h1>
        <p className="subtitle">Organized Music Data with Tags</p>
      </div>
      <div className="chart-container">
        <div className="chart-wrapper">
          <table className="music-chart">
            <thead>
              <tr>
                <th>#</th>
                <th>Cover</th>
                <th>Music Name</th>
                <th>Artist</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {DATA.length > 0 && DATA.map((item) => (
                <tr key={item.id}>
                  <td className="rank">{item.id}</td>
                  <td className="cover-cell">
                    <img src={item.image} alt={item.name} className="cover-img" />
                  </td>
                  <td className="music-name">{item.name}</td>
                  <td className="artist-name">{item.artist}</td>
                  <td className="tags-cell">
                    <div className="tags-container">
                      {item.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`tag tag-${tag.type}`}
                        >
                          {tag.value}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={() => navigate('/page4')}
        className="arrow-button"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(166, 0, 255, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.backgroundColor = '#ff5500';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = 'var(--accent-color)';
        }}
      >
        →
      </button>
    </div>
  );
}

export default Page3;

