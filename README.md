# Hacksify - Music Bubble Visualizer

A web application that visualizes music taste as interactive, magnetic bubbles. Built for DeAnzaHack4.

## 🚀 Current Progress & Changelog

### 🎨 UI/UX Design Overhaul
- **SoundCloud-Inspired Aesthetic**: Implemented a premium dark mode theme (`#121212` background) with vibrant "SoundCloud Orange" (`#ff5500`) accents.
- **Responsive Layout**: Created a flexbox-based application shell with a fixed header and dynamic main content area.
- **Custom Typography**: Integrated modern sans-serif typography (Inter/System UI) for a clean, professional look.

### 🔮 Core Visualization Engine
- **D3.js Integration**: Implemented a physics-based force simulation using `d3-force`.
- **Magnetic Bubbles**:
  - **Physics**: Bubbles naturally cluster together using collision detection and centering forces.
  - **Interactivity**: Users can drag and throw bubbles around the screen.
  - **Visuals**: Each bubble renders as a perfect circle containing album art (currently using high-quality placeholders).
- **Dynamic Rendering**: The chart automatically adjusts to the window size.

### 🏗️ Application Architecture
- **Tech Stack**: Validated and set up the **Vite + React** environment.
- **Dependencies**: Installed and configured `d3` for data visualization and `framer-motion` for future animations.
- **Component Structure**:
  - `BubbleChart.jsx`: Encapsulated D3 logic into a reusable React component.
  - `App.jsx`: Manages application state and generates mock data for testing.
- **Mock Data Pipeline**: Implemented a generator for random tracks, genres, and popularity metrics to test the visualization before API integration.

## 🛠️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/C171017/DeAnzaHack4.git
   cd daHacks
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔜 Next Steps
- [ ] Connect Spotify API for real user data.
- [ ] Implement genre-based clustering (bubbles of the same genre stick together).
- [ ] Add "Now Playing" details on hover/click.
