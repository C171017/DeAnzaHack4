import * as d3 from 'd3';
import { VIEWBOX_SIZE, ALBUM_COLLISION_PADDING } from '../constants';

const addSpotifyPlayParam = (url) => {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('open.spotify.com')) {
      parsed.searchParams.set('play', '1');
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

const resolveSpotifyPlaybackUrl = (albumData) => {
  const directTrackUrl =
    albumData.trackUrl ||
    albumData.spotifyTrackUrl ||
    albumData.track?.external_urls?.spotify;

  if (directTrackUrl) {
    return addSpotifyPlayParam(directTrackUrl);
  }

  const albumUrl =
    albumData.spotifyUrl ||
    albumData.external_urls?.spotify ||
    albumData.album?.external_urls?.spotify;

  return addSpotifyPlayParam(albumUrl);
};

/**
 * Create drag handlers for nodes
 */
export const createDragHandlers = (simulation, albumCollisionPadding) => {
  const dragstarted = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    
    // Zero out velocity to prevent momentum from causing jumps
    d.vx = 0;
    d.vy = 0;
    d.fx = d.x;
    d.fy = d.y;
    
    // Mark node as being dragged to exclude from collision forces
    d._isDragging = true;
    
    // Boost alpha and set target to keep simulation active during drag
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragged = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    
    // Use original radius for boundary calculations (not collision radius)
    const originalRadius = d.isGenre ? d.radius : d.radius;
    const boundaryRadius = d.isGenre ? originalRadius : (originalRadius + albumCollisionPadding);
    const minX = boundaryRadius;
    const maxX = VIEWBOX_SIZE - boundaryRadius;
    const minY = boundaryRadius;
    const maxY = VIEWBOX_SIZE - boundaryRadius;
    
    // Calculate clamped position
    const clampedX = Math.max(minX, Math.min(maxX, event.x));
    const clampedY = Math.max(minY, Math.min(maxY, event.y));
    
    // Update both fixed position and actual position to prevent teleporting during collisions
    // Also zero out velocity to prevent momentum from causing jumps
    d.x = clampedX;
    d.y = clampedY;
    d.vx = 0;
    d.vy = 0;
    d.fx = clampedX;
    d.fy = clampedY;
    
    // Continuously boost alpha during drag to keep simulation responsive
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragended = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    
    // Remove drag flag
    d._isDragging = false;
    
    d.fx = null;
    d.fy = null;
    
    // Reset alpha target to allow natural decay
    simulation.alphaTarget(0);
  };

  return { dragstarted, dragged, dragended };
};

/**
 * Setup click handlers for album nodes
 */
export const setupAlbumClickHandlers = (albumNodes) => {
  albumNodes
    .on('click', function(event, d) {
      if (event.defaultPrevented) {
        return;
      }

      event.stopPropagation();

      const url = resolveSpotifyPlaybackUrl(d);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
};
