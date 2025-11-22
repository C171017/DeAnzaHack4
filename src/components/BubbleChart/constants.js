// Genre configuration
export const GENRES = [
  'Rock', 'Funk', 'Hip Hop', 'Electronic', 'Jazz', 'Blues', 
  'Soul', 'Punk', 'Alternative', 'Indie', 'Pop', 'R&B'
];

// Color mapping for each genre
export const GENRE_COLORS = {
  'Rock': '#FF6B6B',
  'Funk': '#4ECDC4',
  'Hip Hop': '#FFE66D',
  'Electronic': '#A8E6CF',
  'Jazz': '#FF8B94',
  'Blues': '#95E1D3',
  'Soul': '#F38181',
  'Punk': '#AA96DA',
  'Alternative': '#FCBAD3',
  'Indie': '#FFD93D',
  'Pop': '#6BCB77',
  'R&B': '#FFD700'
};

// Chart configuration constants
export const VIEWBOX_SIZE = 1920;
export const SVG_SIZE_MULTIPLIER = 1.5;
export const GENRE_TEXT_FONT_SIZE = 36;
export const GENRE_COLLISION_PADDING = 8;
export const GENRE_CIRCLE_RADIUS = 80;
export const ALBUM_COLLISION_PADDING = 6;

// Simulation configuration
export const SIMULATION_CONFIG = {
  ALPHA_DECAY: 0.02,
  VELOCITY_DECAY: 0.4,
  COLLISION_STRENGTH: 0.5
};

// Zoom configuration
export const ZOOM_CONFIG = {
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 2.5
};

// Scrollbar configuration
export const SCROLLBAR_CONFIG = {
  WIDTH: 16,
  TRACK_WIDTH: 12,
  THUMB_MIN_HEIGHT: 30
};
