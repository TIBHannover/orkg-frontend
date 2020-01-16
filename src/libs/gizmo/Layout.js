import DrawTools from './drawTools';
import * as d3 from 'd3';
// import {max} from 'moment';

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

        // functions
        this.clearData = this.clearData.bind(this);
        this.layoutType = this.layoutType.bind(this);
        this.initializePositions = this.initializePositions.bind(this);
        this.recalculatePositions = this.recalculatePositions.bind(this);
        this.executeExpansionForNode = this.executeExpansionForNode.bind(this);
        this.createForceElements = this.createForceElements.bind(this);
        this.initializeLayoutEngine = this.initializeLayoutEngine.bind(this);
        this.resumeForce = this.resumeForce.bind(this);
        this.stopForce = this.stopForce.bind(this);

        this.createTreeData = this.createTreeData.bind(this);
        // helper functions;
        this.updateLayoutSize = this.updateLayoutSize.bind(this);
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
        newObj['name'] = node.id();
        if (parent === null) {
            newObj['parent'] = 'null';
        } else {
            newObj['parent'] = parent.id();
        }
        if (node.outgoingLink.length > 0) {
            newObj['children'] = [];
            node.outgoingLink.forEach(item => {
                // check if we have an downward (child depth > parent depth) connection
                if (item.rangeNode().getDepth() > node.getDepth()) {
                    newObj['children'].push(this.processSingleElement(item.rangeNode(), node));
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

            const rt = this.treeData[0];

            if (this._layoutType === 'treeV') {
                this.tree.nodeSize([220, 200]);
            }
            if (this._layoutType === 'treeH') {
                this.tree.nodeSize([150, 250]);
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

            if (layoutChange) {
                this.makeLayoutTransition();
            }
        }
    }

    makeLayoutTransition() {
        let id = 0;
        const max = this.graph.classNodes.length - 1;
        this.graph.classNodes.forEach(node => {
            node.startLayoutTransition(id++, max, this.graph.zoomToExtent);
        });
    }

    recalculatePositions() {
        this.graph.classNodes.forEach(node => {
            node.updateDrawPosition();
        });
    }

    createForceElements() {
        const that = this;
        const graph = this.graph;
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

        // create forceLinks;
        this.force
            .charge(-500)
            .linkDistance(Math.min(500, maxDist)) // just make sure that our links are not to long.
            .linkStrength(0.8)
            .size([that.layoutSize[0], that.layoutSize[1]])
            .gravity(0.025);
    }

    executeExpansionForNode(node, layoutChange) {
        const distOffset = 200;
        const startX = node.x;
        const startY = node.y;

        // get outgoing links;
        const childrenLinks = node.outgoingLink;
        const children = [];
        childrenLinks.forEach(link => {
            children.push(link.rangeNode());
        });

        let parent = undefined;
        let singleParent = false;
        let multiParent = false;
        if (node.incommingLink.length === 1) {
            parent = node.incommingLink[0].domainNode();
            singleParent = true;
        }
        if (node.incommingLink.length > 1) {
            multiParent = true;
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
                        const oX = p.x - node.x;
                        const oY = p.y - node.y;
                        angularSpace.push(DrawTools().angleFromVector(oX, oY) - 90);
                    });
                    angularSpace.sort(function(a, b) {
                        return a - b;
                    });
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
                    const r = 0;
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
                    });
                }
            }
        }
    }
} // end of class definition
