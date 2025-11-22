import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  VIEWBOX_SIZE,
  SVG_SIZE_MULTIPLIER
} from '../BubbleChart/constants';
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
 * EmptyCanvas component - renders an empty SVG canvas without albums or genres
 * Used after login while albums are loading in the background
 */
const EmptyCanvas = () => {
  const svgRef = useRef(null);

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

    // Add background rectangle inside container
    container.append('rect')
      .attr('width', VIEWBOX_SIZE)
      .attr('height', VIEWBOX_SIZE)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#ffffff')
      .style('pointer-events', 'none');

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
      window.removeEventListener('resize', handleResize);
      if (cleanupScrollbars) {
        cleanupScrollbars();
      }
      d3.selectAll('.bubble-chart-scrollbars').remove();
    };
  }, []);

  return <svg ref={svgRef} />;
};

export default EmptyCanvas;
