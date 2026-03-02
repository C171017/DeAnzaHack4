import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import initialAlbumsData from '../data/initialAlbums.json';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);
    const genrePinsRef = useRef({}); // Store genre pin positions
    const genreColorsRef = useRef({}); // Store genre color mapping

    // Extract unique genres from initialAlbums.json
    const extractUniqueGenres = (albumsData) => {
        const genreSet = new Set();
        albumsData.forEach(album => {
            if (album.genres && Array.isArray(album.genres)) {
                album.genres.forEach(genre => {
                    if (genre.name) {
                        genreSet.add(genre.name);
                    }
                });
            }
        });
        return Array.from(genreSet);
    };

    // Assign distinct colors to genres
    const assignGenreColors = (genres) => {
        const colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C',
            '#3498DB', '#2ECC71', '#9B59B6', '#E67E22', '#1ABC9C',
            '#F39C12', '#E91E63', '#00BCD4', '#FF9800', '#8BC34A'
        ];
        const colorMap = {};
        genres.forEach((genre, index) => {
            colorMap[genre] = colorPalette[index % colorPalette.length];
        });
        return colorMap;
    };

    // Match album with genres from initialAlbums.json
    const matchAlbumWithGenres = (albumId) => {
        return initialAlbumsData.find(album => album.id === albumId);
    };

    // Calculate album position based on weighted average of genre pin positions
    const calculateAlbumPosition = (album, genrePins) => {
        const matchedAlbum = matchAlbumWithGenres(album.id);
        if (!matchedAlbum || !matchedAlbum.genres || !Array.isArray(matchedAlbum.genres)) {
            return null; // No genre data available
        }

        let totalWeight = 0;
        let weightedX = 0;
        let weightedY = 0;

        matchedAlbum.genres.forEach(genre => {
            const genreName = genre.name;
            const weight = genre.weight || 0;
            const pin = genrePins[genreName];

            if (pin && weight > 0) {
                weightedX += pin.x * weight;
                weightedY += pin.y * weight;
                totalWeight += weight;
            }
        });

        if (totalWeight === 0) {
            return null; // No valid genre pins found
        }

        return {
            x: weightedX / totalWeight,
            y: weightedY / totalWeight
        };
    };

    const genres = extractUniqueGenres(initialAlbumsData);
    const genreColors = assignGenreColors(genres);
    genreColorsRef.current = genreColors;

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

        // Create a separate group for lines (will be drawn first, so appears underneath)
        const linesGroup = container.append('g').attr('class', 'lines-group');

        // Initialize genre pin positions in a circle pattern
        const centerX = viewBoxSize / 2;
        const centerY = viewBoxSize / 2;
        const radius = Math.min(viewBoxSize, viewBoxSize) * 0.35; // 35% of viewBox size
        const angleStep = (2 * Math.PI) / genres.length;

        genres.forEach((genre, index) => {
            if (!genrePinsRef.current[genre]) {
                const angle = index * angleStep;
                genrePinsRef.current[genre] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
        });

        // Set initial positions for albums based on genre weights
        data.forEach(d => {
            if (d.x === undefined || d.y === undefined) {
                const calculatedPos = calculateAlbumPosition(d, genrePinsRef.current);
                if (calculatedPos) {
                    d.x = calculatedPos.x;
                    d.y = calculatedPos.y;
                } else {
                    // Fallback to random position if no genre data
                    const diagonal = d.radius * Math.sqrt(2);
                    const padding = diagonal;
                    d.x = Math.random() * (viewBoxSize - padding * 2) + padding;
                    d.y = Math.random() * (viewBoxSize - padding * 2) + padding;
                }
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

        // Create draggable genre pins
        const genrePins = container.selectAll('.genre-pin')
            .data(genres)
            .enter()
            .append('g')
            .attr('class', 'genre-pin')
            .attr('transform', d => {
                const pin = genrePinsRef.current[d];
                return `translate(${pin.x},${pin.y})`;
            })
            .style('cursor', 'grab');

        // Add invisible background circle to make pins easier to grab
        genrePins.append('circle')
            .attr('r', 60) // Large enough to be easy to grab
            .attr('fill', 'transparent')
            .style('pointer-events', 'all')
            .style('cursor', 'grab');

        // Add text to genre pins
        genrePins.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('dy', '0.35em') // Better vertical centering
            .text(d => d)
            .style('font-family', 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif')
            .style('font-size', '36px')
            .style('font-weight', '700')
            .style('fill', d => genreColors[d])
            .style('opacity', '0.9')
            .style('pointer-events', 'none')
            .style('text-shadow', (d) => {
                const color = genreColors[d];
                const rgb = d3.rgb(color);
                return `0 2px 10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            })
            .style('letter-spacing', '2px')
            .style('user-select', 'none')
            .style('text-transform', 'uppercase');

        // Apply drag behavior to genre pins
        genrePins.call(d3.drag()
            .on('start', function(event, d) {
                if (event.sourceEvent) {
                    event.sourceEvent.stopPropagation();
                }
                d3.select(this).style('cursor', 'grabbing');
                d3.select(this).select('circle').style('cursor', 'grabbing');
            })
            .on('drag', function(event, d) {
                if (event.sourceEvent) {
                    event.sourceEvent.stopPropagation();
                }
                
                // Get current transform to calculate new position
                const currentPin = genrePinsRef.current[d];
                const dx = event.dx; // Change in x
                const dy = event.dy; // Change in y
                
                // Constrain within viewBox
                const padding = 50;
                const newX = Math.max(padding, Math.min(viewBoxSize - padding, currentPin.x + dx));
                const newY = Math.max(padding, Math.min(viewBoxSize - padding, currentPin.y + dy));
                
                // Update pin position
                genrePinsRef.current[d] = { x: newX, y: newY };
                d3.select(this).attr('transform', `translate(${newX},${newY})`);
                
                // Recalculate all album positions
                data.forEach(album => {
                    const calculatedPos = calculateAlbumPosition(album, genrePinsRef.current);
                    if (calculatedPos) {
                        album.x = calculatedPos.x;
                        album.y = calculatedPos.y;
                        album.vx = 0;
                        album.vy = 0;
                    }
                });
                
                // Redraw lines immediately
                drawGenreLines();
                
                // Restart simulation to update positions
                simulation.alpha(1).restart();
            })
            .on('end', function(event, d) {
                if (event.sourceEvent) {
                    event.sourceEvent.stopPropagation();
                }
                d3.select(this).style('cursor', 'grab');
                d3.select(this).select('circle').style('cursor', 'grab');
            }));



        // Draw colored lines connecting albums to genre pins
        const drawGenreLines = () => {
            // Remove existing lines
            linesGroup.selectAll('.genre-line').remove();

            data.forEach(album => {
                const matchedAlbum = matchAlbumWithGenres(album.id);
                if (!matchedAlbum || !matchedAlbum.genres || !Array.isArray(matchedAlbum.genres)) {
                    return; // Skip albums without genre data
                }

                matchedAlbum.genres.forEach(genre => {
                    const genreName = genre.name;
                    const weight = genre.weight || 0;
                    const pin = genrePinsRef.current[genreName];
                    const color = genreColorsRef.current[genreName];

                    if (pin && weight > 0 && album.x !== undefined && album.y !== undefined && color) {
                        const lineWidth = Math.max(0.5, weight * 0.3); // Line width proportional to weight
                        const opacity = Math.min(0.5, 0.2 + (weight / 10) * 0.3); // Opacity based on weight

                        linesGroup.append('line')
                            .attr('class', 'genre-line')
                            .attr('x1', album.x)
                            .attr('y1', album.y)
                            .attr('x2', pin.x)
                            .attr('y2', pin.y)
                            .attr('stroke', color)
                            .attr('stroke-width', lineWidth)
                            .attr('stroke-opacity', opacity)
                            .style('pointer-events', 'none');
                    }
                });
            });
        };

        // Simulation tick with boundary constraints and position recalculation
        simulation.on('tick', () => {
            // Recalculate album positions based on genre pins (for albums with genre data)
            data.forEach(d => {
                const calculatedPos = calculateAlbumPosition(d, genrePinsRef.current);
                if (calculatedPos) {
                    // Blend calculated position with current position for smoother movement
                    const blendFactor = 0.3; // How much to move toward calculated position
                    d.x = d.x + (calculatedPos.x - d.x) * blendFactor;
                    d.y = d.y + (calculatedPos.y - d.y) * blendFactor;
                }

                // Enforce boundaries to keep squares within viewBox (1920x1920 square)
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
            
            // Update genre pin positions (in case they were moved)
            container.selectAll('.genre-pin')
                .attr('transform', d => {
                    const pin = genrePinsRef.current[d];
                    return `translate(${pin.x},${pin.y})`;
                });
            
            // Redraw lines
            drawGenreLines();
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
                    // Check if clicking on a node or genre pin - if so, don't zoom
                    const target = event.target;
                    if (target) {
                        let element = target;
                        while (element && element !== svg.node()) {
                            if (element.classList && 
                                (element.classList.contains('node') || element.classList.contains('genre-pin'))) {
                                return false; // Don't allow zoom when hovering over node or genre pin
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
                
                // For mouse events, check if clicking on a node or genre pin
                const target = event.target;
                if (!target) return true;
                
                // Check if target or its parent is a node or genre pin
                let element = target;
                while (element && element !== svg.node()) {
                    if (element.classList && 
                        (element.classList.contains('node') || element.classList.contains('genre-pin'))) {
                        return false; // Don't allow pan when clicking on node or genre pin
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
            
            // Check if hovering over a node or genre pin
            let element = target;
            let isInteractive = false;
            while (element && element !== svg.node()) {
                if (element.classList && 
                    (element.classList.contains('node') || element.classList.contains('genre-pin'))) {
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

        // Draw initial lines
        drawGenreLines();

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
