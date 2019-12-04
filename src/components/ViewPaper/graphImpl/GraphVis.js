import Options from './options.js';
import * as d3 from 'd3';

import Node from './elements/Nodes'
import Edge from './elements/Edges'
import Property from './elements/Property'
import MinimumSpanningTree from './mst';
import Layout from './Layout'
import Navigation from './Navigation';

export default class GraphVis {
    constructor() {
        this.graphOptions = new Options();
        this.mst = new MinimumSpanningTree();
        this.nav = new Navigation({graph: this});
        this.layout = new Layout({graph: this}); // possible 'force, treeV, treeH'
        this.rootContainer = 'graphRendering';
        this.nodeMap = {};
        this.graphIsInitialized = false;

        this.renderedNodes = undefined;
        this.maxDepth = -1;
        this.filtedDepth = -1;

        // state, load, unload functions
        this.graphInitialized = this.graphInitialized.bind(this);
        this.loadData = this.loadData.bind(this);
        this.getMaxDepth = this.getMaxDepth.bind(this);
        this.computeDepth = this.computeDepth.bind(this);
        this.clearGraphData = this.clearGraphData.bind(this);

        // navigation functions
        this.updateLayout = this.updateLayout.bind(this);
        this.zoomToExtent = this.zoomToExtent.bind(this);

        // rendering functions
        this.initializeLayers = this.initializeLayers.bind(this);
        this.initializeRendering = this.initializeRendering.bind(this);
        this.filterGraphByDepth = this.filterGraphByDepth.bind(this);
        this.redrawGraph = this.redrawGraph.bind(this);
        this.redrawGraphWithReset = this.redrawGraphWithReset.bind(this);

        this.createRenderingElements = this.createRenderingElements.bind(this);
        this.drawRenderingElements = this.drawRenderingElements.bind(this);
        this.drawGraph = this.drawGraph.bind(this);

        // helper functions
        this.stopBackgroundProcesses = this.stopBackgroundProcesses.bind(this);
        this.bindComponentValues = this.bindComponentValues.bind(this);
        this.loadDefaultOptions = this.loadDefaultOptions.bind(this);
        this.ensureLayoutConsistency=this.ensureLayoutConsistency.bind(this);
    };


    /** State Load Unload Functions **/
    graphInitialized(val) {
        if (!arguments.length) {
            return this.graphIsInitialized;
        }
        this.graphIsInitialized = val;
    };


    loadData() {
        // clear if something was there;
        this.classNodes = [];
        this.propNodes = [];
        this.links = [];

        if (this.nodes.length === 0) {
            console.log('nope, we dont have any data !!!!');
        }

        if (this.nodes.length > 0) {
            // create the nodes and edges using the provided data;
            let classNodes = [];
            let iterator = 0;
            this.nodes.forEach(node => {
                const aNode = this.createNode(node);
                aNode.id(aNode.id() + iterator);
                classNodes.push(aNode);
                iterator++;
            });
            this.classNodes = classNodes;

            iterator = 0; // reset the iterator for the edges;
            let properties = [];
            this.edges.forEach(edge => {
                const anEdge = this.createEdge(edge, iterator);
                properties.push(anEdge);
                iterator++;
            });
            this.propNodes = properties;

            this.nav.releaseMutex();
            const rootNode = this.computeDepth();
            this.layout.initializePositions(rootNode);
            this.drawGraph();

            this.layout.initializeLayoutEngine();

            if (this.layout.layoutType() === 'force') {
                this.nav.zoomToExtent(true);
            } else {
                this.nav.zoomToExtent();
            }
        }
    };

    getMaxDepth() {
        return this.maxDepth - 1;
    };

    computeDepth() {
        this.mst.setNodes(this.classNodes);
        this.mst.setLinks(this.links);
        this.maxDepth = this.mst.computeMinimumSpanningTree();
        return this.mst.getRoot();
    };

    clearGraphData() {
        console.log('clearing the graphVis Data');
        if (this.layout) {
            this.layout.clearData();
        }
        if (this.nav) {
            this.nav.clearData();
        }

        delete this.layout;
        delete this.nav;

        this.svgRoot.remove();

        delete this.graphOptions;
        delete this.mst;
        delete this.edges;
        delete this.nodes;

        delete this.nodeMap;
        delete this.classNodes;
        delete this.propNodes;
        delete this.links;

    };

    /** Navigation Functions **/
    updateLayout(value) {
        this.layout.layoutType(value);
        this.layout.initializeLayoutEngine();
        this.layout.initializePositions(this.mst.getRoot(), true);
    };

    zoomToExtent() {
        // forwarding function to bee called form outside;
        this.nav.zoomToExtent();
    };

    /** Rendering Functions **/
    initializeLayers() {
        const layers = this.graphOptions.layerDefinitionObject();
        const root = this.graphRoot;
        const rootContainer = this.rootContainer;

        layers.forEach(function (layer) {
            if (layer === 'arrows') {
                const markerContainer = root.append('defs');
                markerContainer.node().id = rootContainer + '_' + layer;
            } else {
                const renderingLayer = root.append('g');
                renderingLayer.node().id = rootContainer + '_' + layer;
            }
        });
    };

    initializeRendering() {
        this.nav.initializeRendering();
    };

    filterGraphByDepth(depth) {
        if (depth === this.filtedDepth) {
            return;
        }
        let newNodes = [];
        this.classNodes.forEach(node => {
            if (node.getDepth() > depth) {
                node.visible(false);
                node.incommingLink.forEach(link => {
                    link.visible(false);
                    link.linkElement().visible(false);
                })
            } else {
                if (!node.visible()) {
                    newNodes.push(node); // add to new nodes;
                }
                node.visible(true);
                node.incommingLink.forEach(link => {
                    link.visible(true);
                    link.linkElement().visible(true);
                })
            }
        });
        this.updateDepthVis(newNodes);
        newNodes = []; // clear the nodes
        this.filtedDepth = depth;
    };

    redrawGraph() {
        // remove svg;
        this.graphRoot.selectAll('defs').remove();
        this.graphRoot.selectAll('g').remove();
        this.initializeLayers();
        this.layout.initializeLayoutEngine();
        this.layout.initializePositions(this.mst.getRoot(), true);
        this.drawGraph();
    };

    redrawGraphWithReset(props) {
        console.log('Resetting the visualization');
        this.resetSvgRoot(props.graphBgColor);
        this.graphRoot.selectAll('defs').remove();
        this.graphRoot.selectAll('g').remove();
        this.initializeLayers();

        if (props.graph.nodes.length > this.nodes.length) {
            this.nodes = props.graph.nodes;
            this.edges = props.graph.edges;
            this.renderedNodes = [];
            this.edgeElements = [];
            this.renderedLink = [];
            this.initializeLayers();
            this.initializeRendering();
            this.loadData('init');
        } else {
            this.layout.initializeLayoutEngine();
            this.nav.resetRendering();
            this.drawGraph();
        }
    };

    resetSvgRoot(bgColor) {
        if (this.svgRoot) {
            this.svgRoot.remove();
        }
        this.svgRoot = d3.select('#graphRendering').append('svg');
        this.svgRoot.style('width', '100%');
        this.svgRoot.style('height', '100%');
        this.svgRoot.style('background-color', bgColor);
        this.graphRoot = this.svgRoot.append('g'); // d3 node for the svg container
        this.graphRoot.style('overflow', 'hidden');
    };

    createRenderingElements(container, data) {
        return container.selectAll('.draggableItem')
            .data(data).enter()
            .append('g')
            .classed('draggableItem', true)
            .attr('id', function (d) {
                return d.id();
            })
            .call(this.nav.getDragBehaviour());
    };

    drawRenderingElements(elements) {
        elements.each(function (item) {
            if (item.visible()) {
                item.render(d3.select(this));
                item.addHoverEvents();
                item.updateDrawPosition();
            } else {
                d3.select(this).remove();
            }
        });
    };

    drawGraph() {
        // create and draw nodes
        const nodeContainer = d3.select('#graphRendering_nodes');
        this.renderedNodes = this.createRenderingElements(nodeContainer, this.classNodes);
        this.drawRenderingElements(this.renderedNodes);

        // create and draw properties
        const propContainer = d3.select('#graphRendering_properties');
        this.edgeElements = this.createRenderingElements(propContainer, this.propNodes);
        this.drawRenderingElements(this.edgeElements);

        // links are a bit different
        this.renderedLink = d3.select('#graphRendering_edges').selectAll('.linkElements')
            .data(this.links).enter()
            .append('g')
            .classed('.linkElements', true)
            .call(this.nav.getDragBehaviour());

        // create the links
        const makerContainer = d3.select('#graphRendering_arrows');
        if (this.renderedLink) {
            this.renderedLink.each(function (link) {
                if (link.visible()) {
                    link.render(d3.select(this), makerContainer);
                    link.updateDrawPosition();
                } else {
                    d3.select(this).remove();
                }
            });
        }
    };

    updateDepthVis(nodeRef) {
        this.graphRoot.selectAll('defs').remove();
        this.graphRoot.selectAll('g').remove();
        this.initializeLayers();
        this.layout.initializeLayoutEngine();

        if (this.layout.layoutType() === 'force') {
            // expand the nodes;
            if (nodeRef.length > 0) {
                // get simply the parents from which we want to expand;
                let parentMap = {};
                nodeRef.forEach(node => {
                    for (let i = 0; i < node.incommingLink.length; i++) {
                        const par = node.incommingLink[i];
                        if (!parentMap.hasOwnProperty(par.domainNode().id())) {
                            parentMap[par.domainNode().id()] = par.domainNode();
                        }
                    }
                });
                let nodesToExpand = Object.values(parentMap);
                nodesToExpand.forEach(node => {
                    this.layout.executeExpansionForNode(node, true);
                });
            }
        } // end of smart expanding for force directed layout
        this.drawGraph();
    };

    reinitializeGraphData(props) {
        if (this.svgRoot) {
            this.svgRoot.remove();
        }

        this.renderedNodes = [];
        this.edgeElements = [];
        this.renderedLink = [];

        this.svgRoot = d3.select('#graphRendering').append('svg');
        this.svgRoot.style('width', '100%');
        this.svgRoot.style('height', '100%');
        this.svgRoot.style('background-color', props.graphBgColor);

        this.graphRoot = this.svgRoot.append('g'); // d3 node for the svg container
        this.graphRoot.style('overflow', 'hidden');
    };

    createEdge(edge_data, iterator) {
        const property = new Property({configObject: this.graphOptions.edgeConfig()});
        property.setLabel(edge_data.label);
        property.id(property.id() + iterator);

        const srcNode = this.nodeMap[edge_data.from];
        const tarNode = this.nodeMap[edge_data.to];

        property.domainNode(srcNode);
        property.rangeNode(tarNode);

        const rx = Math.random();
        const ry = Math.random();
        property.setPosition(rx * 300, ry * 300);

        // create that link;
        const link = new Edge({configObject: this.graphOptions.edgeConfig()});
        link.domainNode(srcNode);
        link.propertyNode(property);
        link.rangeNode(tarNode);
        if (tarNode.type() === 'literal') {
            link.type('datatypeLink');
            link.setConfigObj(this.graphOptions.datatypeLinkConfig());
            property.type('datatypeProperty');
            property.setConfigObj(this.graphOptions.datatypeLinkConfig());
            if (this.graphOptions.renderingStyle() === 'uml') {
                link.visible(false);
                property.visible(false);
            }
        }

        // add link to the nodes;
        srcNode.addLinkElement(property);
        tarNode.addLinkElement(property);

        property.linkElement(link);
        this.links.push(link);

        return property;
    };

    createNode(node_data) {
        const node = new Node({configObject: this.graphOptions.nodeConfig()});
        node.setLabel(node_data.title);
        node.setPosition(-1, -1);
        if (node_data.type === 'literal') {
            node.type('literal');
            node.setConfigObj(this.graphOptions.datatypeConfig());
            if (this.graphOptions.renderingStyle() === 'uml') {
                node.visible(false);
            }
        }
        // append to map;
        this.nodeMap[node_data.id] = node;
        return node;
    };


    /** Helper functions**/
    ensureLayoutConsistency(layout){
        if (this.layout!==layout){
            this.updateLayout(layout);
        }
    };

    bindComponentValues(props) {
        this.layout.layoutType(props.layout);
        this.nodes = props.graph.nodes;
        this.edges = props.graph.edges;

        // get the  graphRoot;
        this.reinitializeGraphData(props);
        this.loadDefaultOptions(); // keep it here in order to make later adjustments easier :)
        this.initializeLayers();
        this.initializeRendering();

        this.loadData();
    };

    loadDefaultOptions() {
        this.graphOptions.loadDefaultOptions()
    };

    stopBackgroundProcesses() {
        this.nav.stopBackgroundProcesses();
    };

}// end of class definition
