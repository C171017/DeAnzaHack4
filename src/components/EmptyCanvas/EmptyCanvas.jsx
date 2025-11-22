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
  createImagePatterns
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
 * EmptyCanvas component - renders an empty SVG canvas that can accept dropped albums
 * Used after login while albums are loading in the background
 */
const EmptyCanvas = ({ albums = [], onAlbumDrop, onAlbumDragStart }) => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
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
          const albumData = JSON.parse(event.dataTransfer.getData('application/json'));
          if (onAlbumDrop && albumData) {
            // Get drop position relative to SVG
            const [x, y] = d3.pointer(event, svg.node());
            // Transform to viewBox coordinates
            const transform = d3.zoomTransform(svg.node());
            const viewBoxX = (x - transform.x) / transform.k;
            const viewBoxY = (y - transform.y) / transform.k;
            
            // Add position to album
            const albumWithPosition = {
              ...albumData,
              x: viewBoxX,
              y: viewBoxY
            };
            onAlbumDrop(albumWithPosition);
          }
        } catch (error) {
          console.error('Failed to parse drop data:', error);
        }
      });

    // Define defs for images (create once)
    const defs = svg.append('defs');

    // Render albums if any
    let simulation = null;
    if (albums && albums.length > 0) {
      // Initialize positions for albums that don't have them
      const albumsWithPositions = albums.map(album => {
        if (album.x === undefined || album.y === undefined) {
          return {
            ...album,
            x: Math.random() * (VIEWBOX_SIZE - album.radius * 2) + album.radius,
            y: Math.random() * (VIEWBOX_SIZE - album.radius * 2) + album.radius
          };
        }
        return album;
      });

      // Create or update simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      simulation = createSimulation(albumsWithPositions, ALBUM_COLLISION_PADDING);
      simulationRef.current = simulation;

      // Use D3's enter/update/exit pattern
      const nodes = container.selectAll('.album-node')
        .data(albumsWithPositions, d => d.id);

      // Remove exiting nodes
      nodes.exit().remove();

      // Enter new nodes
      const nodesEnter = nodes.enter()
        .append('g')
        .attr('class', 'album-node')
        .style('cursor', 'grab')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      // Add rectangles to new nodes
      nodesEnter.append('rect')
        .attr('width', d => d.radius * 2)
        .attr('height', d => d.radius * 2)
        .attr('x', d => -d.radius)
        .attr('y', d => -d.radius)
        .attr('fill', '#333')
        .attr('fill-opacity', 0.85)
        .attr('stroke', 'rgba(0, 0, 0, 0.1)')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))');

      // Merge enter and update
      const nodesMerged = nodesEnter.merge(nodes);

      // Update fill for all nodes (including new ones)
      nodesMerged.select('rect')
        .attr('fill', (d) => {
          if (d.img && d.patternId) {
            return `url(#${d.patternId})`;
          }
          return '#333';
        });

      // Create image patterns
      createImagePatterns(defs, nodesMerged);

      // Setup drag handlers for albums (D3 drag for canvas movement)
      const { dragstarted, dragged, dragended } = createDragHandlers(simulation, ALBUM_COLLISION_PADDING);
      const nodeDrag = d3.drag()
        .on('start', function(event, d) {
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
          }
          dragstarted(event, d);
          // Mark as being dragged for library drop
          if (onAlbumDragStart) {
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

      // Make albums draggable to library (HTML5 drag for library drop)
      nodesMerged
        .attr('draggable', 'true')
        .on('dragstart', function(event, d) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('application/json', JSON.stringify(d));
        });

      // Setup click handlers for albums
      setupAlbumClickHandlers(nodesMerged);

      // Simulation tick with boundary constraints
      simulation.on('tick', () => {
        enforceBoundaries(albumsWithPositions, VIEWBOX_SIZE, ALBUM_COLLISION_PADDING);
        nodesMerged.attr('transform', d => `translate(${d.x},${d.y})`);
      });
    } else {
      // Stop simulation if no albums
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    }

    // Setup zoom and pan
    let currentTransform = d3.zoomIdentity;
    const getCurrentTransform = () => currentTransform;
    const setCurrentTransform = (transform) => { currentTransform = transform; };

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

    container.attr('transform', 'translate(0, 0) scale(1)');
    svg.call(zoom)
      .on('dblclick.zoom', null);

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
  }, [albums, onAlbumDrop, onAlbumDragStart]);

  return <svg ref={svgRef} />;
};

export default EmptyCanvas;
