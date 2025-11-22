import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  GENRES,
  VIEWBOX_SIZE,
  SVG_SIZE_MULTIPLIER,
  GENRE_TEXT_FONT_SIZE,
  GENRE_COLLISION_PADDING,
  ALBUM_COLLISION_PADDING
} from './constants';
import {
  createGenreData,
  initializeNodePositions,
  createSimulation,
  enforceBoundaries
} from './utils/simulation';
import {
  createImagePatterns,
  createGenreGradients,
  renderGenreCircles,
  renderAlbumRectangles,
  renderGenreText
} from './utils/rendering';
import {
  createDragHandlers,
  setupAlbumClickHandlers
} from './utils/dragHandlers';
import {
  createZoomBehavior,
  setupPanHandlers,
  setupCursorManagement
} from './utils/zoomPan';
import {
  createScrollbars,
  createUpdateScrollbars,
  setupScrollbarDragHandlers
} from './utils/scrollbars';

const BubbleChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

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

    // Add background rectangle inside container
    container.append('rect')
      .attr('width', VIEWBOX_SIZE)
      .attr('height', VIEWBOX_SIZE)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#ffffff')
      .style('pointer-events', 'none');

    // Create genre data objects
    const genreCollisionRadius = (GENRE_TEXT_FONT_SIZE / 2) + GENRE_COLLISION_PADDING;
    const genreData = createGenreData(GENRES, genreCollisionRadius);

    // Combine genre data and album data for simulation (genres first so they render below albums)
    const allData = [...genreData, ...data];

    // Initialize random positions
    initializeNodePositions(allData, VIEWBOX_SIZE, ALBUM_COLLISION_PADDING);

    // Create simulation
    const simulation = createSimulation(allData, ALBUM_COLLISION_PADDING);

    // Create node groups
    const nodes = container.selectAll('.node')
      .data(allData)
      .enter()
      .append('g')
      .attr('class', d => d.isGenre ? 'node genre-node' : 'node')
      .style('cursor', 'grab');

    // Setup drag handlers
    const { dragstarted, dragged, dragended } = createDragHandlers(simulation, ALBUM_COLLISION_PADDING);
    const nodeDrag = d3.drag()
      .on('start', function(event, d) {
        if (event.sourceEvent) {
          event.sourceEvent.stopPropagation();
        }
        dragstarted(event, d);
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

    nodes.call(nodeDrag);

    // Setup click handlers for albums
    const albumNodes = nodes.filter(d => !d.isGenre);
    setupAlbumClickHandlers(albumNodes);

    // Define defs for images and gradients
    const defs = svg.append('defs');

    // Create gradients for genres (needed before rendering)
    const genreNodes = nodes.filter(d => d.isGenre);
    createGenreGradients(defs, genreNodes);

    // Create image patterns for albums (needed before rendering)
    createImagePatterns(defs, nodes);

    // Render elements in order: genre circles first (below), then albums (on top), then genre text (on top)
    renderGenreCircles(genreNodes);
    renderAlbumRectangles(albumNodes);
    renderGenreText(genreNodes);

    // Simulation tick with boundary constraints
    simulation.on('tick', () => {
      enforceBoundaries(allData, VIEWBOX_SIZE, ALBUM_COLLISION_PADDING);
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

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
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      if (cleanupScrollbars) {
        cleanupScrollbars();
      }
      d3.selectAll('.bubble-chart-scrollbars').remove();
    };
  }, [data]);

  return <svg ref={svgRef} />;
};

export default BubbleChart;
