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
            .attr('stroke', '#ff5500')
            .attr('stroke-width', 2);

        // Add genre labels
        nodes.append('text')
            .text(d => d.group)
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('fill', 'white')
            .style('font-family', 'var(--font-family)')
            .style('font-size', d => Math.min(d.radius / 2, 12) + 'px') // Scale font size with bubble
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px black') // Shadow for readability
            .style('pointer-events', 'none'); // Let clicks pass through to the circle

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

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [data]);

    return <svg ref={svgRef} />;
};

export default BubbleChart;
