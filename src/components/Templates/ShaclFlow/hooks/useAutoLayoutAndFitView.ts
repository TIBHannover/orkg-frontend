import { getIncomers, Position, ReactFlowState, useNodesInitialized, useReactFlow, useStore } from '@xyflow/react';
import { type Node } from '@xyflow/react';
import { stratify, tree } from 'd3-hierarchy';
import { useEffect, useState } from 'react';

const positionMap = {
    T: Position.Top,
    L: Position.Left,
    R: Position.Right,
    B: Position.Bottom,
};

// D3 Hierarchy doesn't support layouting in different directions, but we can
// swap the coordinates around in different ways to get the same effect.
const getPosition = (x: number, y: number, direction: 'TB' | 'LR' | 'BT' | 'RL') => {
    switch (direction) {
        case 'TB':
            return { x, y };
        case 'LR':
            return { x: y, y: x };
        case 'BT':
            return { x: -x, y: -y };
        case 'RL':
            return { x: -y, y: x };
        default:
            return { x, y };
    }
};

export type NodeWithPosition = Node & { x?: number; y?: number };

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree<NodeWithPosition>()
    // the node size configures the spacing between the nodes ([width, height])
    .nodeSize([350, 550])
    // this is needed for creating equal space between all nodes
    .separation(() => 1);

const nodesLengthSelector = (state: ReactFlowState) => state.nodes.length || 0;

// D3 Hierarchy expects a single root node in a flow. Because we can't always
// guarantee that, we create a fake root node here and will make sure any real
// nodes without an incoming edge will get connected to this fake root node.
const rootNode = {
    id: 'd3-hierarchy-root',
    x: 0,
    y: 0,
    position: { x: 0, y: 0 },
    data: {},
    hidden: true,
};

function useAutoLayoutAndFitView(options: { direction: 'LR' | 'RL' | 'BT' }) {
    const { setNodes, setEdges } = useReactFlow();
    const nodesInitialized = useNodesInitialized();
    const { direction } = options;
    const [shouldFitView, setShouldFitView] = useState(false);
    const nodeCount = useStore(nodesLengthSelector);
    const { getNodes, getEdges, fitView } = useReactFlow();

    useEffect(() => {
        // only run the layout if there are nodes and they have been initialized with their dimensions
        if (!nodeCount || !nodesInitialized) {
            return;
        }

        const nodes = getNodes();
        const edges = getEdges();

        const getParentId = (node: Node) => {
            if (node.id === rootNode.id) {
                return undefined;
            }

            const incomers = getIncomers(node, nodes, edges);

            // If there are no incoming edges, we say this node is connected to the fake
            // root node to prevent having multiple root nodes in the layout. If there
            // are multiple incoming edges, only the first one will be used!
            return incomers[0]?.id || rootNode.id;
        };

        let hierarchy;
        try {
            hierarchy = stratify<NodeWithPosition>()
                .id((d) => d.id)
                .parentId(getParentId)([rootNode, ...nodes]);
        } catch {
            hierarchy = null;
        }
        if (!hierarchy) {
            return;
        }
        // run the layout algorithm with the hierarchy data structure
        const root = layout(hierarchy);

        // set the React Flow nodes with the positions from the layout
        setNodes((_nodes) =>
            _nodes.map((node) => {
                // find the node in the hierarchy with the same id and get its coordinates
                const { x, y } = root.find((d) => d.id === node.id) || { x: node.position.x, y: node.position.y };

                return {
                    ...node,
                    sourcePosition: positionMap[direction[1] as keyof typeof positionMap],
                    targetPosition: positionMap[direction[0] as keyof typeof positionMap],
                    position: getPosition(x, y, direction),
                    style: { ...node.style, opacity: 1 },
                };
            }),
        );

        setEdges((_edges) => _edges.map((edge) => ({ ...edge, style: { opacity: 1, strokeWidth: 3 } })));
        setShouldFitView(true);
    }, [nodeCount, nodesInitialized, getNodes, getEdges, setNodes, setEdges, fitView, direction]);

    useEffect(() => {
        if (shouldFitView && fitView) {
            fitView();
            setShouldFitView(false);
        }
    }, [shouldFitView, fitView]);
}

export default useAutoLayoutAndFitView;
