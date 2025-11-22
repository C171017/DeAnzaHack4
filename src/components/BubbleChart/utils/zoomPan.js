import * as d3 from 'd3';
import { ZOOM_CONFIG } from '../constants';

/**
 * Create zoom behavior
 */
export const createZoomBehavior = (container, updateScrollbars, getCurrentTransform, setCurrentTransform) => {
  const zoom = d3.zoom()
    .scaleExtent([ZOOM_CONFIG.MIN_ZOOM, ZOOM_CONFIG.MAX_ZOOM])
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
export const setupPanHandlers = (svg, container, zoom, getCurrentTransform, setCurrentTransform, updateScrollbars) => {
  svg.on('wheel', function(event) {
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    
    event.preventDefault();
    
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    const currentTransform = getCurrentTransform();
    
    const newTransform = currentTransform.translate(-deltaX / currentTransform.k, -deltaY / currentTransform.k);
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
