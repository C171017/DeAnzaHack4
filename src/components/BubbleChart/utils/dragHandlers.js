import * as d3 from 'd3';
import { VIEWBOX_SIZE, ALBUM_COLLISION_PADDING, SIMULATION_CONFIG } from '../constants';

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
export const createDragHandlers = (simulation, albumCollisionPadding, options = {}) => {
  const { enableClusterDrag = false } = options;
  const clampNodePosition = (node, targetX, targetY) => {
    const boundaryRadius = node.isGenre ? node.radius : (node.radius + albumCollisionPadding);
    const minX = boundaryRadius;
    const maxX = VIEWBOX_SIZE - boundaryRadius;
    const minY = boundaryRadius;
    const maxY = VIEWBOX_SIZE - boundaryRadius;

    return {
      x: Math.max(minX, Math.min(maxX, targetX)),
      y: Math.max(minY, Math.min(maxY, targetY))
    };
  };

  const ensureStickyLink = (source, target) => {
    if (!source || !target || source.id === target.id) {
      return;
    }

    if (!source._stickyLinks) {
      source._stickyLinks = new Set();
    }

    if (!target._stickyLinks) {
      target._stickyLinks = new Set();
    }

    source._stickyLinks.add(target.id);
    target._stickyLinks.add(source.id);
  };

  const collectCluster = (rootNode) => {
    const nodesById = new Map(simulation.nodes().map(node => [node.id, node]));
    const visited = new Set();
    const queue = [rootNode];
    const cluster = [];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current || visited.has(current.id)) {
        continue;
      }

      visited.add(current.id);
      cluster.push(current);

      if (!current._stickyLinks) {
        continue;
      }

      for (const linkedId of current._stickyLinks) {
        if (!visited.has(linkedId)) {
          queue.push(nodesById.get(linkedId));
        }
      }
    }

    return cluster;
  };

  const lockClusterToPrimary = (primaryNode, primaryX, primaryY) => {
    const cluster = collectCluster(primaryNode);

    if (!primaryNode._clusterDragOffsets) {
      primaryNode._clusterDragOffsets = new Map();
    }

    primaryNode._clusterDragOffsets.set(primaryNode.id, { x: 0, y: 0 });

    cluster.forEach((node) => {
      if (!primaryNode._clusterDragOffsets.has(node.id)) {
        primaryNode._clusterDragOffsets.set(node.id, {
          x: node.x - primaryNode.x,
          y: node.y - primaryNode.y
        });
      }

      const offset = primaryNode._clusterDragOffsets.get(node.id);
      const nextPosition = clampNodePosition(node, primaryX + offset.x, primaryY + offset.y);

      node._isDraggedWithCluster = node.id !== primaryNode.id;
      node.x = nextPosition.x;
      node.y = nextPosition.y;
      node.vx = 0;
      node.vy = 0;
      node.fx = nextPosition.x;
      node.fy = nextPosition.y;
    });
  };

  const clearClusterDrag = (primaryNode) => {
    const cluster = collectCluster(primaryNode);

    cluster.forEach((node) => {
      node._isDraggedWithCluster = false;

      if (node.id !== primaryNode.id) {
        node.fx = null;
        node.fy = null;
      }
    });

    primaryNode._clusterDragOffsets = null;
  };

  const connectNearbyNodes = (primaryNode) => {
    const nodes = simulation.nodes().filter(node => !node.isGenre);
    const sourceCluster = collectCluster(primaryNode);

    sourceCluster.forEach((source) => {
      nodes.forEach((target) => {
        if (source.id === target.id) {
          return;
        }

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.hypot(dx, dy);
        const snapDistance =
          source.radius +
          target.radius +
          (albumCollisionPadding * 2) +
          SIMULATION_CONFIG.STICKY_GAP +
          SIMULATION_CONFIG.STICKY_SNAP_DISTANCE;

        if (distance <= snapDistance) {
          ensureStickyLink(source, target);
        }
      });
    });
  };

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

    if (enableClusterDrag && !d.isGenre) {
      d._clusterDragOffsets = new Map([[d.id, { x: 0, y: 0 }]]);
      lockClusterToPrimary(d, d.x, d.y);
    }
    
    // Boost alpha and set target to keep simulation active during drag
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragged = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }

    const clampedPosition = clampNodePosition(d, event.x, event.y);
    const clampedX = clampedPosition.x;
    const clampedY = clampedPosition.y;

    if (enableClusterDrag && !d.isGenre) {
      connectNearbyNodes(d);
      lockClusterToPrimary(d, clampedX, clampedY);
    } else {
      // Update both fixed position and actual position to prevent teleporting during collisions
      // Also zero out velocity to prevent momentum from causing jumps
      d.x = clampedX;
      d.y = clampedY;
      d.vx = 0;
      d.vy = 0;
      d.fx = clampedX;
      d.fy = clampedY;
    }
    
    // Continuously boost alpha during drag to keep simulation responsive
    simulation.alpha(1).alphaTarget(0.3).restart();
  };

  const dragended = (event, d) => {
    if (event.sourceEvent) {
      event.sourceEvent.stopPropagation();
    }
    
    // Remove drag flag
    d._isDragging = false;

    if (enableClusterDrag && !d.isGenre) {
      clearClusterDrag(d);
    }

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
