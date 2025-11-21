import React, { useState, useEffect } from 'react';
import BubbleChart from './components/BubbleChart';
import './App.css';

// Mock Data Generation
const generateMockData = (count) => {
  const genres = ['Hip Hop', 'Rock', 'Pop', 'Jazz', 'Electronic', 'R&B', 'Indie', 'Classical'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Track ${i + 1}`,
    radius: Math.random() * 30 + 20, // Random radius between 20 and 50
    group: genres[Math.floor(Math.random() * genres.length)],
    img: `https://picsum.photos/seed/${i}/200` // Random placeholder image
  }));
};

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate fetching data
    setData(generateMockData(30));
  }, []);

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
          <div className="avatar"></div>
        </div>
      </header>
      <main className="visualizer-container">
        <BubbleChart data={data} />
      </main>
    </div>
  );
}

export default App;