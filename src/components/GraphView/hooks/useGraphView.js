import { uniqWith } from 'lodash';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject, getStatementsByObject } from 'services/backend/statements';

const COLOR_NODE = '#80869B';
const COLOR_NODE_START = '#E86161';
const MAX_NODE_LABEL_LENGTH = 20;

const useGraphView = ({ resourceId }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [depth, setDepth] = useState(2);
    const [collapsed, setCollapsed] = useState([]);
    const [isLoadingStatements, setIsLoadingStatements] = useState(true);
    const graphRef = useRef(null);

    const formatNodeLabel = label => (label.length > MAX_NODE_LABEL_LENGTH ? `${label.substring(0, MAX_NODE_LABEL_LENGTH)}...` : label);

    const setIsLoadingNode = ({ nodeId, isLoading }) => {
        setNodes(_nodes =>
            _nodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isLoading: node.id === nodeId ? isLoading : node.data.isLoading,
                },
            })),
        );
    };

    const checkIsLoadingNode = id => !!nodes.find(node => node.id === id).data.isLoading;

    const processStatements = useCallback(({ statements, isFetchingIncoming = false }) => {
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

        return { nodes: _nodes, edges: _edges };
    }, []);

    const addStatementsLevel = useCallback(({ subjectId, statements, level: currentLevel = 0, maxLevel }) => {
        const result = [];
        const level = currentLevel + 1;
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
            setIsLoadingNode({ nodeId, isLoading: true });
            const bundle = await getStatementsBundleBySubject({ id: nodeId, maxLevel: parseInt(maxLevel, 10) + 1 });
            const statements = addStatementsLevel({ subjectId: nodeId, statements: bundle.statements, maxLevel }).filter(
                statement => statement.level <= maxLevel,
            );

            // if no statements found, just fetch the single subject resource then
            const subjectNode = statements.length > 0 ? statements[0].subject : await getResource(nodeId);
            const result = processStatements({ statements });

            setNodes(_nodes =>
                uniqBy(
                    [
                        ...(shouldAddSubject
                            ? [
                                  {
                                      id: subjectNode.id,
                                      label: formatNodeLabel(subjectNode.label),
                                      fill: COLOR_NODE_START,
                                      data: {
                                          ...subjectNode,
                                          hasFetchedObjectStatements: true,
                                          hasObjectStatements: statements.length > 0,
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
                                      isLoading: false,
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
        [addStatementsLevel, depth, processStatements],
    );

    const fetchIncomingStatements = async nodeId => {
        if (checkIsLoadingNode(nodeId)) {
            return;
        }

        setIsLoadingNode({ nodeId, isLoading: true });

        const statements = await getStatementsByObject({ id: nodeId, returnContent: true });
        const result = processStatements({ statements, isFetchingIncoming: true });
        setNodes(uniqBy([...nodes, ...result.nodes], 'id'));
        setIsLoadingNode({ nodeId, isLoading: false });

        setEdges(uniqWith([...edges, ...result.edges], (edgeA, edgeB) => edgeA.source === edgeB.source && edgeA.target === edgeB.target));
    };

    const toggleExpandNode = async nodeId => {
        if (checkIsLoadingNode(nodeId)) {
            return;
        }
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
