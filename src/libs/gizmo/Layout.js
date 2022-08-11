import * as d3 from 'd3';
import DrawTools from './drawTools';

export default class Layout {
    constructor(props) {
        // prop Vars;
        this.graph = props.graph;

        this._layoutType = 'treeH'; // possible force, treeH, treeV;
        this.layoutSize = [0, 0];
        this.force = undefined;
        this.forceLinks = [];
        this.forceNodes = [];
        this.tree = undefined;
        this.treeData = [];
        this.treeMap = {};
        this.linkDistance = 'auto';
        this.distanceValue = 300;

        // functions
        this.clearData = this.clearData.bind(this);
        this.layoutType = this.layoutType.bind(this);
        this.initializePositions = this.initializePositions.bind(this);
        this.recalculatePositions = this.recalculatePositions.bind(this);
        this.executeExpansionForNode = this.executeExpansionForNode.bind(this);
        this.createForceElements = this.createForceElements.bind(this);
        this.initializeLayoutEngine = this.initializeLayoutEngine.bind(this);
        this.initializeTreePositions = this.initializeTreePositions.bind(this);
        this.resumeForce = this.resumeForce.bind(this);
        this.stopForce = this.stopForce.bind(this);

        this.createTreeData = this.createTreeData.bind(this);
        // helper functions;
        this.updateLayoutSize = this.updateLayoutSize.bind(this);
        this.setLinkDistance = this.setLinkDistance.bind(this);

        this.makeExpandAnimation = this.makeExpandAnimation.bind(this); // used
        this.makeSingleNodeCollapseAnimation = this.makeSingleNodeCollapseAnimation.bind(this);
        this.depthExplorationAnimation = this.depthExplorationAnimation.bind(this); // used
        this.initializePositionsForGroupExpansionAnimation = this.initializePositionsForGroupExpansionAnimation.bind(this);
        this.promisedLayoutAnimation = this.promisedLayoutAnimation.bind(this);
        this.pauseForceLayoutAnimation = this.pauseForceLayoutAnimation.bind(this);
    }

    pauseForceLayoutAnimation(doPause) {
        if (this._layoutType === 'force') {
            if (doPause) {
                this.stopForce();
            } else {
                this.resumeForce();
            }
        }
    }

    // the collapseAnimation will be propagated to the node, if true then it will be set to invisible
    async promisedLayoutAnimation(collapseAnimation, durationPercentage) {
        const that = this;
        const animationWaiter = new Promise(resolve => {
            const max = that.graph.classNodes.length - 1;
            let it = 0;

            that.graph.classNodes.forEach(async node => {
                node.setAnimationDurationPercentage(durationPercentage);
                if (it === max) {
                    node.startLayoutTransition(collapseAnimation, it, max, () => {
                        resolve(true);
                    });
                } else {
                    node.setAnimationDurationPercentage(durationPercentage);
                    node.startLayoutTransition(collapseAnimation);
                }
                it++;
            });
        });
        await animationWaiter;
    }

    makeSingleNodeCollapseAnimation(nodesToCollapse) {
        const max = nodesToCollapse.length - 1;
        let it = 0;
        const that = this;
        if (this.layoutType() === 'force') {
            nodesToCollapse.forEach(node => {
                if (it === max) {
                    node.startLayoutTransition(true, it, max, () => {
                        that.graph.redrawGraphAfterCollapse();
                    });
                } else {
                    node.startLayoutTransition(true);
                }
                it++;
            });
        } else {
            this.graph.classNodes.forEach(node => {
                if (it === max) {
                    node.startLayoutTransition(true, it, max, () => {
                        that.graph.redrawGraphAfterCollapse();
                    });
                } else {
                    node.startLayoutTransition(true);
                }
                it++;
            });
        }
    }

    async singleLevelExploration() {
        const that = this;
        const animationWaiter = new Promise(resolve => {
            const max = that.graph.classNodes.length - 1;
            let it = 0;
            that.graph.classNodes.forEach(async node => {
                if (it === max) {
                    node.startLayoutTransition(false, it, max, () => {
                        resolve(true);
                    });
                } else {
                    node.startLayoutTransition(false);
                }
                it++;
            });
        });

        await animationWaiter;
    }

    async depthExplorationAnimation(nodesThatExpand) {
        if (this.layoutType() === 'force') {
            // initialize force node positions;
            nodesThatExpand.forEach(item => {
                this.executeExpansionForNode(item, true); // this will overwrite the positions
            });
        }
        this.createTreeData();
        this.tree.size(this.layoutSize); // updates if there is something new
        this.initializeTreePositions();
        await this.singleLevelExploration();
    }

    makeExpandAnimation(nodesToExpand) {
        if (this.layoutType() !== 'force') {
            // ensure that all nodes are properly updated
            this.graph.classNodes.forEach(node => {
                node.startLayoutTransition(false);
            });
        } else {
            // we need to resume the force after the animation has finished;
            const max = nodesToExpand.length - 1;
            let it = 0;
            const that = this;
            nodesToExpand.forEach(node => {
                if (it === max) {
                    node.startLayoutTransition(false, it, max, () => {
                        that.resumeForce();
                    });
                } else {
                    node.startLayoutTransition(false);
                }
                it++;
            });
        }
    }

    setLinkDistance(value) {
        this.distanceValue = value;
        if (this.force) {
            this.force.linkDistance(value);
            if (this.layoutType() === 'force') {
                this.force.start();
            }
        }
        if (this.tree && this.treeData) {
            this.initializeTreePositions();
            this.graph.classNodes.forEach(node => {
                node.startLayoutTransition(false);
            });
        }
    }

    resumeForce() {
        if (this.force) {
            this.force.resume();
        }
    }

    stopForce() {
        if (this.force) {
            this.force.stop();
        }
    }

    clearData() {
        if (this._layoutType === 'force' && this.force) {
            this.force.stop();
            delete this.forceNodes;
            delete this.forceLinks;
            delete this.force;
            delete this.graph;
            delete this.treeData;
            delete this.treeMap;
        }
    }

    createTreeData() {
        // get the root node
        const rootNode = this.graph.mst.getRoot();

        // create the tree data for that thing;
        this.treeData = [];
        this.treeData.push(this.processSingleElement(rootNode, null));

        // create a tree layout;
        this.tree = d3.layout.tree().size(this.layoutSize);
    }

    processSingleElement(node, parent) {
        // recursive function;
        const newObj = {};
        this.treeMap[node.id()] = node;
        newObj.name = node.id();
        if (parent === null) {
            newObj.parent = 'null';
        } else {
            newObj.parent = parent.id();
        }
        if (node.outgoingLink.length > 0) {
            newObj.children = [];
            node.outgoingLink.forEach(item => {
                // check if we have an downward (child depth > parent depth) connection
                if (item.rangeNode().getDepth() > node.getDepth() && item.rangeNode().visible()) {
                    newObj.children.push(this.processSingleElement(item.rangeNode(), node));
                }
            });
        }
        return newObj;
    }

    initializeLayoutEngine() {
        if (this.force) {
            this.force.stop();
        }
        if (this._layoutType === 'force') {
            this.createForceElements();
            this.force.start();
        } else {
            this.createTreeData();
        }
    }

    updateLayoutSize() {
        const bb = this.graph.svgRoot.node().getBoundingClientRect();
        this.layoutSize[0] = bb.width;
        this.layoutSize[1] = bb.height;
    }

    layoutType(val) {
        if (!arguments.length) {
            return this._layoutType;
        }
        this._layoutType = val;
    }

    initializePositionsForGroupExpansionAnimation(newNodes, nodesToExpand) {
        this.updateLayoutSize();
        if (this._layoutType === 'force') {
            nodesToExpand.forEach(item => {
                this.executeExpansionForNode(item, true); // this will overwrite the positions
            });
        }
        if (this._layoutType === 'treeH' || this._layoutType === 'treeV') {
            // todo: check if we have to create this each time we have a layout change
            this.createTreeData();
            this.tree.size(this.layoutSize); // updates if there is something new
            this.initializeTreePositions();
        }
    }

    initializePositionsForAnimation(newNodes, nodeExpansionCaller) {
        if (this._layoutType === 'force') {
            if (nodeExpansionCaller) {
                this.executeExpansionForNode(nodeExpansionCaller, true); // this will overwrite the positions
            }
        }
        if (this._layoutType === 'treeH' || this._layoutType === 'treeV') {
            // todo: check if we have to create this each time we have a layout change
            this.createTreeData();
            this.tree.size(this.layoutSize); // updates if there is something new
            this.initializeTreePositions();
        }
    }

    initializePositions(rootNode, layoutChange) {
        this.updateLayoutSize();
        if (this._layoutType === 'force') {
            if (!layoutChange) {
                rootNode.setPosition(0.5 * this.layoutSize[0], 0.5 * this.layoutSize[1]);
            } else {
                rootNode.setPosition(0.5 * this.layoutSize[0], 0.5 * this.layoutSize[1]);
                this.force.stop();
                rootNode.px = rootNode.x;
                rootNode.py = rootNode.y;

                // TODO: This could be a part of setting the center of gravity for the layout >> need d3.v5 or so
                // the call should be this.force.center([rootNode.x, rootNode.y]);
            }
            const expandArray = [];
            const seenNodes = [];
            expandArray.push(rootNode);

            while (expandArray.length !== 0) {
                this.executeExpansionForNode(expandArray[0], layoutChange);
                // add children nodes only when the have not been in the seen array
                expandArray[0].outgoingLink.forEach(l => {
                    if (seenNodes.indexOf(l.rangeNode()) === -1) {
                        expandArray.push(l.rangeNode());
                        seenNodes.push(l.rangeNode());
                    }
                });
                expandArray.shift();
            }

            if (layoutChange) {
                this.makeLayoutTransition();
                this.force.start();
                this.graph.zoomToExtent();
            }
        }
        if (this._layoutType === 'treeH' || this._layoutType === 'treeV') {
            // todo: check if we have to create this each time we have a layout change
            this.createTreeData();

            this.tree.size(this.layoutSize); // updates if there is something new

            this.initializeTreePositions();
            if (layoutChange) {
                this.makeLayoutTransition(this.graph.zoomToExtent);
            }
        }
    }

    initializeTreePositions() {
        const rt = this.treeData[0];

        if (this._layoutType === 'treeV') {
            this.tree.nodeSize([this.distanceValue, this.distanceValue]);
        }
        if (this._layoutType === 'treeH') {
            this.tree.nodeSize([this.distanceValue, this.distanceValue]);
        }

        const temp = this.tree.nodes(rt).reverse();

        // set positions;
        temp.forEach(item => {
            const graphNode = this.treeMap[item.name];
            if (this._layoutType === 'treeV') {
                graphNode.setPosition(item.x, item.y);
            }
            if (this._layoutType === 'treeH') {
                graphNode.setPosition(item.y, item.x);
            }
        });
    }

    makeLayoutTransition(__callback, args) {
        let id = 0;
        const max = this.graph.classNodes.length - 1;
        this.graph.classNodes.forEach(node => {
            if (id === max) {
                node.startLayoutTransition(false, id, max, () => {
                    if (__callback) {
                        if (!args) {
                            __callback();
                        } else {
                            __callback(args[0], args[1]);
                        }
                    }
                });
            } else {
                node.startLayoutTransition(false);
            }
            id++;
        });
    }

    recalculatePositions() {
        this.graph.classNodes.forEach(node => {
            node.updateDrawPosition();
        });
        this.graph.updateHaloRadius();
    }

    createForceElements() {
        const that = this;
        const { graph } = this;
        if (this.force === undefined) {
            this.force = d3.layout.force();
            this.force.on('tick', this.recalculatePositions);
        }

        this.forceLinks = [];
        this.forceNodes = [];
        let i;
        for (i = 0; i < graph.propNodes.length; i++) {
            if (graph.propNodes[i].visible()) {
                // this is done when the property node it self is a force node >> it will return 2 links
                this.forceLinks = this.forceLinks.concat(graph.propNodes[i].getForceLink());
            }
        }

        // update force nodes based on visible flag
        for (i = 0; i < graph.classNodes.length; i++) {
            if (graph.classNodes[i].visible()) {
                this.forceNodes.push(graph.classNodes[i]);
            }
        }

        this.force.nodes(this.forceNodes);
        this.force.links(this.forceLinks);

        // compute link distance based on the rendering element size for subject predicate and object.
        let maxDist = 240;
        this.forceLinks.forEach(link => {
            // assume that width is always the larger dimension
            const sourceShape = link.source.getRenderingElementSize();
            const targetShape = link.target.getRenderingElementSize();
            const propertyShape = link.propertyData.getRenderingElementSize();
            let currentLinkDistance = 0;
            currentLinkDistance += 1.0 * sourceShape.w;
            currentLinkDistance += 0.75 * targetShape.w;
            currentLinkDistance += 1.0 * propertyShape.w;
            if (maxDist < currentLinkDistance) {
                maxDist = currentLinkDistance;
            }
        });

        this.distanceValue = Math.min(500, maxDist);
        // create forceLinks;
        this.force
            .charge(-700)
            .linkDistance(this.distanceValue) // just make sure that our links are not to long.
            .linkStrength(1)
            .size([that.layoutSize[0], that.layoutSize[1]])
            .gravity(0.025);

        this.force.linkDistance(this.distanceValue); // just make sure that our links are not to long.
    }

    executeExpansionForNode(node, layoutChange) {
        const distOffset = this.distanceValue;
        const startX = node.x;
        const startY = node.y;

        // get outgoing links;
        const childrenLinks = node.outgoingLink;
        const children = [];
        childrenLinks.forEach(link => {
            if (link.rangeNode().depthValue > node.depthValue) {
                children.push(link.rangeNode());
            }
        });

        let parent;
        let singleParent = false;
        let multiParent = false;
        if (node.incommingLink.length === 1) {
            if (node.incommingLink[0].domainNode().depthValue < node.depthValue) {
                parent = node.incommingLink[0].domainNode();
                singleParent = true;
            }
        }
        if (node.incommingLink.length > 1) {
            // && some are visible
            multiParent = false;

            node.incommingLink.forEach(income => {
                if (income.visible()) {
                    multiParent = true;
                }
            });
            if (multiParent === false) {
                parent = undefined;
            }
        }
        if (children.length !== 0) {
            if (parent === undefined && multiParent === false) {
                // we dont have any other restrictions, use the full  circle
                // compute new positions;
                let angle = 0;
                const angular_offset = 360 / children.length;
                children.forEach(child => {
                    const newPos = DrawTools().angle2NormedVec(angle);
                    if ((child.x === -1 && child.y === -1) || layoutChange) {
                        child.x = startX + newPos.x * distOffset;
                        child.y = startY + newPos.y * distOffset;
                        child.px = child.x;
                        child.py = child.y;
                        angle += angular_offset;
                    }
                });
            } else {
                // we have to see our direction;

                const angularSpace = [];
                // do we have only one parent?
                if (singleParent && parent) {
                    const oX = node.x - parent.x;
                    const oY = node.y - parent.y;
                    angularSpace.push(DrawTools().angleFromVector(-oX, -oY));
                    let sAngle = angularSpace[0] + 180 - 45;
                    const sOffset = 90 / children.length;
                    let r = 1;
                    sAngle -= 0.5 * sOffset;
                    children.forEach(child => {
                        if ((child.x === -1 && child.y === -1) || layoutChange) {
                            let nAngle = sAngle + r * sOffset;
                            if (nAngle > 360) {
                                nAngle -= 360;
                            }
                            const nPos = DrawTools().angle2NormedVec(nAngle);
                            child.x = startX + nPos.x * distOffset;
                            child.y = startY + nPos.y * distOffset;
                            child.px = child.x;
                            child.py = child.y;
                            r++;
                        }
                    });
                } else {
                    // we have a multi parent;
                    node.incommingLink.forEach(p => {
                        const oX = p.domainNode().x - node.x;
                        const oY = p.domainNode().y - node.y;
                        angularSpace.push(DrawTools().angleFromVector(oX, oY));
                    });
                    angularSpace.sort((a, b) => a - b);
                    const angularDistances = [];

                    let i;
                    for (i = 0; i < angularSpace.length - 1; i++) {
                        angularDistances.push(angularSpace[i + 1] - angularSpace[i]);
                    }
                    angularDistances.push(angularSpace[0] + 360 - angularSpace[angularSpace.length - 1]);
                    let maxDistance = 0;
                    let indexInSpace = 0;
                    for (i = 0; i < angularDistances.length; i++) {
                        if (angularDistances[i] > maxDistance) {
                            maxDistance = angularDistances[i];
                            indexInSpace = i;
                        }
                    }

                    let startAngle = 0;
                    const aOffset = (maxDistance - 0.5 * maxDistance) / children.length;
                    if (indexInSpace === angularDistances.length - 1) {
                        startAngle = angularSpace[angularSpace.length - 1];
                    } else {
                        startAngle = angularSpace[indexInSpace];
                    }

                    startAngle += 0.25 * maxDistance;
                    startAngle += 0.5 * aOffset;
                    let r = 0;
                    children.forEach(() => {
                        if ((children[r].x === -1 && children[r].y === -1) || layoutChange) {
                            let nAngle = startAngle + r * aOffset;
                            if (nAngle > 360) {
                                nAngle -= 360;
                            }
                            const nPos = DrawTools().angle2NormedVec(nAngle);
                            children[r].x = startX + nPos.x * distOffset;
                            children[r].y = startY + nPos.y * distOffset;
                            children[r].px = children[r].x;
                            children[r].py = children[r].y;
                        }
                        r++;
                    });
                }
            }
        }
    }
} // end of class definition
