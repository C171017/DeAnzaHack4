import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data }) => {
    const svgRef = useRef(null);
    const simulationRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background-color', '#121212')
            .style('overflow', 'visible');

        // Initialize or update simulation
        if (!simulationRef.current) {
            // First time - create simulation
            simulationRef.current = d3.forceSimulation(data)
                .force('charge', d3.forceManyBody().strength(5))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide().radius(d => d.radius + 2).strength(0.7));
        } else {
            // Update existing simulation with new data
            simulationRef.current.nodes(data);
            simulationRef.current.alpha(1).restart();
        }

        // Use key function to track nodes by id
        const nodeKey = d => d.id;

        // Select existing nodes
        const nodes = svg.selectAll('.node')
            .data(data, nodeKey);

        // Remove nodes that are no longer in data
        nodes.exit().remove();

        // Get or create defs element
        let defs = svg.select('defs');
        if (defs.empty()) {
            defs = svg.append('defs');
        }

        // Enter: create new nodes
        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add image patterns for new nodes
        nodesEnter.each(function (d) {
            const patternId = `image-${d.id}`;
            // Check if pattern already exists
            if (defs.select(`#${patternId}`).empty()) {
                defs.append('pattern')
                    .attr('id', patternId)
                    .attr('height', '100%')
                    .attr('width', '100%')
                    .attr('patternContentUnits', 'objectBoundingBox')
                    .append('image')
                    .attr('height', 1)
                    .attr('width', 1)
                    .attr('preserveAspectRatio', 'none')
                    .attr('href', d.img);
            }
        });

        // Add circles to new nodes
        nodesEnter.append('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.img ? `url(#image-${d.id})` : '#333')
            .attr('stroke', '#ff5500')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .transition()
            .duration(300)
            .style('opacity', 1);

        // Add labels to new nodes
        nodesEnter.append('text')
            .text(d => d.group)
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('fill', 'white')
            .style('font-family', 'var(--font-family)')
            .style('font-size', d => Math.min(d.radius / 2, 12) + 'px')
            .style('font-weight', 'bold')
            .style('text-shadow', '1px 1px 2px black')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .transition()
            .duration(300)
            .style('opacity', 1);

        // Update: merge enter and update selections
        const nodesUpdate = nodesEnter.merge(nodes);

        // Update existing nodes (in case properties changed)
        nodesUpdate.select('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.img ? `url(#image-${d.id})` : '#333');

        nodesUpdate.select('text')
            .text(d => d.group)
            .style('font-size', d => Math.min(d.radius / 2, 12) + 'px');

        // Simulation tick - update all nodes
        simulationRef.current.on('tick', () => {
            nodesUpdate.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event, d) {
            if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulationRef.current.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Cleanup
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [data]);

    return <svg ref={svgRef} />;
};

export default BubbleChart;