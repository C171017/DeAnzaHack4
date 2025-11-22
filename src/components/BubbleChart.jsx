import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background-color', '#ffffff')
            .style('overflow', 'hidden');

        // Clear previous renders
        svg.selectAll('*').remove();

        // Set random initial positions for each node
        data.forEach(d => {
            if (d.x === undefined || d.y === undefined) {
                // Random position within viewport, accounting for square diagonal
                // Use diagonal distance to ensure entire square stays within bounds
                const diagonal = d.radius * Math.sqrt(2);
                const padding = diagonal;
                d.x = Math.random() * (width - padding * 2) + padding;
                d.y = Math.random() * (height - padding * 2) + padding;
            }
        });

        // Create simulation
        const simulation = d3.forceSimulation(data)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(d => d.radius * Math.sqrt(2) + 2).strength(0.7));

        // Create node groups
        const nodes = svg.selectAll('.node')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Define defs for images
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



        // Simulation tick with boundary constraints
        simulation.on('tick', () => {
            // Enforce boundaries to keep squares within viewport
            data.forEach(d => {
                const diagonal = d.radius * Math.sqrt(2);
                const minX = diagonal;
                const maxX = width - diagonal;
                const minY = diagonal;
                const maxY = height - diagonal;
                
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
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            // Constrain dragging within viewport
            const diagonal = d.radius * Math.sqrt(2);
            const minX = diagonal;
            const maxX = width - diagonal;
            const minY = diagonal;
            const maxY = height - diagonal;
            
            d.fx = Math.max(minX, Math.min(maxX, event.x));
            d.fy = Math.max(minY, Math.min(maxY, event.y));
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [data]);

    return <svg ref={svgRef} />;
};

export default BubbleChart;
