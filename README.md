# Music Bubble Visualizer

A React web application that visualizes music albums as interactive, physics-based bubbles. Built with D3.js for data visualization and React Router for navigation. Features Spotify integration to display user's saved albums.

## Features

## Things needed to add

the top 3 10 coordination system
zoom
auto size svg?
a fake 3d vertical time line
manually edit genre
add color pattern

### Home Page (Bubble Visualization)
- **Initial Display**: Shows 11 curated album covers as square bubbles when not authenticated
- **Spotify Integration**: After authentication, displays user's saved Spotify albums (up to 50 albums)
- **Interactive Bubbles**: 
  - Perfect square album covers (140x140px) preserving original aspect ratio
  - Draggable bubbles with D3.js force simulation
  - Random initial positions spread across viewport
  - Boundary constraints keeping all bubbles within viewport
  - Physics-based collision detection and repulsion
- **White Background**: Clean, minimal design with white canvas
- **Authentication**: Spotify OAuth 2.0 with PKCE flow

### Additional Pages
- **BlankPage** (`/blank`): Grid view of 100 generated music tracks
- **Page3** (`/page3`): Table/chart view with music tracks and tags (genre, mood, color)
- **Page4** (`/page4`): Interactive canvas with tag bubbles and music bubbles that follow matching tags

## Tech Stack

- **React 18.2.0** - UI framework
- **React Router DOM 7.9.6** - Client-side routing
- **D3.js 7.9.0** - Data visualization and force simulation
- **Vite 5.0.8** - Build tool and dev server
- **Spotify Web API** - Music data integration

## Project Structure

```
src/
├── App.jsx                 # Main application component with Spotify auth
├── Callback.jsx            # OAuth callback handler
├── components/
│   ├── BubbleChart.jsx     # D3.js bubble visualization component
│   ├── BlankPage.jsx       # Grid view of music tracks
│   ├── Page3.jsx           # Table view with tags
│   └── Page4.jsx           # Interactive tag/music bubble canvas
├── data/
│   ├── albums.json         # Sample album data
│   └── initialAlbums.json  # Initial screen albums data
├── assets/
│   └── images/
│       └── initial-screen-albums/  # 11 album cover images
└── utils/
    ├── spotifyAuth.js      # Spotify OAuth authentication
    └── spotifyApi.js       # Spotify API client
```

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hackthon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Spotify API** (optional, for authentication)
   - Register your application at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add redirect URI: `http://127.0.0.1:5173/callback` (or your dev server port)
   - Update `CLIENT_ID` in `src/utils/spotifyAuth.js` if needed

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Without Authentication
- The app loads with 11 initial album covers displayed as interactive bubbles
- All bubbles are draggable and use physics simulation
- Navigate to other pages using the arrow button

### With Spotify Authentication
1. Click "Login with Spotify" button
2. Authorize the application in Spotify
3. Your saved albums (up to 50) will be loaded and displayed as bubbles
4. Click "Logout" to return to initial album view

### Navigation
- **Home** (`/`): Bubble visualization
- **Music Collection** (`/blank`): Grid view of generated tracks
- **Music Chart** (`/page3`): Table view with tags
- **Interactive Canvas** (`/page4`): Tag and music bubble interaction

## Key Implementation Details

### BubbleChart Component
- Uses D3.js force simulation with:
  - `forceManyBody`: Repulsion between bubbles
  - `forceCenter`: Centering force
  - `forceCollide`: Collision detection using diagonal distance for squares
- Boundary constraints prevent bubbles from leaving viewport
- Random initial positioning with proper padding
- Drag interaction with position constraints

### Spotify Integration
- OAuth 2.0 Authorization Code flow with PKCE
- Stores access token in localStorage
- Fetches user's saved albums with pagination
- Displays first 50 albums incrementally

### Data Files
- `albums.json`: Sample album data structure
- `initialAlbums.json`: Metadata for 11 initial screen albums
- Album images stored in `src/assets/images/initial-screen-albums/`

## Development

The project uses Vite for fast development with HMR (Hot Module Replacement). The default dev server runs on `http://localhost:5173`.

## License

Private project for DeAnzaHack4.
