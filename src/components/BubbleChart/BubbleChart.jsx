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

const BubbleChart = ({
  data,
  includeGenres = true,
  backgroundFill = '#ffffff',
  albumShape = 'square',
  showScrollbars = true,
  enableClusterDrag = false
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const containerElement = svgRef.current?.parentElement;
    const containerRect = containerElement?.getBoundingClientRect();
    let viewportWidth = containerRect?.width || window.innerWidth;
    let viewportHeight = containerRect?.height || window.innerHeight;

    // Calculate SVG size: 150% of the largest visible container dimension
    let maxWindowDimension = Math.max(viewportWidth, viewportHeight);
    let svgSize = maxWindowDimension * SVG_SIZE_MULTIPLIER;

    // Calculate position to center SVG on its container
    const windowCenterX = viewportWidth / 2;
    const windowCenterY = viewportHeight / 2;
    const svgLeft = windowCenterX - svgSize / 2;
    const svgTop = windowCenterY - svgSize / 2;

    const albumData = data.map((item) => ({ ...item }));

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
      .attr('fill', backgroundFill)
      .style('pointer-events', 'none');

    // Create genre data objects
    const genreCollisionRadius = (GENRE_TEXT_FONT_SIZE / 2) + GENRE_COLLISION_PADDING;
    const genreData = createGenreData(GENRES, genreCollisionRadius);

    // Combine genre data and album data for simulation (genres first so they render below albums)
    const allData = includeGenres ? [...genreData, ...albumData] : albumData;

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
    const { dragstarted, dragged, dragended } = createDragHandlers(
      simulation,
      ALBUM_COLLISION_PADDING,
      { enableClusterDrag }
    );
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
    renderAlbumRectangles(albumNodes, albumShape);
    if (includeGenres) {
      renderGenreText(genreNodes);
    }

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

    let cleanupScrollbars = null;
    let wrappedUpdateScrollbars = () => {};
    let scrollbarElements = null;

    const getViewportMetrics = () => ({
      viewportWidth,
      viewportHeight,
      svgSize
    });

    if (showScrollbars) {
      scrollbarElements = createScrollbars(isTouchDevice);
      const updateScrollbars = createUpdateScrollbars(getCurrentTransform, isTouchDevice, getViewportMetrics);
      wrappedUpdateScrollbars = () => {
        updateScrollbars(scrollbarElements.horizontalThumb, scrollbarElements.verticalThumb);
      };
    }

    // Create zoom behavior
    const zoom = createZoomBehavior(
      container,
      wrappedUpdateScrollbars,
      getCurrentTransform,
      setCurrentTransform,
      getViewportMetrics
    );

    container.attr('transform', 'translate(0, 0) scale(1)');
    svg.call(zoom)
      .on('dblclick.zoom', null);

    setupPanHandlers(
      svg,
      container,
      zoom,
      getCurrentTransform,
      setCurrentTransform,
      wrappedUpdateScrollbars,
      getViewportMetrics
    );
    setupCursorManagement(svg);

    if (showScrollbars && scrollbarElements) {
      cleanupScrollbars = setupScrollbarDragHandlers(
        scrollbarElements.horizontalThumb,
        scrollbarElements.verticalThumb,
        scrollbarElements.horizontalTrack,
        scrollbarElements.verticalTrack,
        getCurrentTransform,
        setCurrentTransform,
        container,
        svg,
        zoom,
        wrappedUpdateScrollbars,
        getViewportMetrics
      );
    }

    // Initial scrollbar update
    if (showScrollbars) {
      wrappedUpdateScrollbars();
    }

    // Handle window resize
    const handleResize = () => {
      const nextContainerRect = containerElement?.getBoundingClientRect();
      const nextViewportWidth = nextContainerRect?.width || window.innerWidth;
      const nextViewportHeight = nextContainerRect?.height || window.innerHeight;
      const newMaxDimension = Math.max(nextViewportWidth, nextViewportHeight);
      const newSvgSize = newMaxDimension * SVG_SIZE_MULTIPLIER;
      const newWindowCenterX = nextViewportWidth / 2;
      const newWindowCenterY = nextViewportHeight / 2;
      const newSvgLeft = newWindowCenterX - newSvgSize / 2;
      const newSvgTop = newWindowCenterY - newSvgSize / 2;
      
      viewportWidth = nextViewportWidth;
      viewportHeight = nextViewportHeight;
      maxWindowDimension = newMaxDimension;
      svgSize = newSvgSize;

      d3.select(svgRef.current)
        .attr('width', newSvgSize)
        .attr('height', newSvgSize)
        .style('left', `${newSvgLeft}px`)
        .style('top', `${newSvgTop}px`);
      
      if (showScrollbars) {
        wrappedUpdateScrollbars();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      if (cleanupScrollbars) {
        cleanupScrollbars();
      }
      if (showScrollbars) {
        d3.selectAll('.bubble-chart-scrollbars').remove();
      }
    };
  }, [albumShape, backgroundFill, data, enableClusterDrag, includeGenres, showScrollbars]);

  return <svg ref={svgRef} />;
};

export default BubbleChart;
