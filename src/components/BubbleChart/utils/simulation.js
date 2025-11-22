import * as d3 from 'd3';
import {
  VIEWBOX_SIZE,
  GENRE_COLLISION_PADDING,
  ALBUM_COLLISION_PADDING,
  SIMULATION_CONFIG
} from '../constants';

/**
 * Create genre data objects for the simulation
 */
export const createGenreData = (genres, genreCollisionRadius) => {
  return genres.map(genre => ({
    id: `genre-${genre}`,
    name: genre,
    radius: genreCollisionRadius,
    circleRadius: 80, // Visual circle size
    isGenre: true,
    x: undefined,
    y: undefined
  }));
};

/**
 * Initialize random positions for nodes
 */
export const initializeNodePositions = (allData, viewBoxSize, albumCollisionPadding) => {
  allData.forEach(d => {
    if (d.x === undefined || d.y === undefined) {
      const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
      const padding = boundaryRadius;
      d.x = Math.random() * (viewBoxSize - padding * 2) + padding;
      d.y = Math.random() * (viewBoxSize - padding * 2) + padding;
    }
  });
};

/**
 * Create and configure the D3 force simulation
 */
export const createSimulation = (allData, albumCollisionPadding) => {
  return d3.forceSimulation(allData)
    .force('collide', d3.forceCollide().radius(d => {
      if (d.isGenre) {
        return d.radius;
      } else {
        return d.radius + albumCollisionPadding;
      }
    }).strength(SIMULATION_CONFIG.COLLISION_STRENGTH))
    .alphaDecay(SIMULATION_CONFIG.ALPHA_DECAY)
    .velocityDecay(SIMULATION_CONFIG.VELOCITY_DECAY);
};

/**
 * Enforce boundary constraints on nodes
 */
export const enforceBoundaries = (allData, viewBoxSize, albumCollisionPadding) => {
  allData.forEach(d => {
    const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
    const minX = boundaryRadius;
    const maxX = viewBoxSize - boundaryRadius;
    const minY = boundaryRadius;
    const maxY = viewBoxSize - boundaryRadius;
    
    if (d.x < minX) {
      d.x = minX;
      d.vx = 0;
    } else if (d.x > maxX) {
      d.x = maxX;
      d.vx = 0;
    }
    
    if (d.y < minY) {
      d.y = minY;
      d.vy = 0;
    } else if (d.y > maxY) {
      d.y = maxY;
      d.vy = 0;
    }
  });
};
