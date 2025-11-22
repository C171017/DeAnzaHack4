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

    // Color mapping for each genre
    const genreColors = {
        'Rock': '#FF6B6B',
        'Funk': '#4ECDC4',
        'Hip Hop': '#FFE66D',
        'Electronic': '#A8E6CF',
        'Jazz': '#FF8B94',
        'Blues': '#95E1D3',
        'Soul': '#F38181',
        'Punk': '#AA96DA',
        'Alternative': '#FCBAD3',
        'Indie': '#FFD93D',
        'Pop': '#6BCB77',
        'R&B': '#FFD700'
    };

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
            .attr('fill', '#ffffff')
            .style('pointer-events', 'none'); // Don't interfere with panning

        // Create genre data objects with radius for collision detection
        // Collision based on actual text size (36px font) with small padding
        const genreTextFontSize = 36;
        const genreCollisionPadding = 8; // Small border around text
        const genreCollisionRadius = (genreTextFontSize / 2) + genreCollisionPadding; // ~26px
        const genreCircleRadius = 80; // Visual circle size (for rendering, not collision)
        const genreData = genres.map(genre => ({
            id: `genre-${genre}`,
            name: genre,
            radius: genreCollisionRadius, // Collision radius based on text size only
            circleRadius: genreCircleRadius, // Visual circle size
            isGenre: true, // Flag to identify genre nodes
            x: undefined,
            y: undefined
        }));

        // Combine genre data and album data for simulation
        // Genres first so their circles render first, then albums render on top
        const allData = [...genreData, ...data];

        // Collision padding for albums (small border around covers)
        const albumCollisionPadding = 6;

        // Set random initial positions for each node
        allData.forEach(d => {
            if (d.x === undefined || d.y === undefined) {
                // Random position within viewBox (1920x1920 square)
                // Use collision radius for boundary (small for both genres and albums)
                const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
                const padding = boundaryRadius;
                d.x = Math.random() * (viewBoxSize - padding * 2) + padding;
                d.y = Math.random() * (viewBoxSize - padding * 2) + padding;
            }
        });

        // Create simulation with only collision detection
        // For genre nodes: use small collision radius based on text size only
        // For album nodes: use size with small padding (not diagonal)
        const simulation = d3.forceSimulation(allData)
            .force('collide', d3.forceCollide().radius(d => {
                if (d.isGenre) {
                    // Genre nodes: collision based on text size only (small, just slightly bigger than text)
                    return d.radius; // Already includes padding
                } else {
                    // Album nodes: collision based on actual size with small padding
                    // Album size is d.radius * 2 (width/height), so collision radius is d.radius + padding
                    return d.radius + albumCollisionPadding;
                }
            }).strength(0.5))
            .alphaDecay(0.02) // Slower decay for smoother, less bouncy movement
            .velocityDecay(0.4); // Higher velocity decay to reduce bounciness

        // Create node groups inside the container for all data (albums + genres)
        const nodes = container.selectAll('.node')
            .data(allData)
            .enter()
            .append('g')
            .attr('class', d => d.isGenre ? 'node genre-node' : 'node')
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

        // Add images patterns only for album nodes
        // Use a counter to ensure unique pattern IDs
        let patternIndex = 0;
        nodes.filter(d => !d.isGenre && d.img).each(function (d) {
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
            d.patternId = patternId; // Store pattern ID in data
            patternIndex++;
        });

        // Create radial gradients for genre circles (smooth natural fade from center color to white at edge)
        const genreNodes = nodes.filter(d => d.isGenre);
        genreNodes.each(function(d) {
            const genreColor = genreColors[d.name] || '#CCCCCC';
            const gradientId = `genre-gradient-${d.name.replace(/\s+/g, '-')}`;
            
            // Helper function to blend color with white
            const blendWithWhite = (color, ratio) => {
                // Parse hex color
                const hex = color.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                
                // Blend with white (255, 255, 255)
                // ratio 0 = full color, ratio 1 = full white
                const blendedR = Math.round(r + (255 - r) * ratio);
                const blendedG = Math.round(g + (255 - g) * ratio);
                const blendedB = Math.round(b + (255 - b) * ratio);
                
                return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
            };
            
            const gradient = defs.append('radialGradient')
                .attr('id', gradientId)
                .attr('cx', '50%')
                .attr('cy', '50%')
                .attr('r', '50%');
            
            // Center: full genre color (heavy at center)
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', genreColor);
            
            // Smooth transition - blend color with white using color interpolation
            gradient.append('stop')
                .attr('offset', '40%')
                .attr('stop-color', blendWithWhite(genreColor, 0.3));
            
            // More blended - lighter color
            gradient.append('stop')
                .attr('offset', '65%')
                .attr('stop-color', blendWithWhite(genreColor, 0.6));
            
            // Near edge - mostly white with slight tint
            gradient.append('stop')
                .attr('offset', '85%')
                .attr('stop-color', blendWithWhite(genreColor, 0.85));
            
            // Edge: pure white (complete fade)
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', '#FFFFFF');
            
            d.gradientId = gradientId; // Store gradient ID in data
        });

        // Add color circles for genre nodes first (so they render above background but below albums and text)
        // Use multiply blend mode so overlapping colors mix naturally like paint
        genreNodes.append('circle')
            .attr('class', 'genre-circle')
            .attr('r', d => d.circleRadius * 3.5) // Visual circle size (large, for color blending)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', d => d.gradientId ? `url(#${d.gradientId})` : '#CCCCCC') // Use gradient or default gray
            .style('pointer-events', 'none') // Don't interfere with dragging
            .style('mix-blend-mode', 'multiply'); // Natural color mixing when circles overlap

        // Get album nodes for later rendering
        const albumNodes = nodes.filter(d => !d.isGenre);
        
        // Add squares (rectangles) for album nodes AFTER circles
        // This ensures albums render on top of color circles
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
            .attr('fill-opacity', 0.85) // Slight transparency for glass effect
            .attr('stroke', 'rgba(0, 0, 0, 0.1)') // Subtle dark border for white background
            .attr('stroke-width', 1)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'); // Soft shadow for depth

        // Add genre text labels on top of circles (after albums, so text renders above both)
        genreNodes.append('text')
            .attr('class', 'genre-text')
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('dy', '0.35em') // Better vertical centering
            .style('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif')
            .style('font-size', '36px')
            .style('font-weight', '700') // Bold
            .style('fill', '#000000') // Black text for white background
            .style('opacity', '0.85')
            .style('pointer-events', 'all') // Enable dragging
            .style('text-shadow', '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(166, 0, 255, 0.2)') // Modern shadow with accent color glow
            .style('letter-spacing', '2px') // Modern spacing
            .style('user-select', 'none') // Prevent text selection
            .style('text-transform', 'uppercase') // Modern uppercase style
            .style('cursor', 'grab'); // Show grab cursor



        // Simulation tick with boundary constraints
        simulation.on('tick', () => {
            // Enforce boundaries to keep all nodes within viewBox (1920x1920 square)
            allData.forEach(d => {
                // Use collision radius for boundaries (small for both genres and albums)
                const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
                const minX = boundaryRadius;
                const maxX = viewBoxSize - boundaryRadius;
                const minY = boundaryRadius;
                const maxY = viewBoxSize - boundaryRadius;
                
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
            
            // Update positions for all nodes (albums and genres)
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
            // Use collision radius for boundaries (small for both genres and albums)
            const boundaryRadius = d.isGenre ? d.radius : (d.radius + albumCollisionPadding);
            const minX = boundaryRadius;
            const maxX = viewBoxSize - boundaryRadius;
            const minY = boundaryRadius;
            const maxY = viewBoxSize - boundaryRadius;
            
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

        // Zoom limits - adjust these values to change zoom range
        const MIN_ZOOM = 0.5; // Minimum zoom out level (e.g., 0.5 = 0.5x zoom)
        const MAX_ZOOM = 3; // Maximum zoom in level (e.g., 3 = 3x zoom)
        
        const zoom = d3.zoom()
            .scaleExtent([MIN_ZOOM, MAX_ZOOM])
            .on('zoom', (event) => {
                const currentScale = event.transform.k;
                const translateX = event.transform.x;
                const translateY = event.transform.y;
                
                // Apply transform
                container.attr('transform', `translate(${translateX},${translateY}) scale(${currentScale})`);
            })
            .filter((event) => {
                // Handle wheel events (mouse wheel and touchpad)
                if (event.type === 'wheel') {
                    // Check if clicking on a node or genre text - if so, don't zoom
                    const target = event.target;
                    if (target) {
                        let element = target;
                        while (element && element !== svg.node()) {
                            if (element.classList && (element.classList.contains('node') || element.classList.contains('genre-text'))) {
                                return false; // Don't allow zoom when hovering over node
                            }
                            element = element.parentNode;
                        }
                    }
                    
                    // For touchpad: only allow pinch-to-zoom (ctrlKey pressed) or actual zoom gestures
                    // Block two-finger scrolling (wheel events without ctrlKey that are scroll gestures)
                    // Pinch-to-zoom on touchpad typically has ctrlKey pressed or has very small deltaY
                    // Two-finger scrolling has larger deltaY without ctrlKey
                    if (event.ctrlKey || event.metaKey) {
                        // Ctrl/Cmd + wheel = pinch-to-zoom, allow it
                        return true;
                    }
                    
                    // Check if this is a scroll gesture (large deltaY) vs zoom gesture (small deltaY)
                    // Touchpad two-finger scroll has larger delta values
                    // Pinch-to-zoom gestures typically have smaller, more controlled delta values
                    const isScrollGesture = Math.abs(event.deltaY) > 10 && !event.ctrlKey && !event.metaKey;
                    
                    if (isScrollGesture) {
                        // This is likely two-finger scrolling on touchpad, block it
                        return false;
                    }
                    
                    // Allow other wheel events (actual zoom gestures)
                    return true;
                }
                
                // Allow touch events for mobile panning and pinch-to-zoom
                // D3 automatically handles pinch-to-zoom detection for touch events
                if (event.type === 'touchstart' || event.type === 'touchmove') {
                    // Only allow if it's a pinch gesture (2 touches) or single touch pan
                    // D3's zoom behavior will handle this automatically
                    return true;
                }
                
                // For mouse events, check if clicking on a node or genre text
                const target = event.target;
                if (!target) return true;
                
                // Check if target or its parent is a node or genre text
                let element = target;
                while (element && element !== svg.node()) {
                    if (element.classList && (element.classList.contains('node') || element.classList.contains('genre-text'))) {
                        return false; // Don't allow pan when clicking on node
                    }
                    element = element.parentNode;
                }
                
                return true; // Allow pan when clicking on empty space
            });

        // Apply zoom behavior to SVG
        // Initialize container transform to (0, 0) with scale 1
        container.attr('transform', 'translate(0, 0) scale(1)');
        svg.call(zoom)
            .on('dblclick.zoom', null); // Disable double-click zoom

        // Update cursor on hover - show grab cursor on empty space
        svg.on('mousemove', function(event) {
            const target = event.target;
            if (!target) return;
            
            // Check if hovering over a node or genre text
            let element = target;
            let isInteractive = false;
            while (element && element !== svg.node()) {
                if (element.classList && (element.classList.contains('node') || element.classList.contains('genre-text'))) {
                    isInteractive = true;
                    break;
                }
                element = element.parentNode;
            }
            
            // Update cursor based on what we're hovering over
            if (!isInteractive) {
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
