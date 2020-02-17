export default class MinimumSpanningTree {
    constructor() {
        // assumption;
        //        MST provides also the Depth of the graph;
        // precondition:
        //        Nodes and links are the internal data types of elements;
        //        thus we can assign the depth value directly to these item;

        this.nodes = [];
        this.links = [];

        this.rootNode = undefined;
        this.setNodes = this.setNodes.bind(this);
        this.setLinks = this.setLinks.bind(this);

        this.maxDepth = -1;
        this.computeMinimumSpanningTree = this.computeMinimumSpanningTree.bind(this);
        this.getRoot = this.getRoot.bind(this);
    }

    getRoot() {
        return this.rootNode;
    }

    setNodes(n) {
        this.nodes = n;
    }

    setLinks(l) {
        this.links = l;
    }

    resetDepthValues() {
        this.nodes.forEach(node => {
            node.depthValue = -1;
        });
    }

    computeMinimumSpanningTree() {
        // find root node;
        const rootCandidates = [];
        const propagateArray = [];
        this.nodes.forEach(node => {
            if (node.incommingLink.length === 0) {
                rootCandidates.push(node);
            }
        });

        if (rootCandidates.length === 0) {
            console.log('%c COULD NOT FIND A ROOT NODE >> USING FIRST ELEMENT! ', 'color: #ff0000');
            rootCandidates.push(this.nodes[0]);
        }

        if (rootCandidates.length === 1) {
            this.rootNode = rootCandidates[0];
        }

        rootCandidates.forEach(root => {
            root.setDepth(1);
            propagateArray.push(root);

            // propagate depth to other nodes;
            while (propagateArray.length !== 0) {
                const currentRoot = propagateArray[0];
                const children = currentRoot.outgoingLink;
                // console.log('current root ' + currentRoot.label);
                children.forEach(child => {
                    //  console.log('\t\t current child ' + child.rangeNode().label + ' has depth ' + child.rangeNode().getDepth());
                    if (child.rangeNode().getDepth() === -1) {
                        const nextDepth = currentRoot.getDepth() + 1;
                        //   console.log('this max depth=' + this.maxDepth);
                        if (nextDepth > this.maxDepth) {
                            this.maxDepth = nextDepth;
                        }
                        child.rangeNode().setDepth(nextDepth);
                        propagateArray.push(child.rangeNode());
                    }
                });
                propagateArray.shift(); // removes the current element from array;
            }
        });
        return this.maxDepth;
    }
} // end of class definition
