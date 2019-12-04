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
    };

    getRoot() {
        return this.rootNode;
    };

    setNodes(n) {
        this.nodes = n;
    };

    setLinks(l) {
        this.links = l;
    };

    computeMinimumSpanningTree() {
        // find root node;
        let rootCandidates = [];
        let propagateArray = [];
        this.nodes.forEach(node => {
            if (node.incommingLink.length === 0) {
                rootCandidates.push(node);
            }
        });

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
                children.forEach(child => {
                    if (child.rangeNode().getDepth() === -1) {
                        const nextDepth = currentRoot.getDepth() + 1;
                        if (nextDepth > this.maxDepth) {
                            this.maxDepth = nextDepth;
                        }
                        child.rangeNode().setDepth(currentRoot.getDepth() + 1);
                        propagateArray.push(child.rangeNode());
                    }
                });
                propagateArray.shift(); // removes the current element from array;
            }
        });
        return this.maxDepth;
    };
}// end of class definition
