import * as d3 from 'd3';
import { VIEWBOX_SIZE, ZOOM_CONFIG } from '../constants';

const PAN_OVERSCROLL = 48;

export const getTransformBounds = (transform, viewportMetrics) => {
  const { viewportWidth, viewportHeight, svgSize } = viewportMetrics;

  if (!viewportWidth || !viewportHeight || !svgSize) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      visibleWidth: VIEWBOX_SIZE,
      visibleHeight: VIEWBOX_SIZE
    };
  }

  const visibleWidth = (VIEWBOX_SIZE * (viewportWidth / svgSize)) / transform.k;
  const visibleHeight = (VIEWBOX_SIZE * (viewportHeight / svgSize)) / transform.k;
  const hiddenWidth = Math.max(0, (VIEWBOX_SIZE - visibleWidth) / 2);
  const hiddenHeight = Math.max(0, (VIEWBOX_SIZE - visibleHeight) / 2);
  const horizontalPadding = hiddenWidth > 0 ? PAN_OVERSCROLL : 0;
  const verticalPadding = hiddenHeight > 0 ? PAN_OVERSCROLL : 0;
  const maxX = (hiddenWidth + horizontalPadding) * transform.k;
  const maxY = (hiddenHeight + verticalPadding) * transform.k;

  return {
    minX: -maxX,
    maxX,
    minY: -maxY,
    maxY,
    visibleWidth,
    visibleHeight
  };
};

export const clampTransformToViewport = (transform, getViewportMetrics) => {
  const bounds = getTransformBounds(transform, getViewportMetrics());

  return d3.zoomIdentity
    .translate(
      Math.max(bounds.minX, Math.min(bounds.maxX, transform.x)),
      Math.max(bounds.minY, Math.min(bounds.maxY, transform.y))
    )
    .scale(transform.k);
};

/**
 * Create zoom behavior
 */
export const createZoomBehavior = (
  container,
  updateScrollbars,
  getCurrentTransform,
  setCurrentTransform,
  getViewportMetrics,
  zoomBounds = ZOOM_CONFIG
) => {
  const zoom = d3.zoom()
    .scaleExtent([zoomBounds.minZoom, zoomBounds.maxZoom])
    .constrain((transform) => clampTransformToViewport(transform, getViewportMetrics))
    .on('zoom', (event) => {
      setCurrentTransform(event.transform);
      const currentScale = event.transform.k;
      const translateX = event.transform.x;
      const translateY = event.transform.y;
      
      container.attr('transform', `translate(${translateX},${translateY}) scale(${currentScale})`);
      updateScrollbars();
    })
    .filter((event) => {
      if (event.type === 'wheel') {
        if (event.ctrlKey || event.metaKey) {
          return true;
        }
        return false;
      }
      
      if (event.type === 'touchstart' || event.type === 'touchmove' || event.type === 'touchend') {
        return true;
      }
      
      return false;
    });

  return zoom;
};

/**
 * Setup 2-finger panning on trackpad
 */
export const setupPanHandlers = (
  svg,
  container,
  zoom,
  getCurrentTransform,
  setCurrentTransform,
  updateScrollbars,
  getViewportMetrics
) => {
  svg.on('wheel', function(event) {
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    
    event.preventDefault();
    
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    const currentTransform = getCurrentTransform();

    const unclampedTransform = currentTransform.translate(-deltaX / currentTransform.k, -deltaY / currentTransform.k);
    const newTransform = clampTransformToViewport(unclampedTransform, getViewportMetrics);
    setCurrentTransform(newTransform);
    
    container.attr('transform', `translate(${newTransform.x},${newTransform.y}) scale(${newTransform.k})`);
    svg.call(zoom.transform, newTransform);
    updateScrollbars();
  });
};

/**
 * Setup cursor management
 */
export const setupCursorManagement = (svg) => {
  svg.on('mousemove', function(event) {
    const target = event.target;
    if (!target) return;
    
    let element = target;
    let isInteractive = false;
    while (element && element !== svg.node()) {
      if (element.classList && (element.classList.contains('node') || element.classList.contains('genre-text'))) {
        isInteractive = true;
        break;
      }
      element = element.parentNode;
    }
    
    if (!isInteractive) {
      svg.style('cursor', 'default');
    }
  });
};
