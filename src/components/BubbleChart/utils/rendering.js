import * as d3 from 'd3';
import { GENRE_COLORS } from '../constants';
import { blendWithWhite } from './colorUtils';

/**
 * Create image patterns for album covers
 */
export const createImagePatterns = (defs, albumNodes) => {
  let patternIndex = 0;
  albumNodes.filter(d => !d.isGenre && d.img).each(function (d) {
    const patternId = `image-${patternIndex}`;
    defs.append('pattern')
      .attr('id', patternId)
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('patternContentUnits', 'objectBoundingBox')
      .append('image')
      .attr('height', 1)
      .attr('width', 1)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('href', d.img);
    d.patternId = patternId;
    patternIndex++;
  });
};

/**
 * Create radial gradients for genre circles
 */
export const createGenreGradients = (defs, genreNodes) => {
  genreNodes.each(function(d) {
    const genreColor = GENRE_COLORS[d.name] || '#CCCCCC';
    const gradientId = `genre-gradient-${d.name.replace(/\s+/g, '-')}`;
    
    const gradient = defs.append('radialGradient')
      .attr('id', gradientId)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    // Center: full genre color
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', genreColor);
    
    // Smooth transition
    gradient.append('stop')
      .attr('offset', '40%')
      .attr('stop-color', blendWithWhite(genreColor, 0.3));
    
    gradient.append('stop')
      .attr('offset', '65%')
      .attr('stop-color', blendWithWhite(genreColor, 0.6));
    
    gradient.append('stop')
      .attr('offset', '85%')
      .attr('stop-color', blendWithWhite(genreColor, 0.85));
    
    // Edge: pure white
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FFFFFF');
    
    d.gradientId = gradientId;
  });
};

/**
 * Render genre circles
 */
export const renderGenreCircles = (genreNodes) => {
  genreNodes.append('circle')
    .attr('class', 'genre-circle')
    .attr('r', d => d.circleRadius * 7)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', d => d.gradientId ? `url(#${d.gradientId})` : '#CCCCCC')
    .style('pointer-events', 'none')
    .style('mix-blend-mode', 'multiply');
};

/**
 * Render album rectangles
 */
export const renderAlbumRectangles = (albumNodes) => {
  albumNodes.append('rect')
    .attr('width', d => d.radius * 2)
    .attr('height', d => d.radius * 2)
    .attr('x', d => -d.radius)
    .attr('y', d => -d.radius)
    .attr('fill', (d) => {
      if (d.img && d.patternId) {
        return `url(#${d.patternId})`;
      }
      return '#333';
    })
    .attr('fill-opacity', 0.85)
    .attr('stroke', 'rgba(0, 0, 0, 0.1)')
    .attr('stroke-width', 1)
    .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))');
};

/**
 * Render genre text labels
 */
export const renderGenreText = (genreNodes) => {
  genreNodes.append('text')
    .attr('class', 'genre-text')
    .text(d => d.name)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('dy', '0.35em')
    .style('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif')
    .style('font-size', '36px')
    .style('font-weight', '700')
    .style('fill', '#000000')
    .style('opacity', '0.85')
    .style('pointer-events', 'all')
    .style('text-shadow', '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(166, 0, 255, 0.2)')
    .style('letter-spacing', '2px')
    .style('user-select', 'none')
    .style('text-transform', 'uppercase')
    .style('cursor', 'grab');
};
