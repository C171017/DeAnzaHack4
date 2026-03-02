import * as d3 from 'd3';
import { SCROLLBAR_CONFIG, ZOOM_CONFIG } from '../constants';
import { clampTransformToViewport, getTransformBounds } from './zoomPan';

/**
 * Create scrollbar container and elements
 */
export const createScrollbars = (isTouchDevice) => {
  const scrollbarContainer = d3.select('body').append('div')
    .attr('class', 'bubble-chart-scrollbars')
    .style('position', 'fixed')
    .style('top', '0')
    .style('left', '0')
    .style('width', '100%')
    .style('height', '100%')
    .style('pointer-events', 'none')
    .style('z-index', '999')
    .style('display', isTouchDevice ? 'none' : 'block');
  
  // Horizontal scrollbar
  const horizontalScrollbar = scrollbarContainer.append('div')
    .attr('class', 'horizontal-scrollbar')
    .style('position', 'absolute')
    .style('bottom', '0')
    .style('left', '0')
    .style('width', '100%')
    .style('height', `${SCROLLBAR_CONFIG.WIDTH}px`)
    .style('pointer-events', 'all')
    .style('background', 'transparent');
  
  const horizontalTrack = horizontalScrollbar.append('div')
    .attr('class', 'scrollbar-track')
    .style('position', 'absolute')
    .style('left', '0')
    .style('bottom', '2px')
    .style('width', 'calc(100% - 20px)')
    .style('height', `${SCROLLBAR_CONFIG.TRACK_WIDTH}px`)
    .style('background', 'rgba(0, 0, 0, 0.1)')
    .style('border-radius', '6px')
    .style('margin', '0 10px');
  
  const horizontalThumb = horizontalTrack.append('div')
    .attr('class', 'scrollbar-thumb')
    .style('position', 'absolute')
    .style('left', '0')
    .style('top', '0')
    .style('width', '50%')
    .style('height', '100%')
    .style('background', 'rgba(0, 0, 0, 0.3)')
    .style('border-radius', '6px')
    .style('cursor', 'grab')
    .style('transition', 'background 0.2s');
  
  // Vertical scrollbar
  const verticalScrollbar = scrollbarContainer.append('div')
    .attr('class', 'vertical-scrollbar')
    .style('position', 'absolute')
    .style('top', '0')
    .style('right', '0')
    .style('width', `${SCROLLBAR_CONFIG.WIDTH}px`)
    .style('height', '100%')
    .style('pointer-events', 'all')
    .style('background', 'transparent');
  
  const verticalTrack = verticalScrollbar.append('div')
    .attr('class', 'scrollbar-track')
    .style('position', 'absolute')
    .style('top', '0')
    .style('right', '2px')
    .style('width', `${SCROLLBAR_CONFIG.TRACK_WIDTH}px`)
    .style('height', 'calc(100% - 20px)')
    .style('background', 'rgba(0, 0, 0, 0.1)')
    .style('border-radius', '6px')
    .style('margin', '10px 0');
  
  const verticalThumb = verticalTrack.append('div')
    .attr('class', 'scrollbar-thumb')
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')
    .style('width', '100%')
    .style('height', '50%')
    .style('background', 'rgba(0, 0, 0, 0.3)')
    .style('border-radius', '6px')
    .style('cursor', 'grab')
    .style('transition', 'background 0.2s');
  
  return {
    horizontalThumb,
    verticalThumb,
    horizontalTrack,
    verticalTrack,
    container: scrollbarContainer
  };
};

/**
 * Update scrollbar positions and sizes
 */
export const createUpdateScrollbars = (currentTransform, isTouchDevice, getViewportMetrics = null) => {
  return (horizontalThumb, verticalThumb) => {
    if (isTouchDevice) return;

    const transform = currentTransform();
    const viewportMetrics = getViewportMetrics
      ? getViewportMetrics()
      : {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          svgSize: Math.max(window.innerWidth, window.innerHeight) * 1.5
        };
    const bounds = getTransformBounds(transform, viewportMetrics);
    const panRangeX = bounds.maxX - bounds.minX;
    const panRangeY = bounds.maxY - bounds.minY;
    
    const trackWidth = viewportMetrics.viewportWidth - 20;
    const trackHeight = viewportMetrics.viewportHeight - 20;
    const scrollableWidth = bounds.visibleWidth + (panRangeX / transform.k);
    const scrollableHeight = bounds.visibleHeight + (panRangeY / transform.k);
    const thumbWidthRatio = scrollableWidth > 0 ? Math.min(1, bounds.visibleWidth / scrollableWidth) : 1;
    const thumbHeightRatio = scrollableHeight > 0 ? Math.min(1, bounds.visibleHeight / scrollableHeight) : 1;
    
    const thumbWidth = Math.max(thumbWidthRatio * trackWidth, SCROLLBAR_CONFIG.THUMB_MIN_HEIGHT);
    const thumbHeight = Math.max(thumbHeightRatio * trackHeight, SCROLLBAR_CONFIG.THUMB_MIN_HEIGHT);
    
    const thumbX = panRangeX > 0 ? ((transform.x - bounds.minX) / panRangeX) * (trackWidth - thumbWidth) : 0;
    const thumbY = panRangeY > 0 ? ((transform.y - bounds.minY) / panRangeY) * (trackHeight - thumbHeight) : 0;
    
    horizontalThumb
      .style('width', `${thumbWidth}px`)
      .style('left', `${thumbX}px`);
    
    verticalThumb
      .style('height', `${thumbHeight}px`)
      .style('top', `${thumbY}px`);
  };
};

/**
 * Detect if platform is Mac
 */
const isMac = () => {
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Check if the correct modifier key is pressed for zoom
 * Windows: Ctrl, Mac: Cmd (Meta)
 */
const isZoomModifierPressed = (event) => {
  if (isMac()) {
    return event.metaKey;
  } else {
    return event.ctrlKey;
  }
};

/**
 * Setup scrollbar drag handlers
 */
export const setupScrollbarDragHandlers = (
  horizontalThumb,
  verticalThumb,
  horizontalTrack,
  verticalTrack,
  getCurrentTransform,
  setCurrentTransform,
  container,
  svg,
  zoom,
  updateScrollbars,
  getViewportMetrics = null,
  zoomBounds = {
    minZoom: ZOOM_CONFIG.MIN_ZOOM,
    maxZoom: ZOOM_CONFIG.MAX_ZOOM
  }
) => {
  let isDraggingHorizontal = false;
  let isDraggingVertical = false;
  let dragStartX = 0;
  let dragStartY = 0;
  
  horizontalThumb
    .on('mousedown', function(event) {
      event.preventDefault();
      event.stopPropagation();
      isDraggingHorizontal = true;
      dragStartX = event.clientX;
      horizontalThumb.style('cursor', 'grabbing');
      horizontalThumb.style('background', 'rgba(0, 0, 0, 0.5)');
    });
  
  verticalThumb
    .on('mousedown', function(event) {
      event.preventDefault();
      event.stopPropagation();
      isDraggingVertical = true;
      dragStartY = event.clientY;
      verticalThumb.style('cursor', 'grabbing');
      verticalThumb.style('background', 'rgba(0, 0, 0, 0.5)');
    });
  
  const handleScrollbarMouseMove = function(event) {
    if (isDraggingHorizontal) {
      event.preventDefault();
      const deltaX = event.clientX - dragStartX;
      const currentTransform = getCurrentTransform();
      const viewportMetrics = getViewportMetrics
        ? getViewportMetrics()
        : {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            svgSize: Math.max(window.innerWidth, window.innerHeight) * 1.5
          };
      const bounds = getTransformBounds(currentTransform, viewportMetrics);
      const panRangeX = bounds.maxX - bounds.minX;
      const trackWidth = viewportMetrics.viewportWidth - 20;
      const scrollableWidth = bounds.visibleWidth + (panRangeX / currentTransform.k);
      const thumbWidthRatio = scrollableWidth > 0 ? Math.min(1, bounds.visibleWidth / scrollableWidth) : 1;
      const thumbWidth = Math.max(thumbWidthRatio * trackWidth, SCROLLBAR_CONFIG.THUMB_MIN_HEIGHT);
      const maxThumbX = trackWidth - thumbWidth;
      
      const trackRect = horizontalTrack.node().getBoundingClientRect();
      const initialThumbX = dragStartX - trackRect.left;
      
      if (maxThumbX > 0 && panRangeX > 0) {
        const newThumbX = Math.max(0, Math.min(maxThumbX, initialThumbX + deltaX));
        const panRatio = newThumbX / maxThumbX;
        const newX = bounds.minX + (panRatio * panRangeX);
        const newTransform = currentTransform.translate(newX - currentTransform.x, 0);
        setCurrentTransform(newTransform);
        container.attr('transform', `translate(${newTransform.x},${newTransform.y}) scale(${newTransform.k})`);
        svg.call(zoom.transform, newTransform);
        updateScrollbars();
      }
    }
    
    if (isDraggingVertical) {
      event.preventDefault();
      const deltaY = event.clientY - dragStartY;
      const currentTransform = getCurrentTransform();
      const viewportMetrics = getViewportMetrics
        ? getViewportMetrics()
        : {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            svgSize: Math.max(window.innerWidth, window.innerHeight) * 1.5
          };
      const bounds = getTransformBounds(currentTransform, viewportMetrics);
      const panRangeY = bounds.maxY - bounds.minY;
      const trackHeight = viewportMetrics.viewportHeight - 20;
      const scrollableHeight = bounds.visibleHeight + (panRangeY / currentTransform.k);
      const thumbHeightRatio = scrollableHeight > 0 ? Math.min(1, bounds.visibleHeight / scrollableHeight) : 1;
      const thumbHeight = Math.max(thumbHeightRatio * trackHeight, SCROLLBAR_CONFIG.THUMB_MIN_HEIGHT);
      const maxThumbY = trackHeight - thumbHeight;
      
      const trackRect = verticalTrack.node().getBoundingClientRect();
      const initialThumbY = dragStartY - trackRect.top;
      
      if (maxThumbY > 0 && panRangeY > 0) {
        const newThumbY = Math.max(0, Math.min(maxThumbY, initialThumbY + deltaY));
        const panRatio = newThumbY / maxThumbY;
        const newY = bounds.minY + (panRatio * panRangeY);
        const newTransform = currentTransform.translate(0, newY - currentTransform.y);
        setCurrentTransform(newTransform);
        container.attr('transform', `translate(${newTransform.x},${newTransform.y}) scale(${newTransform.k})`);
        svg.call(zoom.transform, newTransform);
        updateScrollbars();
      }
    }
  };
  
  const handleScrollbarMouseUp = function() {
    if (isDraggingHorizontal) {
      isDraggingHorizontal = false;
      horizontalThumb.style('cursor', 'grab');
      horizontalThumb.style('background', 'rgba(0, 0, 0, 0.3)');
    }
    if (isDraggingVertical) {
      isDraggingVertical = false;
      verticalThumb.style('cursor', 'grab');
      verticalThumb.style('background', 'rgba(0, 0, 0, 0.3)');
    }
  };
  
  /**
   * Handle wheel events on scrollbars for zoom
   */
  const handleScrollbarWheel = function(event) {
    if (!isZoomModifierPressed(event)) {
      return; // Not the zoom modifier, allow default behavior
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const currentTransform = getCurrentTransform();
    const deltaY = event.deltaY;
    const scaleFactor = deltaY > 0 ? 0.9 : 1.1; // Zoom out on scroll down, zoom in on scroll up
    
    // Calculate new scale
    const newScale = Math.max(
      zoomBounds.minZoom,
      Math.min(zoomBounds.maxZoom, currentTransform.k * scaleFactor)
    );
    
    // Zoom centered on viewport center
    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    // Get coordinates relative to SVG
    const x = viewportCenterX - svgRect.left;
    const y = viewportCenterY - svgRect.top;
    
    // Transform point to current coordinate system
    const transformedPoint = currentTransform.invert([x, y]);
    
    // Calculate new transform with zoom centered on viewport center
    const unclampedTransform = d3.zoomIdentity
      .translate(
        currentTransform.x + (transformedPoint[0] * (currentTransform.k - newScale)),
        currentTransform.y + (transformedPoint[1] * (currentTransform.k - newScale))
      )
      .scale(newScale);
    const newTransform = clampTransformToViewport(
      unclampedTransform,
      getViewportMetrics || (() => ({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        svgSize: Math.max(window.innerWidth, window.innerHeight) * 1.5
      }))
    );
    
    setCurrentTransform(newTransform);
    container.attr('transform', `translate(${newTransform.x},${newTransform.y}) scale(${newTransform.k})`);
    svg.call(zoom.transform, newTransform);
    updateScrollbars();
  };
  
  // Add wheel event handlers to scrollbar elements
  horizontalTrack.on('wheel', handleScrollbarWheel);
  verticalTrack.on('wheel', handleScrollbarWheel);
  horizontalThumb.on('wheel', handleScrollbarWheel);
  verticalThumb.on('wheel', handleScrollbarWheel);
  
  document.addEventListener('mousemove', handleScrollbarMouseMove);
  document.addEventListener('mouseup', handleScrollbarMouseUp);
  
  return () => {
    horizontalTrack.on('wheel', null);
    verticalTrack.on('wheel', null);
    horizontalThumb.on('wheel', null);
    verticalThumb.on('wheel', null);
    document.removeEventListener('mousemove', handleScrollbarMouseMove);
    document.removeEventListener('mouseup', handleScrollbarMouseUp);
  };
};
