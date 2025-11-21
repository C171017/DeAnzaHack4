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
            .style('background-color', '#121212')
            .style('overflow', 'visible');

        // Clear previous renders
        svg.selectAll('*').remove();

        // Magnet variables
        let isAttracting = false;
        let cursorX = width / 2;
        let cursorY = height / 2;

        // Create simulation
        const simulation = d3.forceSimulation(data)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(d => d.radius + 2).strength(0.7));

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
                .attr('preserveAspectRatio', 'none')
                .attr('href', d.img);
        });

        // Add circles
        nodes.append('circle')
            .attr('r', d => d.radius)
            .attr('fill', (d, i) => d.img ? `url(#image-${i})` : '#333')
            .attr('fill-opacity', 0.85) // Slight transparency for glass effect
            .attr('stroke', 'rgba(255, 255, 255, 0.2)') // Subtle white border
            .attr('stroke-width', 1)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'); // Soft shadow for depth



        // Simulation tick
        simulation.on('tick', () => {
            nodes.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Magnet Interaction Handlers
        const handleStart = (x, y) => {
            isAttracting = true;
            cursorX = x;
            cursorY = y;

            // Add attraction forces
            simulation.force('x', d3.forceX(cursorX).strength(0.2));
            simulation.force('y', d3.forceY(cursorY).strength(0.2));
            simulation.force('center', null); // Disable center force to allow free movement to magnet
            simulation.alphaTarget(0.3).restart();
        };

        const handleMove = (x, y) => {
            if (isAttracting) {
                cursorX = x;
                cursorY = y;
                simulation.force('x', d3.forceX(cursorX).strength(0.2));
                simulation.force('y', d3.forceY(cursorY).strength(0.2));
                simulation.alphaTarget(0.3).restart();
            }
        };

        const handleEnd = () => {
            isAttracting = false;
            // Remove attraction forces
            simulation.force('x', null);
            simulation.force('y', null);
            // Restore center force
            simulation.force('center', d3.forceCenter(width / 2, height / 2));
            simulation.alphaTarget(0);
        };

        // Event Listeners
        const svgNode = svg.node();

        const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
        const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const onMouseUp = () => handleEnd();

        const onTouchStart = (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        };
        const onTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };
        const onTouchEnd = () => handleEnd();

        // Attach listeners to window for global release, but start on SVG
        svgNode.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        svgNode.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);

        // Cleanup
        return () => {
            simulation.stop();
            svgNode.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            svgNode.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [data]);

    return <svg ref={svgRef} />;
};

export default BubbleChart;
