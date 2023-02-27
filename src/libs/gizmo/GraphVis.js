import * as d3 from 'd3';
import groupBy from 'lodash/groupBy';
import { CLASSES } from 'constants/graphSettings';
import Options from './options.js';

import Node from './elements/Nodes';
import Edge from './elements/Edges';
import Property from './elements/Property';
import MinimumSpanningTree from './mst';
import Layout from './Layout';
import Navigation from './Navigation';

export default class GraphVis {
    constructor() {
        this.graphOptions = new Options();
        this.mst = new MinimumSpanningTree();
        this.nav = new Navigation({ graph: this });
        this.layout = new Layout({ graph: this }); // possible 'force, treeV, treeH'
        this.rootContainer = 'graphRendering';
        this.nodeMap = {};
        this.Id2NodeMap = {};
        this.Id2PropnodeMap = {};
        this.graphIsInitialized = false;

        this.renderedNodes = undefined;
        this.maxDepth = -1;

        this.forceAnimationTickBetweenExpand = 100;

        this.graphFullyExplored = false;
        this.hasIncrementalData = true;
        this.sortedByDepthNodes = [];
        this.mapOfResources = {}; // maps the present resources in the graph, helps to deal with duplicates and recursive links

        // overloadingFunctions;
        this.getDataFromApi = undefined; // has to be set from graphView  modal;
        this.fetchMultipleResourcesFromAPI = undefined;
        this.propagateMaxDepthValue = undefined; // has to be set from graphView modal;
        this.propagateDictionary = undefined;

        // dictionary stuff
        this.dictinary = [];
        this.drawHalo = false;
        this.pulseNodeIds = [];
        this.pulseNodeIterator = 0;

        // state, load, unload functions`
        this.graphInitialized = this.graphInitialized.bind(this);
        this.loadData = this.loadData.bind(this);
        this.getMaxDepth = this.getMaxDepth.bind(this);
        this.computeDepth = this.computeDepth.bind(this);
        this.clearGraphData = this.clearGraphData.bind(this);
        this.depthUpdateEvent = this.depthUpdateEvent.bind(this);

        // navigation functions
        this.updateLayout = this.updateLayout.bind(this);
        this.zoomToExtent = this.zoomToExtent.bind(this);

        // rendering functions
        this.initializeLayers = this.initializeLayers.bind(this);
        this.initializeRendering = this.initializeRendering.bind(this);

        this.redrawGraph = this.redrawGraph.bind(this);
        this.redrawGraphWithReset = this.redrawGraphWithReset.bind(this);

        this.createRenderingElements = this.createRenderingElements.bind(this);
        this.drawRenderingElements = this.drawRenderingElements.bind(this);
        this.drawGraph = this.drawGraph.bind(this);

        // helper functions
        this.stopBackgroundProcesses = this.stopBackgroundProcesses.bind(this);
        this.bindComponentValues = this.bindComponentValues.bind(this);
        this.loadDefaultOptions = this.loadDefaultOptions.bind(this);
        this.ensureLayoutConsistency = this.ensureLayoutConsistency.bind(this);
        this.updateNodeStatus = this.updateNodeStatus.bind(this);

        /** refactoring * */
        this.redrawGraphAfterExpand = this.redrawGraphAfterExpand.bind(this);
        this.redrawGraphAfterCollapse = this.redrawGraphAfterCollapse.bind(this);
        this.clearGraphAnimation = this.clearGraphAnimation.bind(this);

        this.performMultipleTasks = this.performMultipleTasks.bind(this);
        // collapse tasks
        this.performCollapse = this.performCollapse.bind(this);
        this.promisedGroupCollapse = this.promisedGroupCollapse.bind(this);
        this.singleGroupCollapse = this.singleGroupCollapse.bind(this);
        this.singleNodeCollapse = this.singleNodeCollapse.bind(this);
        this.collapseThisNodeToParent = this.collapseThisNodeToParent.bind(this);
        // collapseTasks based on planned execution
        this.planCollapseOperations = this.planCollapseOperations.bind(this);
        this.collectRecursiveNodeCollapse = this.collectRecursiveNodeCollapse.bind(this);
        this.executeSortedCollapsePlan = this.executeSortedCollapsePlan.bind(this);
        // expand tasks
        this.performExpansion = this.performExpansion.bind(this);
        this.promisedGroupExpand = this.promisedGroupExpand.bind(this);
        this.singleGroupExpand = this.singleGroupExpand.bind(this);
        this.singleNodeExpansion = this.singleNodeExpansion.bind(this);
        // explore tasks
        this.performExplorations = this.performExplorations.bind(this);
        this.exploreCurrentDept = this.exploreCurrentDept.bind(this);
        this.singleNodeExploration = this.singleNodeExploration.bind(this);
        this.fullExplore = this.fullExplore.bind(this);
        this.exploreMultipleNodes = this.exploreMultipleNodes.bind(this);

        this.planExpandAnimationsForHalos = this.planExpandAnimationsForHalos.bind(this);
    }

    async planExpandAnimationsForHalos(ids) {
        const nodesThatMustBeVisible = [];
        ids.forEach(item => {
            // search in maps
            if (this.Id2NodeMap[item]) {
                nodesThatMustBeVisible.push(this.Id2NodeMap[item]);
            }
            if (this.Id2PropnodeMap[item]) {
                // get the range node out of it;
                nodesThatMustBeVisible.push(this.Id2PropnodeMap[item].rangeNode());
            }
        });

        const nodesThatMustBeExpanded = [];
        this.findNodesThatNeedToBeExpanded(nodesThatMustBeVisible, nodesThatMustBeExpanded);
        nodesThatMustBeExpanded.sort((a, b) => (a.depthValue > b.depthValue ? 1 : b.depthValue > a.depthValue ? -1 : 0));

        // sort them by depth;
        const sortedByDepthArray = [];
        nodesThatMustBeExpanded.forEach(node => {
            if (!sortedByDepthArray[node.depthValue]) {
                sortedByDepthArray[node.depthValue] = [];
            }
            sortedByDepthArray[node.depthValue].push(node);
        });

        const groupsToExpand = [];
        sortedByDepthArray.forEach(lvl => {
            if (lvl) {
                groupsToExpand.push(lvl);
            }
        });

        await this.promisedGroupExpand(groupsToExpand).then();
        // for each depth make the expand;
    }

    findNodesThatNeedToBeExpanded = (currentSet, nodesThatMustBeExpanded) => {
        const nextSet = [];
        currentSet.forEach(node => {
            node.incommingLink.forEach(inLink => {
                if (!inLink.domainNode().visible()) {
                    nextSet.push(inLink.domainNode());
                }
                if (nodesThatMustBeExpanded.indexOf(inLink.domainNode()) === -1) {
                    if (inLink.domainNode().status !== 'expanded') {
                        nodesThatMustBeExpanded.push(inLink.domainNode());
                    }
                }
            });
        });
        if (nextSet.length > 0) {
            this.findNodesThatNeedToBeExpanded(nextSet, nodesThatMustBeExpanded);
        }
    };

    updateHaloRadius = () => {
        if (this.pulseNodeIds && this.pulseNodeIds.length > 0) {
            this.pulseNodeIds.forEach(nodeId => {
                if (this.Id2NodeMap[nodeId]) {
                    this.computeDistanceToCenterAndUpdateHaloRadius(this.Id2NodeMap[nodeId]);
                }
                if (this.Id2PropnodeMap[nodeId]) {
                    this.computeDistanceToCenterAndUpdateHaloRadius(this.Id2PropnodeMap[nodeId]);
                }
            });
        }
    };

    computeDistanceToCenterAndUpdateHaloRadius = node => {
        const posXY = this.nav.getScreenCoords(node.x, node.y);
        const w = this.layout.layoutSize[0];
        const h = this.layout.layoutSize[1];
        const translation = this.nav.graphTranslation;
        const { zoomFactor } = this.nav;

        const { x } = posXY;
        const { y } = posXY;
        let borderPoint_x = 0;
        let borderPoint_y = 0;
        const defaultRadius = 55;

        if (x < 0 || x > w || y < 0 || y > h) {
            // node outside viewport;
            // check for quadrant and get the correct boarder point (intersection with viewport)
            if (x < 0 && y < 0) {
                borderPoint_x = 0;
                borderPoint_y = 0;
            } else if (x > 0 && x < w && y < 0) {
                borderPoint_x = x;
                borderPoint_y = 0;
            } else if (x > w && y < 0) {
                borderPoint_x = w;
                borderPoint_y = 0;
            } else if (x > w && y > 0 && y < h) {
                borderPoint_x = w;
                borderPoint_y = y;
            } else if (x > w && y > h) {
                borderPoint_x = w;
                borderPoint_y = h;
            } else if (x > 0 && x < w && y > h) {
                borderPoint_x = x;
                borderPoint_y = h;
            } else if (x < 0 && y > h) {
                borderPoint_x = 0;
                borderPoint_y = h;
            } else if (x < 0 && y > 0 && y < h) {
                borderPoint_x = 0;
                borderPoint_y = y;
            }
            // kill all pulses of nodes that are outside the viewport
            const borderRadius_x = borderPoint_x - x;
            const borderRadius_y = borderPoint_y - y;

            let len = borderRadius_x * borderRadius_x + borderRadius_y * borderRadius_y;
            len = Math.sqrt(len);

            const normedX = borderRadius_x / len;
            const normedY = borderRadius_y / len;

            len += 25; // add 20 px;

            // re-normalized vector
            const newVectorX = normedX * len + x;
            const newVectorY = normedY * len + y;
            // compute world coordinates of this point
            const wX = (newVectorX - translation[0]) / zoomFactor;
            const wY = (newVectorY - translation[1]) / zoomFactor;
            const dx = wX - node.x;
            const dy = wY - node.y;

            const newRadius = Math.sqrt(dx * dx + dy * dy);

            if (newRadius > defaultRadius) {
                node.setOutOfViewportRadius(newRadius);
            } else if (node.renderConfig.renderingType === 'rect') {
                node.setOutOfViewportRadius(newRadius);
            } else {
                node.setInViewportRadius();
            }
        } else {
            node.setInViewportRadius();
        }
    };

    getDictionary = () => this.dictinary;

    buildDictionary = () => {
        this.dictinary = []; // clear the array;
        this.classNodes.forEach(node => {
            this.dictinary.push({ text: node.label, nodeId: node.id() });
        });
        this.propNodes.forEach(node => {
            this.dictinary.push({ text: node.label, nodeId: node.id() });
        });
        // give the dictionary to the search component;
        this.propagateDictionary();
    };

    countVisibleProps = id => {
        let visibleCount = 0;
        if (id) {
            id.forEach(item => {
                if (this.Id2NodeMap[item] && this.Id2NodeMap[item].visible()) {
                    visibleCount++;
                }
                if (this.Id2PropnodeMap[item] && this.Id2PropnodeMap[item].visible()) {
                    visibleCount++;
                }
            });
        }
        return visibleCount;
    };

    removeHalos = () => {
        this.pulseNodeIds.forEach(id => {
            if (this.Id2NodeMap[id]) {
                this.Id2NodeMap[id].removeHalo();
            }
            if (this.Id2PropnodeMap[id]) {
                this.Id2PropnodeMap[id].removeHalo();
            }
        });
    };

    haloVisForNodes = id => {
        this.removeHalos();
        this.pulseNodeIds = []; // clear pulse Ids;
        id.forEach(itemToHighlight => {
            if (this.Id2NodeMap[itemToHighlight]) {
                this.Id2NodeMap[itemToHighlight].drawHalo(true);
                if (this.Id2NodeMap[itemToHighlight].visible()) {
                    this.pulseNodeIds.push(itemToHighlight);
                }
            }
            if (this.Id2PropnodeMap[itemToHighlight]) {
                this.Id2PropnodeMap[itemToHighlight].drawHalo(true);

                if (this.Id2PropnodeMap[itemToHighlight].visible()) {
                    this.pulseNodeIds.push(itemToHighlight);
                }
            }
        });
        this.pulseNodeIterator = 0;
        this.updateHaloRadius();
    };

    zoomToANode = () => {
        // zoom to current id;
        const nodeId = this.pulseNodeIds[this.pulseNodeIterator];
        if (this.Id2PropnodeMap[nodeId]) {
            this.nav.zoomToNode(this.Id2PropnodeMap[nodeId]);
        }
        if (this.Id2NodeMap[nodeId]) {
            this.nav.zoomToNode(this.Id2NodeMap[nodeId]);
        }

        this.pulseNodeIterator = (this.pulseNodeIterator + 1) % this.pulseNodeIds.length;
    };

    expandNodesForHaloVis = async ids => {
        await this.planExpandAnimationsForHalos(ids);
    };

    async exploreMultipleNodes(nodesToExplore) {
        const ResourceIds = nodesToExplore.map(o => o._resourceId);
        const incrementalData = await this.fetchMultipleResourcesFromAPI(ResourceIds);
        let iterator = this.classNodes.length + 1;
        if (!incrementalData.nodes && !incrementalData.edges) {
            // we dont have new data
            return;
        }
        incrementalData.nodes.forEach(node => {
            if (this.mapOfResources[node.id] === undefined) {
                // create a node;
                const aNode = this.createNode(node);
                aNode.id(aNode.id() + iterator);
                if (aNode.type() === 'resource') {
                    aNode.status = 'unknown';
                }
                this.classNodes.push(aNode);
                this.Id2NodeMap[aNode.id()] = aNode;
                iterator++;
            }
        });

        iterator = this.propNodes.length + 1;
        if (incrementalData.edges) {
            incrementalData.edges.forEach(edge => {
                const anEdge = this.createEdge(edge, iterator);
                this.propNodes.push(anEdge);
                this.Id2PropnodeMap[anEdge.id()] = anEdge;

                // fixing positions of new nodes to its parents
                const childNode = anEdge.rangeNode();
                const parentNode = anEdge.domainNode();
                childNode.parentNodeForPosition(parentNode);
                childNode.setToParentNodePosition();
                iterator++;
            });
        }

        this.updateNodeStatus();
        nodesToExplore.forEach(n => {
            n.nodeHasBeenExplored = true;
        });
        this.computeDepth();
        await this.singleGroupExpand(nodesToExplore);
        this.layout.pauseForceLayoutAnimation(false);
        await this.runForceAnimation(this.forceAnimationTickBetweenExpand);
        this.layout.pauseForceLayoutAnimation(true);
        this.buildDictionary();
    }

    blackOpsSearch = async () => {
        const explorationDepth = 20; // fallback
        let exploreCounter = 0;
        while (exploreCounter < explorationDepth) {
            // collect current states;
            const unexploredNodes = [];

            for (let it = 0; it < this.sortedByDepthNodes.length; it++) {
                if (this.sortedByDepthNodes[it]) {
                    this.sortedByDepthNodes[it].forEach(item => {
                        if (item.isLiteralItem) {
                            item.nodeHasBeenExplored = true;
                        }
                        if (item.type() === 'resource' && item.status === 'unknown') {
                            unexploredNodes.push(item);
                        }
                    });
                }
            }
            if (unexploredNodes.length === 0) {
                this.graphFullyExplored = true;
                this.buildDictionary();
                this.mst.computeMinimumSpanningTree();
                // redraw full graph now;
                this.blackOpsRedraw();
                // this should force the redraw of all new items and then we are allowed to work on the expansions stuff
                return;
            }
            await this.blackOpsExplore(unexploredNodes);
            if (!this.hasIncrementalData) {
                this.graphFullyExplored = true;
                this.buildDictionary();
                this.mst.computeMinimumSpanningTree();
                // redraw full graph now;
                this.blackOpsRedraw();
                break;
            }

            exploreCounter++;
        }
    };

    async blackOpsExplore(nodesToExplore) {
        const ResourceIds = nodesToExplore.map(o => o._resourceId);
        const incrementalData = await this.fetchMultipleResourcesFromAPI(ResourceIds);
        let iterator = this.classNodes.length + 1;
        if (!incrementalData.nodes && !incrementalData.edges) {
            // we dont have new data
            this.hasIncrementalData = false;
            return;
        }
        this.hasIncrementalData = true;
        incrementalData.nodes.forEach(node => {
            if (this.mapOfResources[node.id] === undefined) {
                // create a node;
                const aNode = this.createNode(node);
                aNode.id(aNode.id() + iterator);
                if (aNode.type() === 'resource') {
                    aNode.status = 'unknown';
                }
                aNode.visible(false);
                // put parent position to the child node for the expand animation
                this.classNodes.push(aNode);
                this.Id2NodeMap[aNode.id()] = aNode;
                iterator++;
            }
        });

        iterator = this.propNodes.length + 1;
        if (incrementalData.edges) {
            incrementalData.edges.forEach(edge => {
                const anEdge = this.createEdge(edge, iterator);
                this.propNodes.push(anEdge);
                anEdge.visible(false);
                anEdge.linkElement().visible(false);
                this.Id2PropnodeMap[anEdge.id()] = anEdge;
                iterator++;
            });
        }

        this.updateNodeStatus();
        nodesToExplore.forEach(n => {
            n.nodeHasBeenExplored = true;
        });
        this.computeDepth();
    }

    async fullExplore(doubleTheDepth = false, maxIterationCounter = 10) {
        // ensure first that the graph is fully expanded;
        const levelsToExpand = [];
        for (let it = 0; it < this.sortedByDepthNodes.length; it++) {
            if (this.sortedByDepthNodes[it]) {
                levelsToExpand.push(it);
            }
        }
        await this.performExpansion(levelsToExpand);

        const explorationDepth = maxIterationCounter;
        // fix max amount of tries to 20 for now;
        let exploreCounter = 0;
        while (exploreCounter < explorationDepth) {
            // collect current states;
            const unexploredNodes = [];
            // this could be optimized by having explored levels state!
            for (let it = 0; it < this.sortedByDepthNodes.length; it++) {
                if (this.sortedByDepthNodes[it]) {
                    this.sortedByDepthNodes[it].forEach(item => {
                        if (item.type() === 'resource' && item.status === 'unknown' && item.isResearchFieldRelated !== true) {
                            unexploredNodes.push(item);
                            item.setExploreAnimation(true);
                        }
                    });
                }
            }
            if (unexploredNodes.length === 0) {
                // we have no more nodes to explore, restart force animation,
                // and forward the max value and disable the explore graph button (or even hide it)
                this.layout.pauseForceLayoutAnimation(false);
                if (!this.graphFullyExplored) {
                    this.propagateMaxDepthValue(this.getMaxDepth(), true);
                    this.graphFullyExplored = true;
                }
                return;
            }
            await this.exploreMultipleNodes(unexploredNodes);
        }
        exploreCounter++;

        // fallback for the fixed iterations
        // (when we have not found all the nodes we trie once more with the double amount of iterations)
        // but only once
        if (doubleTheDepth === false) {
            this.fullExplore(true, explorationDepth * 2);
        } else {
            console.log('We have tried a lot , still the graph is not explored! ');
        }
    }

    /** State Load Unload Functions * */
    graphInitialized(val) {
        if (!arguments.length) {
            return this.graphIsInitialized;
        }
        this.graphIsInitialized = val;
    }

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
            const classNodes = [];
            let iterator = 0;
            this.nodes.forEach(node => {
                const aNode = this.createNode(node);
                aNode.id(aNode.id() + iterator);
                this.Id2NodeMap[aNode.id()] = aNode;
                classNodes.push(aNode);
                iterator++;
            });
            this.classNodes = classNodes;

            iterator = 0; // reset the iterator for the edges;
            const properties = [];
            this.edges.forEach(edge => {
                const anEdge = this.createEdge(edge, iterator);
                properties.push(anEdge);
                this.Id2PropnodeMap[anEdge.id()] = anEdge;
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
        this.buildDictionary();
    }

    updateNodeStatus() {
        // go through the nodes;
        this.classNodes.forEach(node => {
            if (node.type() === 'resource') {
                // check if node has been already explored;
                // does the node has outgoing links that are visible?
                const outgoingLinks = node.outgoingLink;
                let visible = true;
                if (outgoingLinks.length > 0) {
                    // check if visible
                    outgoingLinks.forEach(link => {
                        if (!link.visible()) {
                            visible = false;
                        }
                    });
                    if (visible) {
                        node.status = 'expanded';
                    } else {
                        node.status = 'collapsed';
                    }
                }
                if (outgoingLinks.length === 0) {
                    if (node.nodeHasBeenExplored === true) {
                        node.status = 'leafNode';
                    } else {
                        node.status = 'unknown';
                    }
                }
            }
        });
    }

    getMaxDepth() {
        return this.maxDepth - 1;
    }

    computeDepth() {
        this.mst.setNodes(this.classNodes);
        this.mst.setLinks(this.links);
        this.mst.resetDepthValues();
        this.maxDepth = this.mst.computeMinimumSpanningTree();

        this.sortedByDepthNodes = [];
        this.classNodes.forEach(node => {
            if (this.sortedByDepthNodes[node.depthValue] === undefined) {
                this.sortedByDepthNodes[node.depthValue] = [];
            }
            this.sortedByDepthNodes[node.depthValue].push(node);
        });

        return this.mst.getRoot();
    }

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
    }

    /** Navigation Functions * */
    updateLayout(value) {
        this.layout.layoutType(value);
        this.layout.initializeLayoutEngine();
        this.layout.initializePositions(this.mst.getRoot(), true);
    }

    zoomToExtent() {
        // forwarding function to bee called form outside;
        this.nav.zoomToExtent();
    }

    /** Rendering Functions * */
    initializeLayers() {
        const layers = this.graphOptions.layerDefinitionObject();
        const root = this.graphRoot;
        const { rootContainer } = this;

        layers.forEach(layer => {
            if (layer === 'arrows') {
                const markerContainer = root.append('defs');
                markerContainer.node().id = `${rootContainer}_${layer}`;
            } else {
                const renderingLayer = root.append('g');
                renderingLayer.node().id = `${rootContainer}_${layer}`;
            }
        });
    }

    initializeRendering() {
        this.nav.initializeRendering();
    }

    blackOpsRedraw() {
        this.graphRoot.selectAll('defs').remove();
        this.graphRoot.selectAll('g').remove();
        this.initializeLayers();
        this.layout.initializeLayoutEngine();

        // force to set the svg root to all elements
        const nodeContainer = d3.select('#graphRendering_nodes');
        this.renderedNodes = this.createRenderingElements(nodeContainer, this.classNodes);
        this.drawRenderingElements(this.renderedNodes, true);

        // create and draw properties
        const propContainer = d3.select('#graphRendering_properties');
        this.edgeElements = this.createRenderingElements(propContainer, this.propNodes);
        this.drawRenderingElements(this.edgeElements, true);

        // links are a bit different
        this.renderedLink = d3
            .select('#graphRendering_edges')
            .selectAll('.linkElements')
            .data(this.links)
            .enter()
            .append('g')
            .classed('.linkElements', true)
            .call(this.nav.getDragBehaviour());

        // create the links
        const makerContainer = d3.select('#graphRendering_arrows');
        if (this.renderedLink) {
            this.renderedLink.each(function (link) {
                // force it to be draw!
                link.render(d3.select(this), makerContainer);
                if (link.visible()) {
                    link.updateDrawPosition();
                } else {
                    d3.select(this).remove();
                }
            });
        }

        // this.drawGraph();
    }

    redrawGraph() {
        // remove svg;
        this.graphRoot.selectAll('defs').remove();
        this.graphRoot.selectAll('g').remove();
        this.initializeLayers();
        this.layout.initializeLayoutEngine();
        this.layout.initializePositions(this.mst.getRoot(), true);
        this.drawGraph();
    }

    redrawGraphWithReset(props) {
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
            this.initializeRendering();
            this.loadData('init');
        } else {
            this.layout.initializeLayoutEngine();
            this.nav.resetRendering();
            this.drawGraph();
        }
    }

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
    }

    createRenderingElements(container, data) {
        return container
            .selectAll('.draggableItem')
            .data(data)
            .enter()
            .append('g')
            .classed('draggableItem', true)
            .attr('id', d => d.id())
            .call(this.nav.getDragBehaviour());
    }

    drawRenderingElements(elements, forceDraw) {
        elements.each(function (item) {
            if (forceDraw === true) {
                item.render(d3.select(this));
                item.addHoverEvents();
            }
            if (item.visible()) {
                item.render(d3.select(this));
                item.addHoverEvents();
                item.updateDrawPosition();
            } else {
                d3.select(this).remove();
            }
        });
    }

    drawGraph() {
        this.updateNodeStatus();
        // create and draw nodes
        const nodeContainer = d3.select('#graphRendering_nodes');
        this.renderedNodes = this.createRenderingElements(nodeContainer, this.classNodes);
        this.drawRenderingElements(this.renderedNodes);

        // create and draw properties
        const propContainer = d3.select('#graphRendering_properties');
        this.edgeElements = this.createRenderingElements(propContainer, this.propNodes);
        this.drawRenderingElements(this.edgeElements);

        // links are a bit different
        this.renderedLink = d3
            .select('#graphRendering_edges')
            .selectAll('.linkElements')
            .data(this.links)
            .enter()
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
    }

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
    }

    createEdge(edge_data, iterator) {
        const property = new Property({ configObject: this.graphOptions.edgeConfig() });

        property.setLabel(edge_data.label);
        property.id(property.id() + iterator);
        property.graph = this;

        const srcNode = this.nodeMap[edge_data.from];
        const tarNode = this.nodeMap[edge_data.to];

        property.domainNode(srcNode);
        property.rangeNode(tarNode);

        const rx = Math.random();
        const ry = Math.random();
        property.setPosition(rx * 300, ry * 300);

        // create that link;
        const link = new Edge({ configObject: this.graphOptions.edgeConfig() });
        link.domainNode(srcNode);
        link.propertyNode(property);
        link.rangeNode(tarNode);

        if (edge_data.isAuthorProp === true) {
            if (tarNode.type() === 'literal') {
                tarNode.setStatusLeafNode();
            }
            tarNode.type('resource');
            tarNode.setConfigObj(this.graphOptions.nodeConfig());
            tarNode.addIcon('userIcon');
        }

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

        if (edge_data.isDOIProp === true) {
            tarNode.addIcon('doiIcon');
        }

        // add link to the nodes;
        srcNode.addLinkElement(property);
        tarNode.addLinkElement(property);

        property.linkElement(link);
        this.links.push(link);

        return property;
    }

    createNode(node_data) {
        const node = new Node({ configObject: this.graphOptions.nodeConfig() });
        node.setLabel(node_data.title);
        node.setPosition(-1, -1);
        node.graph = this;
        node.isResearchFieldRelated = node_data.isResearchFieldRelated;
        if (node_data.type === 'literal') {
            node.type('literal');
            node.setConfigObj(this.graphOptions.datatypeConfig());
            node.setStatusLeafNode();
            if (this.graphOptions.renderingStyle() === 'uml') {
                node.visible(false);
            }
        } else {
            node.resourceId(node_data.id);
            this.mapOfResources[node_data.id] = node;
            node.setGraph(this);
        }
        // append to map;
        this.nodeMap[node_data.id] = node;

        if (node_data.classificationArray) {
            // todo: based on the classificationArray, add further icons
            if (node_data.classificationArray.indexOf(CLASSES.PAPER) !== -1) {
                node.addIcon('paperIcon');
            }
        }

        return node;
    }

    /** Helper functions* */
    ensureLayoutConsistency(layout) {
        if (this.layout.layoutType() !== layout) {
            this.updateLayout(layout);
        }
    }

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
    }

    loadDefaultOptions() {
        this.graphOptions.loadDefaultOptions();
    }

    stopBackgroundProcesses() {
        this.layout.stopForce();
        this.nav.stopBackgroundProcesses();
    }

    async depthUpdateEvent(val) {
        // try to detect action;
        const internalDepth = val + 1;
        let requiresExpansions = false;
        let requiresExplore = false;
        let requiresCollapse = false;

        // go through the sortedArray;
        const needToExploreLevel = [];
        const needToExpandLevel = [];
        const needToCollapseLevel = [];
        let seenUnKnownObject = false;
        // need the iterative for loops here;
        for (let it = 1; it < this.sortedByDepthNodes.length; it++) {
            for (let i = 0; i < this.sortedByDepthNodes[it].length; i++) {
                const item = this.sortedByDepthNodes[it][i];
                if (item.type() === 'resource') {
                    if (item.status === 'unknown') {
                        seenUnKnownObject = true;
                    }
                    if (item.status === 'unknown' && it < internalDepth) {
                        requiresExplore = true;
                        if (needToExploreLevel.indexOf(it) === -1) {
                            needToExploreLevel.push(it);
                        }
                    }
                    if (item.status === 'collapsed' && it < internalDepth) {
                        requiresExpansions = true;
                        if (needToExpandLevel.indexOf(it) === -1) {
                            needToExpandLevel.push(it);
                        }
                    }
                    if (item.status === 'expanded' && it >= internalDepth) {
                        requiresCollapse = true;

                        if (needToCollapseLevel.indexOf(it) === -1) {
                            needToCollapseLevel.push(it);
                        }
                    }
                }
            }
        }

        if (seenUnKnownObject === false) {
            // we have searched the full graph and there is nothing more to explore !
            // we have found maximum of data!\

            if (!this.graphFullyExplored) {
                this.propagateMaxDepthValue(this.getMaxDepth(), true);
                this.graphFullyExplored = true;
            }
            if (this.graphFullyExplored && internalDepth > this.getMaxDepth()) {
                // this.propagateMaxDepthValue(this.getMaxDepth(), true);
            }
        }

        if (!requiresCollapse && !requiresExpansions && !requiresExplore) {
            return;
        }
        this.layout.pauseForceLayoutAnimation(true);
        const sumActions = requiresExpansions + requiresExplore + requiresCollapse;
        if (sumActions === 1) {
            // single action type
            this.layout.pauseForceLayoutAnimation(true);
            if (requiresCollapse) {
                this.performCollapse(needToCollapseLevel);
            }
            if (requiresExplore) {
                this.performExplorations(needToExploreLevel, internalDepth);
            }
            if (requiresExpansions) {
                await this.performExpansion(needToExpandLevel);
                this.layout.pauseForceLayoutAnimation(false);
            }
        } else {
            this.performMultipleTasks(needToCollapseLevel, needToExpandLevel, needToExploreLevel, internalDepth);
        }
        // force layout will automatically be restarted
    }

    /** multiple Task execution * */
    async performMultipleTasks(collapseGroup, expandGroup, exploreGroup, internalDepth) {
        if (this.layout.layoutType() === 'force') {
            this.layout.stopForce();
        }
        await this.performCollapse(collapseGroup);
        await this.performExpansion(expandGroup);
        await this.performExplorations(exploreGroup, internalDepth);
        if (this.layout.layoutType() === 'force') {
            this.layout.resumeForce();
        }
    }

    /** Collapse Tasks * */
    // perform collapse receives levels to collapse, it detects the items to collapse by their status (expanded)
    // then it executes a promisedGroupCollapse and redraws the graph
    // promised group collapse executes for each level the collapse operation and starts the promised animation
    // the promises are there to ensure the level by collapse.
    async performCollapse(levelsToCollapse) {
        if (levelsToCollapse.length === 0) {
            return;
        }
        const groupsToCollapse = [];
        const revLvl = levelsToCollapse.reverse();
        revLvl.forEach(lvl => {
            const singleGroup = [];
            this.sortedByDepthNodes[lvl].forEach(item => {
                if (item.status === 'expanded') {
                    singleGroup.push(item);
                }
            });
            if (singleGroup.length > 0) {
                groupsToCollapse.push(singleGroup);
            }
        });
        await this.promisedGroupCollapse(groupsToCollapse);
        this.redrawGraphAfterCollapse();
    }

    async promisedGroupCollapse(groupsToCollapse) {
        // keep it an iterative for loop to ensure the correct execution of collapse operations
        for (let i = 0; i < groupsToCollapse.length; i++) {
            await this.singleGroupCollapse(groupsToCollapse[i], (i + 1) / groupsToCollapse.length);
        }
    }

    async singleGroupCollapse(nodesToCollapse, animationPercentageDuration = 1) {
        let children = [];
        nodesToCollapse.forEach(node => {
            children = [].concat(children, this.collectChildrenAndSetVisibilityFlag(node, false));
        });
        // make an collapse animation ;
        this.layout.createTreeData();
        this.layout.initializeTreePositions();
        // this has to be created after the positions are computed;
        children.forEach(child => {
            child.setToParentNodePosition();
        });

        await this.layout.promisedLayoutAnimation(true, animationPercentageDuration);
    }

    async singleNodeCollapse(node, redraw) {
        if (this.layout.layoutType() === 'force') {
            this.layout.stopForce();
        }
        // collect the children;
        const children = this.collectChildrenAndSetVisibilityFlag(node, false);
        // make an collapse animation ;
        this.layout.createTreeData();
        this.layout.initializeTreePositions();
        // this has to be created after the positions are computed;
        children.forEach(child => {
            child.setToParentNodePosition();
        });
        // this.layout.makeSingleNodeCollapseAnimation(children);
        await this.layout.promisedLayoutAnimation(true, 0.5);
        if (redraw !== false) {
            this.redrawGraphAfterCollapse();
        }
    }

    async collapseThisNodeToParent(node) {
        function _callback(node) {
            if (node.incommingLink.length === 1) {
                // we can make an animation to the parent;
                const link = node.incommingLink[0];
                const parent = node.incommingLink[0].domainNode();

                link.linkElement().visible(false);
                link.visible(false);
                node.visible(false);
                // function does not know "this" so we use the node as reference
                // make an collapse animation ;
                node.graph.layout.createTreeData();
                node.graph.layout.initializeTreePositions();
                node.x = parent.x;
                node.y = parent.y;
                node.graph.layout.makeSingleNodeCollapseAnimation([node]);
            }
        }
        // make first the single node collapse;
        await this.planCollapseOperationsForSingleNode(node, false, _callback);
    }

    // planned collapse for a single node action
    async executeSortedCollapsePlan(executionArray, redraw) {
        if (this.layout.layoutType() === 'force') {
            this.layout.stopForce();
        }
        // group them by the depth;
        const groups = groupBy(executionArray, 'depthValue'); // data is your initial collection
        let inverseGroup = []; // array of objects that represent a group(object)
        for (const name in groups) {
            if (groups.hasOwnProperty(name)) {
                inverseGroup[name] = groups[name];
            }
        }
        inverseGroup = inverseGroup.reverse();
        inverseGroup = inverseGroup.filter(item => item != null);

        await this.promisedGroupCollapse(inverseGroup);
        if (redraw !== false) {
            this.redrawGraphAfterCollapse();
        }
    }

    /** Expansion Tasks * */
    async performExpansion(levelsToExpand) {
        const groupsToExpand = [];
        levelsToExpand.forEach(level => {
            const lvlGroup = [];
            this.sortedByDepthNodes[level].forEach(lvlItem => {
                if (lvlItem.status === 'collapsed') {
                    lvlGroup.push(lvlItem);
                }
            });
            if (lvlGroup.length > 0) {
                groupsToExpand.push(lvlGroup);
            }
        });
        if (groupsToExpand.length > 0) {
            await this.promisedGroupExpand(groupsToExpand);
        }
    }

    async promisedGroupExpand(groupsToExpand) {
        // keep it an iterative for loop to ensure the correct execution of collapse operations
        for (let i = 0; i < groupsToExpand.length; i++) {
            if (groupsToExpand[i]) {
                await this.singleGroupExpand(groupsToExpand[i], Math.max(0.125, 1.0 - i / groupsToExpand.length));
                this.layout.pauseForceLayoutAnimation(false);
                await this.runForceAnimation(this.forceAnimationTickBetweenExpand);
                this.layout.pauseForceLayoutAnimation(true);
            }
        }
    }

    async runForceAnimation(duration) {
        if (this.layout.layoutType() === 'force') {
            const animationWaiter = new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, duration);
            });
            await animationWaiter;
        }
    }

    collectChildrenAndSetVisibilityFlag(parent, visFlag, setToParentPos) {
        /** extension for single node collapse * */
        const vislinks = [];
        const invislinks = [];
        parent.outgoingLink.forEach(link => {
            if (link.visible() === true) {
                vislinks.push(link);
            } else {
                invislinks.push(link);
            }
        });
        const children = [];
        parent.outgoingLink.forEach(link => {
            const child = link.rangeNode();
            if (child.depthValue > parent.depthValue) {
                link.visible(visFlag);
                link.linkElement().visible(visFlag);
                child.visible(visFlag);
                child.parentNodeForPosition(parent);
                children.push(child);
                if (setToParentPos === true) {
                    if (invislinks.indexOf(link) !== -1) {
                        // sets only to parent pos when we have the invis item
                        child.setToParentNodePosition();
                    }
                }
            }
        });

        // after we set the parents to the values, we have to investigate once more, in order to find
        // links point either to the same depth level or above;
        // TODO: this should be investigated of optimization
        parent.outgoingLink.forEach(link => {
            const child = link.rangeNode();
            child.incommingLink.forEach(income => {
                // set the income link to be visible
                if (income.rangeNode().visible() && income.domainNode().visible()) {
                    income.visible(true);
                    income.linkElement().visible(true);
                } else {
                    income.visible(false);
                    income.linkElement().visible(false);
                }
            });
            child.outgoingLink.forEach(outgo => {
                // set the income link to be visible
                if (outgo.rangeNode().visible() && outgo.domainNode().visible()) {
                    outgo.visible(true);
                    outgo.linkElement().visible(true);
                } else {
                    outgo.visible(false);
                    outgo.linkElement().visible(false);
                }
            });
        });

        return children;
    }

    async singleGroupExpand(nodesToExpand, animationDurationPercentage = 1.0) {
        let nodeRef = [];
        nodesToExpand.forEach(node => {
            node.incommingLink.forEach(link => {
                if (link.domainNode().depthValue <= node.depthValue) {
                    link.visible(true);
                    link.linkElement().visible(true);
                }
            });
            nodeRef = [].concat(nodeRef, this.collectChildrenAndSetVisibilityFlag(node, true, true));
        });
        this.clearGraphAnimation();
        this.initializeLayers();
        this.drawGraph();
        this.layout.initializeLayoutEngine(); // creates force nodes and tree data
        this.layout.pauseForceLayoutAnimation(true);
        this.layout.initializePositionsForGroupExpansionAnimation(nodeRef, nodesToExpand);
        await this.layout.promisedLayoutAnimation(false, animationDurationPercentage);
    }

    async singleNodeExpansion(node) {
        // fetch the nodes that need to be expanded;
        node.incommingLink.forEach(link => {
            if (node.depthValue > link.domainNode().depthValue) {
                link.visible(true);
                link.linkElement().visible(true);
            }
            // else {
            //     link.visible(false);
            //     link.linkElement().visible(false);
            // }
        });
        // adding functionality for outgoing links that have smaller depth;

        const nodeRef = this.collectChildrenAndSetVisibilityFlag(node, true, true);

        this.clearGraphAnimation();
        this.initializeLayers();
        this.drawGraph();
        this.layout.initializeLayoutEngine(); // creates force nodes and tree data
        this.layout.pauseForceLayoutAnimation(true);
        this.layout.initializePositionsForAnimation(nodeRef, node);
        await this.layout.promisedLayoutAnimation(false);

        this.layout.pauseForceLayoutAnimation(false);
    }

    /** Exploration Tasks* */
    async performExplorations(needToExploreLevels, internalDepth) {
        const that = this;
        const lastKnownLevel = needToExploreLevels[needToExploreLevels.length - 1];
        if (lastKnownLevel < internalDepth) {
            for (let i = lastKnownLevel + 1; i < internalDepth; i++) {
                needToExploreLevels.push(i);
            }
        }

        // plan the execution;
        for (let it = 0; it < needToExploreLevels.length; it++) {
            const lvl = needToExploreLevels[it];
            // see if nodes on that lvl needs to be explored;
            const nodesOnLvlToExplore = [];
            if (that.sortedByDepthNodes[lvl]) {
                that.sortedByDepthNodes[lvl].forEach(item => {
                    if (item.type() === 'resource' && item.status === 'unknown') {
                        nodesOnLvlToExplore.push(item);
                    }
                });
            } else {
                if (!this.graphFullyExplored) {
                    this.propagateMaxDepthValue(this.getMaxDepth(), true);
                    this.graphFullyExplored = true;
                }
                break;
            }

            await that.exploreCurrentDept(nodesOnLvlToExplore);
        }
        this.layout.pauseForceLayoutAnimation(false);
        this.buildDictionary();
    }

    async exploreCurrentDept(nodesToExplore) {
        await this.exploreMultipleNodes(nodesToExplore);
        this.buildDictionary();
    }

    async singleNodeExploration(node, redrawWhenFinished = true) {
        const that = this;
        const idToFetch = node._resourceId;
        node.nodeHasBeenExplored = true;
        node.setExploreAnimation(true);

        const incrementalData = await this.getDataFromApi(idToFetch);

        if (!incrementalData.nodes) {
            node.setExploreAnimation(false);
            node.setStatusLeafNode();
            node.redraw(); // updated status >> drawing correct color and button;
        } else {
            // we will have to call a redraw function;
            if (redrawWhenFinished) {
                this.clearGraphAnimation(); // this removes the rendering elements
            }
            let iterator = that.classNodes.length + 1;
            const parentPosition = [node.x, node.y];
            const nodeRef = [];
            incrementalData.nodes.forEach(node => {
                if (node.id !== idToFetch && this.mapOfResources[node.id] === undefined) {
                    // create a node;
                    const aNode = that.createNode(node);
                    aNode.id(aNode.id() + iterator);
                    this.Id2NodeMap[aNode.id()] = aNode;
                    nodeRef.push(aNode);
                    if (aNode.type() === 'resource') {
                        aNode.status = 'unknown';
                    }
                    // put parent position to the child node for the expand animation
                    aNode.x = parentPosition[0];
                    aNode.y = parentPosition[1];
                    that.classNodes.push(aNode);
                    iterator++;
                }
            });
            iterator = that.propNodes.length + 1;
            if (incrementalData.edges) {
                incrementalData.edges.forEach(edge => {
                    const anEdge = that.createEdge(edge, iterator);
                    that.propNodes.push(anEdge);
                    this.Id2PropnodeMap[anEdge.id()] = anEdge;
                    iterator++;
                });
            }
            if (redrawWhenFinished) {
                this.computeDepth();
                this.redrawGraphAfterExpand(nodeRef, node);
                this.buildDictionary();
            }
        }
    }

    // some helper functions;
    redrawGraphAfterCollapse() {
        this.clearGraphAnimation();
        this.initializeLayers();
        this.drawGraph();
        this.layout.initializeLayoutEngine(); // creates force nodes and tree data
    }

    clearGraphAnimation() {
        this.classNodes.forEach(node => {
            if (node.svgRoot) {
                node.svgRoot.remove(); // remove the items; so no memLeak
            }
        });
        this.propNodes.forEach(node => {
            if (node.svgRoot) {
                node.svgRoot.remove();
                if (node.linkElement().svgRoot) {
                    node.linkElement().svgRoot.remove();
                }
            }
        });
        d3.select('#graphRendering_arrows').remove();
        d3.select('#graphRendering_edges').remove();
        d3.select('#graphRendering_nodes').remove();
        d3.select('#graphRendering_properties').remove();
    }

    redrawGraphAfterExpand(newNodes, callerNode) {
        // draw all nodes as they are;

        // we need to add the layers
        this.initializeLayers();
        this.drawGraph();
        this.layout.initializeLayoutEngine(); // creates force nodes and tree data
        // however we need to stop it , create the expand animation and then resume force if we have it;
        if (this.layout.layoutType() === 'force') {
            this.layout.stopForce();
        }
        // create the expand animation;
        this.layout.initializePositionsForAnimation(newNodes, callerNode);
        this.layout.makeExpandAnimation(newNodes); // it will detect if force and resume it
    }

    checkForRecursivePlan(node, recursiveCollapsePlan) {
        let recursivePlan = false;
        node.outgoingLink.forEach(outLink => {
            const childNode = outLink.rangeNode();
            if (childNode.depthValue > node.depthValue) {
                childNode.outgoingLink.forEach(next => {
                    if (next.rangeNode().visible() && next.rangeNode().depthValue >= childNode.depthValue) {
                        recursivePlan = true;
                        if (recursiveCollapsePlan.indexOf(childNode) === -1) {
                            recursiveCollapsePlan.push(childNode);
                        }
                    }
                });
            }
        });

        return recursivePlan;
    }

    collectRecursiveNodeCollapse(recursiveArray) {
        recursiveArray.forEach(child => {
            const recursiveCollapsePlan = []; // these are additional nodes;
            const recursivePlan = this.checkForRecursivePlan(child, recursiveCollapsePlan);
            if (recursivePlan) {
                this.collectRecursiveNodeCollapse(recursiveCollapsePlan);
            } else if (recursiveArray.indexOf(child) === -1) {
                recursiveArray.push(child);
            }
            // collect the data to propagate it back
            recursiveCollapsePlan.forEach(item => {
                if (recursiveArray.indexOf(item) === -1) {
                    recursiveArray.push(item);
                }
            });
        }); // end of current child investigation
    }

    planCollapseOperations(caller) {
        // check if recursive action plan or single action plan;

        const recursiveCollapsePlan = []; // array of nodes;
        const recursivePlan = this.checkForRecursivePlan(caller, recursiveCollapsePlan);
        if (recursivePlan === false) {
            this.singleNodeCollapse(caller);
        } else {
            // identify collapse action plan
            this.collectRecursiveNodeCollapse(recursiveCollapsePlan);
            recursiveCollapsePlan.push(caller);
            // sort the nodes by highest depth;
            recursiveCollapsePlan.sort((a, b) => (a.depthValue > b.depthValue ? -1 : b.depthValue > a.depthValue ? 1 : 0));
            this.executeSortedCollapsePlan(recursiveCollapsePlan).then(() => {}); // ignoring then
        }
    }

    async planCollapseOperationsForSingleNode(caller, redraw, callback) {
        // check if recursive action plan or single action plan;

        const recursiveCollapsePlan = []; // array of nodes;
        const recursivePlan = this.checkForRecursivePlan(caller, recursiveCollapsePlan);
        if (recursivePlan === false) {
            await this.singleNodeCollapse(caller, redraw);
            callback(caller);
        } else {
            // identify collapse action plan
            this.collectRecursiveNodeCollapse(recursiveCollapsePlan);
            recursiveCollapsePlan.push(caller);
            // sort the nodes by highest depth;
            recursiveCollapsePlan.sort((a, b) => (a.depthValue > b.depthValue ? -1 : b.depthValue > a.depthValue ? 1 : 0));
            this.executeSortedCollapsePlan(recursiveCollapsePlan, redraw).then(() => {
                callback(caller);
            }); // ignoring then
        }
    }
} // end of class definition
