import { uniqWith } from 'lodash';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatementsBundleBySubject, getStatementsByObject } from 'services/backend/statements';

const COLOR_NODE = '#80869B';
const COLOR_NODE_START = '#E86161';
const MAX_NODE_LABEL_LENGTH = 20;

const useGraphView = ({ resourceId }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [depth, setDepth] = useState(2);
    const [collapsed, setCollapsed] = useState([]);
    const [isLoadingStatements, setIsLoadingStatements] = useState(false);
    const graphRef = useRef(null);

    const formatNodeLabel = label => (label.length > MAX_NODE_LABEL_LENGTH ? `${label.substring(0, MAX_NODE_LABEL_LENGTH)}...` : label);

    const processStatements = ({ statements, isFetchingIncoming = false }) => {
        const _nodes = [];
        const _edges = [];

        for (const statement of statements) {
            const node = isFetchingIncoming ? statement.subject : statement.object;
            const objectLabel = formatNodeLabel(node.label);

            _nodes.push({
                id: node.id,
                label: objectLabel,
                fill: COLOR_NODE,
                data: {
                    ...node,
                    hasFetchedObjectStatements: statement.hasFetchedObjectStatements,
                    hasObjectStatements: statement.hasObjectStatements,
                },
            });

            _edges.push({
                id: statement.id,
                source: statement.subject.id,
                target: statement.object.id,
                label: statement.predicate.label,
            });
        }

        // _nodes = uniqBy(_nodes, 'id');
        // _edges = uniqBy(_edges, e => [e.source, e.target, e.label].join());

        return { nodes: _nodes, edges: _edges };
    };

    const addStatementsLevel = useCallback(({ subjectId, statements, level = 0, maxLevel }) => {
        const result = [];
        level += 1;
        for (const statement of statements) {
            if (statement.subject.id === subjectId) {
                let objectStatements = [];
                if (level <= maxLevel) {
                    objectStatements = addStatementsLevel({ subjectId: statement.object.id, statements, level, maxLevel });
                }
                result.push({
                    level,
                    hasObjectStatements: objectStatements.length > 0,
                    hasFetchedObjectStatements: level < maxLevel,
                    ...statement,
                });
                result.push(...objectStatements);
            }
        }
        return result;
    }, []);

    const fetchStatements = useCallback(
        async ({ nodeId, shouldAddSubject = false, depth: maxLevel = depth, resetNodes = false }) => {
            const bundle = await getStatementsBundleBySubject({ id: nodeId, maxLevel: parseInt(maxLevel, 10) + 1 });
            const statements = addStatementsLevel({ subjectId: nodeId, statements: bundle.statements, maxLevel }).filter(
                statement => statement.level <= maxLevel,
            );

            const result = processStatements({ statements });

            setNodes(_nodes =>
                uniqBy(
                    [
                        ...(shouldAddSubject
                            ? [
                                  {
                                      id: statements[0].subject.id,
                                      label: formatNodeLabel(statements[0].subject.label),
                                      fill: COLOR_NODE_START,
                                      data: {
                                          ...statements[0].subject,
                                          hasFetchedObjectStatements: true,
                                          hasObjectStatements: true,
                                      },
                                  },
                              ]
                            : []),
                        ...(!resetNodes
                            ? _nodes.map(node => ({
                                  ...node,
                                  data: {
                                      ...node.data,
                                      hasFetchedObjectStatements: node.id === nodeId ? true : node.data.hasFetchedObjectStatements,
                                  },
                              }))
                            : []),
                        ...result.nodes,
                    ],
                    'id',
                ),
            );

            setEdges(_edges =>
                uniqWith(
                    [...(!resetNodes ? _edges : []), ...result.edges],
                    (edgeA, edgeB) => edgeA.source === edgeB.source && edgeA.target === edgeB.target,
                ),
            );
            return result;
        },
        [addStatementsLevel, depth],
    );

    const fetchIncomingStatements = async nodeId => {
        const statements = await getStatementsByObject({ id: nodeId, returnContent: true });
        const result = processStatements({ statements, isFetchingIncoming: true });
        setNodes(uniqBy([...nodes, ...result.nodes], 'id'));
        setEdges(uniqWith([...edges, ...result.edges], (edgeA, edgeB) => edgeA.source === edgeB.source && edgeA.target === edgeB.target));
    };

    const toggleExpandNode = async nodeId => {
        const resource = nodes.find(node => node.id === nodeId);

        if (!resource.data.hasObjectStatements) {
            return;
        }

        if (!resource.data.hasFetchedObjectStatements) {
            const fetchedData = await fetchStatements({ nodeId, depth: 1 });
            setTimeout(() => graphRef.current?.centerGraph([nodeId, ...fetchedData.nodes.map(node => node.id)]), 500);
        } else if (collapsed.includes(nodeId)) {
            setCollapsed(collapsed.filter(n => n !== nodeId));
        } else if (!collapsed.includes(nodeId)) {
            setCollapsed([...collapsed, nodeId]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // only show loading indicator on initial load
            if (nodes.length === 0) {
                setIsLoadingStatements(true);
            }
            console.log('fetch');
            await fetchStatements({ nodeId: resourceId, shouldAddSubject: true, resetNodes: true });
            setCollapsed([]);
            setIsLoadingStatements(false);
        };
        fetchData();
    }, [depth, resourceId, fetchStatements]);

    useEffect(() => {
        setCollapsed(collapsed);
    }, [collapsed]);

    return {
        nodes,
        edges,
        setDepth,
        depth,
        fetchIncomingStatements,
        isLoadingStatements,
        collapsed,
        setCollapsed,
        graphRef,
        toggleExpandNode,
    };
};

export default useGraphView;
