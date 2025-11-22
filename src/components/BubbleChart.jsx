import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import initialAlbumsData from '../data/initialAlbums.json';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);

    // Extract unique genres from initialAlbums.json
    // Since initialAlbums.json doesn't have genre field, we'll use a curated list
    // that represents genres commonly associated with those classic albums
    const genres = [
        'Rock', 'Funk', 'Hip Hop', 'Electronic', 'Jazz', 'Blues', 
        'Soul', 'Punk', 'Alternative', 'Indie', 'Pop', 'R&B'
    ];

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Calculate SVG size: 150% of the largest window dimension
        const maxWindowDimension = Math.max(window.innerWidth, window.innerHeight);
        const svgSize = maxWindowDimension * 1.5;

        // ViewBox is a square 1920x1920
        const viewBoxSize = 1920;

        // Calculate position to center SVG on window
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        const svgLeft = windowCenterX - svgSize / 2;
        const svgTop = windowCenterY - svgSize / 2;

        const svg = d3.select(svgRef.current)
            .attr('width', svgSize)
            .attr('height', svgSize)
            .attr('viewBox', `0 0 ${viewBoxSize} ${viewBoxSize}`)
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

        // Add background rectangle inside container (so it moves with pan)
        container.append('rect')
            .attr('width', viewBoxSize)
            .attr('height', viewBoxSize)
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', '#000000')
            .style('pointer-events', 'none'); // Don't interfere with panning

        // Set random initial positions for each node
        data.forEach(d => {
            if (d.x === undefined || d.y === undefined) {
                // Random position within viewBox (1920x1920 square), accounting for square diagonal
                // Use diagonal distance to ensure entire square stays within bounds
                const diagonal = d.radius * Math.sqrt(2);
                const padding = diagonal;
                d.x = Math.random() * (viewBoxSize - padding * 2) + padding;
                d.y = Math.random() * (viewBoxSize - padding * 2) + padding;
            }
        });

        // Create simulation with only collision detection
        const simulation = d3.forceSimulation(data)
            .force('collide', d3.forceCollide().radius(d => d.radius * Math.sqrt(2) + 2).strength(0.5))
            .alphaDecay(0.02) // Slower decay for smoother, less bouncy movement
            .velocityDecay(0.4); // Higher velocity decay to reduce bounciness

        // Create node groups inside the container
        const nodes = container.selectAll('.node')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'node')
            .style('cursor', 'grab')
            .call(d3.drag()
                .on('start', function(event, d) {
                    // Stop zoom behavior when dragging nodes
                    if (event.sourceEvent) {
                        event.sourceEvent.stopPropagation();
                    }
                    dragstarted(event, d);
                })
                .on('drag', function(event, d) {
                    // Stop zoom behavior when dragging nodes
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
                }))
            .on('mouseenter', function() {
                d3.select(this).style('cursor', 'grab');
            })
            .on('mousedown', function() {
                d3.select(this).style('cursor', 'grabbing');
            })
            .on('mouseup', function() {
                d3.select(this).style('cursor', 'grab');
            });

        // Define defs for images (outside container so patterns work correctly)
        const defs = svg.append('defs');

        // Add images patterns
        nodes.each(function (d, i) {
            defs.append('pattern')
                .attr('id', `image-${i}`)
                .attr('height', '100%')
                .attr('width', '100%')
                .attr('patternContentUnits', 'objectBoundingBox')
                .append('image')
                .attr('height', 1)
                .attr('width', 1)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('href', d.img);
        });

        // Add squares (rectangles)
        nodes.append('rect')
            .attr('width', d => d.radius * 2)
            .attr('height', d => d.radius * 2)
            .attr('x', d => -d.radius)
            .attr('y', d => -d.radius)
            .attr('fill', (d, i) => d.img ? `url(#image-${i})` : '#333')
            .attr('fill-opacity', 0.85) // Slight transparency for glass effect
            .attr('stroke', 'rgba(0, 0, 0, 0.1)') // Subtle dark border for white background
            .attr('stroke-width', 1)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'); // Soft shadow for depth

        // Add genre text labels - static text spread across the SVG
        // Position genres randomly across the SVG, similar to how album covers are spread
        const genrePositions = genres.map(() => {
            const padding = 150; // Padding to keep text away from edges
            return {
                x: Math.random() * (viewBoxSize - padding * 2) + padding,
                y: Math.random() * (viewBoxSize - padding * 2) + padding
            };
        });

        const genreTexts = container.selectAll('.genre-text')
            .data(genres)
            .enter()
            .append('text')
            .attr('class', 'genre-text')
            .text(d => d)
            .attr('x', (d, i) => genrePositions[i].x)
            .attr('y', (d, i) => genrePositions[i].y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif')
            .style('font-size', '36px')
            .style('font-weight', '700') // Bold
            .style('fill', '#ffffff')
            .style('opacity', '0.85')
            .style('pointer-events', 'none') // Don't interfere with interactions
            .style('text-shadow', '0 2px 10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(166, 0, 255, 0.3)') // Modern shadow with accent color glow
            .style('letter-spacing', '2px') // Modern spacing
            .style('user-select', 'none') // Prevent text selection
            .style('text-transform', 'uppercase'); // Modern uppercase style



        // Simulation tick with boundary constraints
        simulation.on('tick', () => {
            // Enforce boundaries to keep squares within viewBox (1920x1920 square)
            data.forEach(d => {
                const diagonal = d.radius * Math.sqrt(2);
                const minX = diagonal;
                const maxX = viewBoxSize - diagonal;
                const minY = diagonal;
                const maxY = viewBoxSize - diagonal;
                
                // Constrain x position
                if (d.x < minX) {
                    d.x = minX;
                    d.vx = 0; // Stop velocity
                } else if (d.x > maxX) {
                    d.x = maxX;
                    d.vx = 0; // Stop velocity
                }
                
                // Constrain y position
                if (d.y < minY) {
                    d.y = minY;
                    d.vy = 0; // Stop velocity
                } else if (d.y > maxY) {
                    d.y = maxY;
                    d.vy = 0; // Stop velocity
                }
            });
            
            nodes.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            // Only fix the dragged node's position, let others move freely for real-time collision
            d.fx = d.x;
            d.fy = d.y;
            // Keep simulation running for real-time collision detection
            simulation.alphaTarget(0.3).restart();
        }

        function dragged(event, d) {
            // Constrain dragging within viewBox (1920x1920 square)
            const diagonal = d.radius * Math.sqrt(2);
            const minX = diagonal;
            const maxX = viewBoxSize - diagonal;
            const minY = diagonal;
            const maxY = viewBoxSize - diagonal;
            
            // Update dragged node position - other nodes will collide in real-time
            d.fx = Math.max(minX, Math.min(maxX, event.x));
            d.fy = Math.max(minY, Math.min(maxY, event.y));
            // Keep simulation active for real-time collisions
            simulation.alphaTarget(0.3).restart();
        }

        function dragended(event, d) {
            // Release the dragged node's fixed position
            d.fx = null;
            d.fy = null;
            // Let simulation settle naturally
            simulation.alphaTarget(0);
        }

        // Calculate panning boundaries relative to viewport
        // Margin is the distance between SVG boundary and viewport boundary (same for left and top)
        const viewportMargin = 100; // pixels - consistent margin from viewport edges
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Translation is in SVG coordinate space (same as viewBox: 0 to 1920)
        // The SVG element is positioned at (svgLeft, svgTop) in viewport coordinates
        // The viewBox shows the container content, which we translate
        
        // Calculate how much the SVG extends beyond viewport when centered
        // SVG left edge is at svgLeft (negative if extends left of viewport)
        // SVG right edge is at svgLeft + svgSize
        const svgLeftEdge = svgLeft;
        const svgRightEdge = svgLeft + svgSize;
        const svgTopEdge = svgTop;
        const svgBottomEdge = svgTop + svgSize;
        
        // Calculate how much we can translate while maintaining margin
        // When translating right (positive X): container moves right, showing more left content
        // We can translate until the left edge of visible content is viewportMargin from viewport left
        // The viewBox maps viewBoxSize (1920) to svgSize pixels on screen
        const scaleFactor = svgSize / viewBoxSize; // pixels per viewBox unit
        
        // Maximum translation right/down: allow until content edge reaches viewportMargin from viewport edge
        // If SVG left edge is at position X, and we want viewportMargin margin:
        // We can translate by: (svgLeftEdge + viewportMargin) / scaleFactor
        const maxTranslateX = Math.max(0, (Math.max(0, -svgLeftEdge) + viewportMargin) / scaleFactor);
        const maxTranslateY = Math.max(0, (Math.max(0, -svgTopEdge) + viewportMargin) / scaleFactor);
        
        // Maximum translation left/up: allow until content edge reaches viewportMargin from viewport edge
        // If SVG right edge extends beyond viewport, we can translate left by that amount plus margin
        const svgExtendsRight = Math.max(0, svgRightEdge - viewportWidth);
        const svgExtendsBottom = Math.max(0, svgBottomEdge - viewportHeight);
        const minTranslateX = -Math.max(0, (svgExtendsRight + viewportMargin) / scaleFactor);
        const minTranslateY = -Math.max(0, (svgExtendsBottom + viewportMargin) / scaleFactor);

        // Set up zoom behavior for panning only (no zoom)
        let isUpdatingTransform = false; // Flag to prevent recursive updates
        const zoom = d3.zoom()
            .scaleExtent([1, 1]) // Lock scale at 1 (no zooming)
            .on('zoom', (event) => {
                if (isUpdatingTransform) return; // Prevent recursive calls
                
                // Clamp translation values to boundaries to prevent panning too far
                const clampedX = Math.max(minTranslateX, Math.min(maxTranslateX, event.transform.x));
                const clampedY = Math.max(minTranslateY, Math.min(maxTranslateY, event.transform.y));
                
                // Only apply translation, ignore scale
                container.attr('transform', `translate(${clampedX},${clampedY})`);
                
                // If we clamped, update the zoom transform to prevent sticky behavior
                if (clampedX !== event.transform.x || clampedY !== event.transform.y) {
                    isUpdatingTransform = true;
                    // Use setTimeout to update transform after current event completes
                    setTimeout(() => {
                        svg.call(zoom.transform, d3.zoomIdentity.translate(clampedX, clampedY));
                        isUpdatingTransform = false;
                    }, 0);
                }
            })
            .filter((event) => {
                // Disable mouse wheel zooming
                if (event.type === 'wheel') return false;
                // Allow touch events for mobile panning
                if (event.type === 'touchstart' || event.type === 'touchmove') return true;
                
                // For mouse events, check if clicking on a node
                const target = event.target;
                if (!target) return true;
                
                // Check if target or its parent is a node
                let element = target;
                while (element && element !== svg.node()) {
                    if (element.classList && element.classList.contains('node')) {
                        return false; // Don't allow pan when clicking on node
                    }
                    element = element.parentNode;
                }
                
                return true; // Allow pan when clicking on empty space
            });

        // Apply zoom behavior to SVG
        // Initialize container transform to (0, 0) explicitly
        container.attr('transform', 'translate(0, 0)');
        svg.call(zoom)
            .on('dblclick.zoom', null); // Disable double-click zoom

        // Update cursor on hover - show grab cursor on empty space
        svg.on('mousemove', function(event) {
            const target = event.target;
            if (!target) return;
            
            // Check if hovering over a node
            let element = target;
            let isNode = false;
            while (element && element !== svg.node()) {
                if (element.classList && element.classList.contains('node')) {
                    isNode = true;
                    break;
                }
                element = element.parentNode;
            }
            
            // Update cursor based on what we're hovering over
            if (!isNode) {
                svg.style('cursor', event.buttons === 1 ? 'grabbing' : 'grab');
            }
        });

        // Handle window resize to recalculate SVG size and position
        const handleResize = () => {
            const newMaxDimension = Math.max(window.innerWidth, window.innerHeight);
            const newSvgSize = newMaxDimension * 1.5;
            const newWindowCenterX = window.innerWidth / 2;
            const newWindowCenterY = window.innerHeight / 2;
            const newSvgLeft = newWindowCenterX - newSvgSize / 2;
            const newSvgTop = newWindowCenterY - newSvgSize / 2;
            
            d3.select(svgRef.current)
                .attr('width', newSvgSize)
                .attr('height', newSvgSize)
                .style('left', `${newSvgLeft}px`)
                .style('top', `${newSvgTop}px`);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            simulation.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, [data]);

    return <svg ref={svgRef} />;
};

export default BubbleChart;
