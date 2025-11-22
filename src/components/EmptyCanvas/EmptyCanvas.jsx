import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  VIEWBOX_SIZE,
  SVG_SIZE_MULTIPLIER,
  ALBUM_COLLISION_PADDING
} from '../BubbleChart/constants';
import {
  initializeNodePositions,
  createSimulation,
  enforceBoundaries
} from '../BubbleChart/utils/simulation';
import {
  createImagePatterns,
  createGenreGradients,
  renderGenreCircles,
  renderGenreText
} from '../BubbleChart/utils/rendering';
import {
  createDragHandlers,
  setupAlbumClickHandlers
} from '../BubbleChart/utils/dragHandlers';
import {
  createZoomBehavior,
  setupPanHandlers,
  setupCursorManagement
} from '../BubbleChart/utils/zoomPan';
import {
  createScrollbars,
  createUpdateScrollbars,
  setupScrollbarDragHandlers
} from '../BubbleChart/utils/scrollbars';

/**
 * EmptyCanvas component - renders an empty SVG canvas that can accept dropped albums and genres
 * Used after login while albums are loading in the background
 */
const EmptyCanvas = ({ albums = [], genres = [], onAlbumDrop, onAlbumDragStart, onGenreDrop, onGenreDragStart }) => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const zoomTransformRef = useRef(d3.zoomIdentity);

  useEffect(() => {
    // Save current zoom transform before re-rendering
    if (svgRef.current) {
      const currentTransform = d3.zoomTransform(svgRef.current);
      if (currentTransform && currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0) {
        zoomTransformRef.current = currentTransform;
      }
    }

    // Calculate SVG size: 150% of the largest window dimension
    const maxWindowDimension = Math.max(window.innerWidth, window.innerHeight);
    const svgSize = maxWindowDimension * SVG_SIZE_MULTIPLIER;

    // Calculate position to center SVG on window
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    const svgLeft = windowCenterX - svgSize / 2;
    const svgTop = windowCenterY - svgSize / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', svgSize)
      .attr('height', svgSize)
      .attr('viewBox', `0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', 'transparent')
      .style('overflow', 'visible')
      .style('position', 'absolute')
      .style('left', `${svgLeft}px`)
      .style('top', `${svgTop}px`)
      .style('display', 'block')
      .style('cursor', 'grab');

    // Clear previous renders
    svg.selectAll('*').remove();

    // Create a container group for pan/zoom transformations
    const container = svg.append('g').attr('class', 'zoom-container');

    // Add background rectangle inside container for drop zone
    const backgroundRect = container.append('rect')
      .attr('width', VIEWBOX_SIZE)
      .attr('height', VIEWBOX_SIZE)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#ffffff')
      .style('pointer-events', 'all')
      .style('cursor', 'default');

      // Setup drop handlers for background
      backgroundRect
        .on('dragover', function(event) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        })
        .on('drop', function(event) {
          event.preventDefault();
          try {
            const data = JSON.parse(event.dataTransfer.getData('application/json'));
            if (data) {
              // Get the current zoom transform
              const transform = d3.zoomTransform(svg.node());
              
              // Get pointer position relative to the SVG element
              const [svgX, svgY] = d3.pointer(event, svg.node());
              
              // Transform to viewBox coordinates by applying inverse transform
              // The transform is: x' = k * x + tx, so inverse is: x = (x' - tx) / k
              const viewBoxX = (svgX - transform.x) / transform.k;
              const viewBoxY = (svgY - transform.y) / transform.k;
              
              // Clamp position to boundaries
              const boundaryRadius = data.isGenre ? data.radius : (data.radius + ALBUM_COLLISION_PADDING);
              const minX = boundaryRadius;
              const maxX = VIEWBOX_SIZE - boundaryRadius;
              const minY = boundaryRadius;
              const maxY = VIEWBOX_SIZE - boundaryRadius;
              
              const clampedX = Math.max(minX, Math.min(maxX, viewBoxX));
              const clampedY = Math.max(minY, Math.min(maxY, viewBoxY));
              
              // Find the node in the simulation and fix its position
              if (simulationRef.current) {
                const node = simulationRef.current.nodes().find(n => n.id === data.id);
                if (node) {
                  // Fix the position in the simulation immediately
                  node.x = clampedX;
                  node.y = clampedY;
                  node.vx = 0;
                  node.vy = 0;
                  node.fx = clampedX;
                  node.fy = clampedY;
                  
                  // Update the visual position immediately (before simulation tick)
                  container.selectAll('.node').each(function(d) {
                    if (d && d.id === data.id) {
                      d3.select(this).attr('transform', `translate(${clampedX},${clampedY})`);
                    }
                  });
                  
                  // Restart simulation to apply the fix
                  simulationRef.current.alpha(1).restart();
                  // Release the fix after a short delay to allow physics
                  setTimeout(() => {
                    if (node && simulationRef.current) {
                      const stillExists = simulationRef.current.nodes().find(n => n.id === data.id);
                      if (stillExists) {
                        node.fx = null;
                        node.fy = null;
                      }
                    }
                  }, 500);
                }
              }
              
              // Add position to item
              const itemWithPosition = {
                ...data,
                x: clampedX,
                y: clampedY
              };
              
              // Call appropriate handler based on item type
              // For genres: only move on drop (not on drag start)
              if (data.isGenre && onGenreDrop) {
                onGenreDrop(itemWithPosition);
              } else if (!data.isGenre && onAlbumDrop) {
                onAlbumDrop(itemWithPosition);
              }
            }
          } catch (error) {
            console.error('Failed to parse drop data:', error);
          }
        });

    // Define defs for images and gradients (create once)
    const defs = svg.append('defs');

    // Combine genres and albums for simulation (genres first so they render below albums)
    const allData = [...(genres || []), ...(albums || [])];

    // Render albums and genres if any
    let simulation = null;
    if (allData.length > 0) {
      // Preserve existing positions from simulation if it exists (before stopping)
      let existingPositions = new Map();
      if (simulationRef.current) {
        const existingNodes = simulationRef.current.nodes();
        existingNodes.forEach(node => {
          if (node.x !== undefined && node.y !== undefined) {
            existingPositions.set(node.id, { x: node.x, y: node.y });
          }
        });
        simulationRef.current.stop();
      }
      
      // Initialize positions for items that don't have them, preserving from simulation if available
      const dataWithPositions = allData.map(item => {
        // First check if we have this item in the existing simulation
        const existingPos = existingPositions.get(item.id);
        if (existingPos) {
          // Preserve position from simulation
          return {
            ...item,
            x: existingPos.x,
            y: existingPos.y
          };
        }
        // Otherwise use position from item data or generate random
        if (item.x !== undefined && item.y !== undefined) {
          return item;
        }
        return {
          ...item,
          x: Math.random() * (VIEWBOX_SIZE - item.radius * 2) + item.radius,
          y: Math.random() * (VIEWBOX_SIZE - item.radius * 2) + item.radius
        };
      });

      // Create new simulation
      simulation = createSimulation(dataWithPositions, ALBUM_COLLISION_PADDING);
      simulationRef.current = simulation;

      // Use D3's enter/update/exit pattern for all nodes
      const nodes = container.selectAll('.node')
        .data(dataWithPositions, d => d.id);

      // Remove exiting nodes
      nodes.exit().remove();

      // Enter new nodes
      const nodesEnter = nodes.enter()
        .append('g')
        .attr('class', d => d.isGenre ? 'node genre-node' : 'node album-node')
        .attr('data-id', d => d.id)
        .style('cursor', 'grab')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Merge enter and update
      const nodesMerged = nodesEnter.merge(nodes);

      // Create gradients for genres (needed before rendering)
      const genreNodes = nodesMerged.filter(d => d.isGenre);
      createGenreGradients(defs, genreNodes);

      // Create image patterns for albums (needed before rendering)
      const albumNodes = nodesMerged.filter(d => !d.isGenre);
      createImagePatterns(defs, albumNodes);

      // Render genre circles first (so they appear below albums)
      const genreNodesEnter = nodesEnter.filter(d => d.isGenre);
      renderGenreCircles(genreNodesEnter);
      renderGenreText(genreNodesEnter);

      // Add rectangles to album nodes (after genre circles, so albums appear on top)
      nodesEnter.filter(d => !d.isGenre)
        .append('rect')
        .attr('width', d => d.radius * 2)
        .attr('height', d => d.radius * 2)
        .attr('x', d => -d.radius)
        .attr('y', d => -d.radius)
        .attr('fill', '#333')
        .attr('fill-opacity', 0.85)
        .attr('stroke', 'rgba(0, 0, 0, 0.1)')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))');

      // Update fill for album nodes
      nodesMerged.filter(d => !d.isGenre)
        .select('rect')
        .attr('fill', (d) => {
          if (d.img && d.patternId) {
            return `url(#${d.patternId})`;
          }
          return '#333';
        });

      // Setup drag handlers for all nodes (D3 drag for canvas movement)
      const { dragstarted, dragged, dragended } = createDragHandlers(simulation, ALBUM_COLLISION_PADDING);
      const nodeDrag = d3.drag()
        .on('start', function(event, d) {
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
          }
          dragstarted(event, d);
          // Mark as being dragged for library drop
          if (d.isGenre && onGenreDragStart) {
            onGenreDragStart(d);
          } else if (!d.isGenre && onAlbumDragStart) {
            onAlbumDragStart(d);
          }
        })
        .on('drag', function(event, d) {
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
          }
          dragged(event, d);
        })
        .on('end', function(event, d) {
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
          }
          dragended(event, d);
          d3.select(this).style('cursor', 'grab');
        });

      nodesMerged.call(nodeDrag);

      // Make nodes draggable to library (HTML5 drag for library drop)
      nodesMerged
        .attr('draggable', 'true')
        .on('dragstart', function(event, d) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('application/json', JSON.stringify(d));
        });

      // Setup click handlers for albums only
      setupAlbumClickHandlers(albumNodes);

      // Simulation tick with boundary constraints
      simulation.on('tick', () => {
        enforceBoundaries(dataWithPositions, VIEWBOX_SIZE, ALBUM_COLLISION_PADDING);
        nodesMerged.attr('transform', d => `translate(${d.x},${d.y})`);
      });
    } else {
      // Stop simulation if no albums
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    }

    // Setup zoom and pan - preserve existing transform
    let currentTransform = zoomTransformRef.current || d3.zoomIdentity;
    const getCurrentTransform = () => currentTransform;
    const setCurrentTransform = (transform) => { 
      currentTransform = transform;
      zoomTransformRef.current = transform;
    };

    // Detect if device is touch-enabled
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Create scrollbars
    const scrollbarElements = createScrollbars(isTouchDevice);
    const updateScrollbars = createUpdateScrollbars(getCurrentTransform, isTouchDevice);
    
    const wrappedUpdateScrollbars = () => {
      updateScrollbars(scrollbarElements.horizontalThumb, scrollbarElements.verticalThumb);
    };

    // Create zoom behavior
    const zoom = createZoomBehavior(container, wrappedUpdateScrollbars, getCurrentTransform, setCurrentTransform);

    // Restore previous zoom transform or set to identity
    const savedTransform = zoomTransformRef.current || d3.zoomIdentity;
    // Apply transform without triggering events
    container.attr('transform', `translate(${savedTransform.x}, ${savedTransform.y}) scale(${savedTransform.k})`);
    // Set the zoom state without dispatching events
    svg.call(zoom.transform, savedTransform)
      .on('dblclick.zoom', null);
    
    // Update the current transform reference
    currentTransform = savedTransform;

    setupPanHandlers(svg, container, zoom, getCurrentTransform, setCurrentTransform, wrappedUpdateScrollbars);
    setupCursorManagement(svg);

    // Setup scrollbar drag handlers
    const cleanupScrollbars = setupScrollbarDragHandlers(
      scrollbarElements.horizontalThumb,
      scrollbarElements.verticalThumb,
      scrollbarElements.horizontalTrack,
      scrollbarElements.verticalTrack,
      getCurrentTransform,
      setCurrentTransform,
      container,
      svg,
      zoom,
      wrappedUpdateScrollbars
    );

    // Initial scrollbar update
    wrappedUpdateScrollbars();

    // Handle window resize
    const handleResize = () => {
      const newMaxDimension = Math.max(window.innerWidth, window.innerHeight);
      const newSvgSize = newMaxDimension * SVG_SIZE_MULTIPLIER;
      const newWindowCenterX = window.innerWidth / 2;
      const newWindowCenterY = window.innerHeight / 2;
      const newSvgLeft = newWindowCenterX - newSvgSize / 2;
      const newSvgTop = newWindowCenterY - newSvgSize / 2;
      
      d3.select(svgRef.current)
        .attr('width', newSvgSize)
        .attr('height', newSvgSize)
        .style('left', `${newSvgLeft}px`)
        .style('top', `${newSvgTop}px`);
      
      wrappedUpdateScrollbars();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      window.removeEventListener('resize', handleResize);
      if (cleanupScrollbars) {
        cleanupScrollbars();
      }
      d3.selectAll('.bubble-chart-scrollbars').remove();
    };
  }, [albums, genres, onAlbumDrop, onAlbumDragStart, onGenreDrop, onGenreDragStart]);

  return <svg ref={svgRef} />;
};

export default EmptyCanvas;
