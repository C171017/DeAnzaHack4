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
    simulation.alphaTarget(0.3).restart();
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
    simulation.alphaTarget(0.3).restart();
  };

  const dragended = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    d.fx = null;
    d.fy = null;
    simulation.alphaTarget(0);
  };

  return { dragstarted, dragged, dragended };
};

/**
 * Setup click handlers for album nodes
 */
export const setupAlbumClickHandlers = (albumNodes) => {
  let clickStartPos = null;
  
  albumNodes
    .on('mousedown', function(event, d) {
      clickStartPos = { x: d.x, y: d.y };
    })
    .on('click', function(event, d) {
      if (clickStartPos && 
          Math.abs(d.x - clickStartPos.x) < 1 && 
          Math.abs(d.y - clickStartPos.y) < 1) {
        if (d.spotifyUrl) {
          window.open(d.spotifyUrl, '_blank');
        }
      }
      clickStartPos = null;
    });
};
