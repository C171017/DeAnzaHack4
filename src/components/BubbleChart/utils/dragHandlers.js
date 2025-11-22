import { VIEWBOX_SIZE, ALBUM_COLLISION_PADDING } from '../constants';

/**
 * Create drag handlers for nodes
 */
export const createDragHandlers = (simulation, albumCollisionPadding) => {
  const dragstarted = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    d.fx = d.x;
    d.fy = d.y;
    // Boost alpha and set target to keep simulation active during drag
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragged = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    
    const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
    const minX = boundaryRadius;
    const maxX = VIEWBOX_SIZE - boundaryRadius;
    const minY = boundaryRadius;
    const maxY = VIEWBOX_SIZE - boundaryRadius;
    
    d.fx = Math.max(minX, Math.min(maxX, event.x));
    d.fy = Math.max(minY, Math.min(maxY, event.y));
    // Continuously boost alpha during drag to keep simulation responsive
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragended = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    d.fx = null;
    d.fy = null;
    // Reset alpha target to allow natural decay
    simulation.alphaTarget(0);
  };

  return { dragstarted, dragged, dragended };
};

/**
 * Setup double-click handlers for album nodes
 */
export const setupAlbumClickHandlers = (albumNodes) => {
  albumNodes
    .on('dblclick', function(event, d) {
      event.stopPropagation();
      // For initial albums, check both spotifyUrl and external_urls.spotify
      const url = d.spotifyUrl || (d.external_urls && d.external_urls.spotify);
      if (url) {
        window.open(url, '_blank');
      }
    });
};
