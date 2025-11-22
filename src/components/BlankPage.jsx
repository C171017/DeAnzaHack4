import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlankPage.css';

// Generate 100 music entries
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

  const DATA = [];
  
  for (let i = 0; i < 100; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const musicName = musicNames[Math.floor(Math.random() * musicNames.length)];
    const imageUrl = `https://picsum.photos/seed/music${i}/300/300`;
    
    DATA.push({
      id: i + 1,
      name: musicName,
      artist: artist,
      image: imageUrl
    });
  }
  
  return DATA;
};

function BlankPage() {
  const navigate = useNavigate();
  
  // Generate and store data in DATA constant
  const DATA = useMemo(() => generateMusicData(), []);

  return (
    <div className="blank-page">
      <div className="blank-page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <h1>Music Collection</h1>
        <p className="subtitle">100 Generated Tracks</p>
      </div>
      <div className="music-grid-container">
        <div className="music-grid">
          {DATA.map((item) => (
            <div key={item.id} className="music-card">
              <div className="album-cover">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="music-info">
                <h3 className="music-name">{item.name}</h3>
                <p className="artist-name">{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => navigate('/page3')}
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

export default BlankPage;

