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
  // Custom collision force that excludes dragged nodes
  const collide = d3.forceCollide()
    .radius(d => {
      // If node is being dragged, set collision radius to 0 to prevent interference
      if (d._isDragging) {
        return 0;
      }
      if (d.isGenre) {
        return d.radius;
      } else {
        return d.radius + albumCollisionPadding;
      }
    })
    .strength(SIMULATION_CONFIG.COLLISION_STRENGTH);

  const magnetic = (nodes) => {
    const albumNodes = nodes.filter(node => !node.isGenre);

    const force = (alpha) => {
      for (let i = 0; i < albumNodes.length; i++) {
        const source = albumNodes[i];

        for (let j = i + 1; j < albumNodes.length; j++) {
          const target = albumNodes[j];

          if (source._isDragging && target._isDragging) {
            continue;
          }

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.hypot(dx, dy);

          if (!distance) {
            continue;
          }

          const minimumDistance =
            source.radius +
            target.radius +
            (albumCollisionPadding * 2) +
            SIMULATION_CONFIG.MAGNETIC_GAP;
          const magneticDistance = minimumDistance + SIMULATION_CONFIG.MAGNETIC_RANGE;

          if (distance > magneticDistance) {
            continue;
          }

          const pull = (distance - minimumDistance) * SIMULATION_CONFIG.MAGNETIC_STRENGTH * alpha;
          const offsetX = (dx / distance) * pull;
          const offsetY = (dy / distance) * pull;

          if (!source._isDragging) {
            source.vx += offsetX;
            source.vy += offsetY;
          }

          if (!target._isDragging) {
            target.vx -= offsetX;
            target.vy -= offsetY;
          }
        }
      }
    };

    force.initialize = () => {};
    return force;
  };

  return d3.forceSimulation(allData)
    .force('collide', collide)
    .force('magnetic', magnetic(allData))
    .alphaDecay(SIMULATION_CONFIG.ALPHA_DECAY)
    .velocityDecay(SIMULATION_CONFIG.VELOCITY_DECAY);
};

/**
 * Enforce boundary constraints on nodes
 */
export const enforceBoundaries = (allData, viewBoxSize, albumCollisionPadding) => {
  allData.forEach(d => {
    // Skip boundary enforcement for dragged nodes (they're already constrained in drag handler)
    if (d._isDragging) {
      return;
    }
    
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
