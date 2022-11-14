import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useContextMenu } from 'react-contexify';
import { DIAGRAM_CONTEXT_MENU_ID } from 'constants/misc';
import { applyEdgeChanges, applyNodeChanges, addEdge } from 'reactflow';
import { guid, asyncLocalStorage } from 'utils';
import Confirm from 'components/Confirmation/Confirmation';
import { getResourceData } from 'services/similarity/index';
import { getResource } from 'services/backend/resources';
import CustomNode from 'components/DiagramEditor/CustomNode';
import CustomGroup from 'components/DiagramEditor/CustomGroup';
import CustomEdge from 'components/DiagramEditor/CustomEdge';

function useDiagramEditor({ id }) {
    const { show } = useContextMenu({
        id: DIAGRAM_CONTEXT_MENU_ID,
    });

    const [currentMenu, setCurrentMenu] = useState(null);
    const [currentNode, setCurrentNode] = useState(null);
    const [currentEdge, setCurrentEdge] = useState(null);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(!id);

    const [diagram, setDiagram] = useState();
    const [diagramResource, setDiagramResource] = useState(null);

    const diagramRef = useRef(null);
    const [isEditNodeModalOpen, setIsEditNodeModalOpen] = useState(false);
    const [isEditEdgeModalOpen, setIsEditEdgeModalOpen] = useState(false);
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [isExportDiagramModalOpen, setIsExportDiagramModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const [isDataLoadedFromLocalStorage, setIsDataLoadedFromLocalStorage] = useState(false);
    const [isSaveDiagramModalOpen, setIsSaveDiagramModalOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), [setEdges]);
    const onConnect = useCallback(connection => {
        setCurrentEdge(connection);
        setIsEditEdgeModalOpen(true);
    }, []);

    const handlePaneContextMenu = event => {
        event.preventDefault();
        setCurrentMenu('pane');
        show({
            event,
            props: {
                key: 'pane',
                event,
            },
        });
    };

    const handleNodeContextMenu = (event, node) => {
        event.preventDefault();
        setCurrentMenu(node.type ?? 'node');

        show({
            event,
            props: {
                key: 'node',
                event,
                node,
            },
        });
    };

    const handleEdgeContextMenu = (event, edge) => {
        event.preventDefault();
        setCurrentMenu('edge');
        show({
            event,
            props: {
                key: 'edge',
                event,
                edge,
            },
        });
    };

    const onSelectionContextMenu = useCallback(
        (event, nodes) => {
            if (nodes.length > 1) {
                event.preventDefault();
                setCurrentMenu('selection');
                show({
                    event,
                    props: {
                        key: 'selection',
                        event,
                        nodes,
                    },
                });
            }
        },
        [show],
    );

    const handleAddGroup = useCallback(event => {
        setCurrentGroup({ event: event.props.event, nodes: event.props.nodes });
        setIsEditGroupModalOpen(v => !v);
    }, []);

    const addGroup = useCallback(
        value => {
            const group = {
                id: guid(),
                type: 'group',
                data: { label: value },
                position: { x: currentGroup.event.target.offsetLeft - 20, y: currentGroup.event.target.offsetTop - 40 },
                style: {
                    width: currentGroup.event.target.clientWidth + 40,
                    height: currentGroup.event.target.clientHeight + 60,
                },
            };

            setNodes(prevNodes => [
                group,
                ...prevNodes.map(node => {
                    const child = node;
                    if (currentGroup.nodes.map(sn => sn.id).includes(node.id)) {
                        // it's important that you create a new object here
                        // in order to notify react flow about the change
                        child.parentNode = group.id;
                        child.extent = 'parent';
                        child.position = {
                            x: node.position.x - currentGroup.event.target.offsetLeft + 20,
                            y: node.position.y - currentGroup.event.target.offsetTop + 40,
                        };
                    }

                    return child;
                }),
            ]);
            setIsEditGroupModalOpen(false);
        },
        [currentGroup],
    );

    const handleAddNode = useCallback(
        event => {
            const bounds = diagramRef.current.getBoundingClientRect();
            // Compute mouse coords relative to canvas
            const clientX = event.props.event.clientX - bounds.left;
            const clientY = event.props.event.clientY - bounds.top;
            setPosition(reactFlowInstance.project({ x: clientX, y: clientY }));
            setCurrentNode(null);
            setIsEditNodeModalOpen(v => !v);
        },
        [reactFlowInstance],
    );

    const handleEditNode = useCallback(event => {
        setCurrentNode(event.props.node);
        setIsEditNodeModalOpen(v => !v);
    }, []);

    const handleEditGroup = useCallback(event => {
        setCurrentGroup(event.props.node);
        setIsEditGroupModalOpen(v => !v);
    }, []);

    const handleEditEdge = useCallback(event => {
        setCurrentEdge(event.props.edge);
        setIsEditEdgeModalOpen(v => !v);
    }, []);

    const handleDeleteNode = useCallback(async event => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: (
                <>
                    Are you sure you want to delete this {event.props.node.type === 'node' ? 'node' : 'group'}?
                    <br />
                    <small>
                        <i>- {event.props.node.data.label}</i>
                    </small>
                </>
            ),
        });

        if (confirm) {
            // remove and un-plug childs
            setNodes(nds =>
                nds
                    .filter(n => n.id !== event.props.node.id)
                    .map(n => {
                        if (n.parentNode === event.props.node.id) {
                            n.parentNode = undefined;
                            n.extent = undefined;
                            n.position = { x: n.position.x + event.props.node.position.x, y: n.position.y + event.props.node.position.y };
                        }
                        return n;
                    }),
            );
        }
    }, []);

    const handleDeleteEdge = useCallback(
        async event => {
            const confirm = await Confirm({
                title: 'Are you sure?',
                message: (
                    <>
                        Are you sure you want to delete this edge?
                        <br />
                        between:
                        <br />
                        <small>
                            <i>- {nodes.find(n => n.id === event.props.edge.source)?.data.label}</i>
                        </small>
                        <br />
                        and:
                        <br />
                        <small>
                            <i>- {nodes.find(n => n.id === event.props.edge.target)?.data.label}</i>
                        </small>
                    </>
                ),
            });

            if (confirm) {
                setEdges(nds => nds.filter(n => n.id !== event.props.edge.id));
            }
        },
        [nodes],
    );

    const handleResetDiagram = useCallback(async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: <>Are you sure you want to clear this diagram?</>,
        });

        if (confirm) {
            asyncLocalStorage.removeItem('diagram');
            setNodes([]);
            setEdges([]);
            setIsDataLoadedFromLocalStorage(false);
        }
    }, []);

    const addNode = useCallback(
        value => {
            const node = {
                id: guid(),
                data: { label: value.value, ...value },
                position,
            };
            setNodes(prevNodes => [...prevNodes, node]);
            setIsEditNodeModalOpen(false);
        },
        [position],
    );

    const handleAddEdge = useCallback(
        value => {
            const edge = {
                ...currentEdge,
                ...(value ? { label: value.value, data: { label: value.value, ...value } } : {}),
                labelStyle: { fontSize: '14px' },
            };
            setEdges(eds => addEdge(edge, eds));
            setIsEditEdgeModalOpen(false);
        },
        [currentEdge],
    );

    const saveNode = useCallback(
        value => {
            setNodes(prevNodes =>
                prevNodes.map(node => {
                    if (node.id === currentNode.id) {
                        // it's important that you create a new object here
                        // in order to notify react flow about the change
                        node.data = {
                            ...value,
                        };
                    }

                    return node;
                }),
            );
            setIsEditNodeModalOpen(false);
        },
        [currentNode?.id],
    );

    const saveGroup = useCallback(
        value => {
            setNodes(prevNodes =>
                prevNodes.map(node => {
                    if (node.id === currentGroup.id) {
                        // it's important that you create a new object here
                        // in order to notify react flow about the change
                        node.data = {
                            label: value,
                        };
                    }

                    return node;
                }),
            );
            setIsEditGroupModalOpen(false);
        },
        [currentGroup?.id],
    );

    const saveEdge = useCallback(
        value => {
            setEdges(prevEdges =>
                prevEdges.map(edge => {
                    if (edge.id === currentEdge.id) {
                        // it's important that you create a new object here
                        // in order to notify react flow about the change
                        edge.data = {
                            ...value,
                        };
                    }
                    return edge;
                }),
            );
            setIsEditEdgeModalOpen(false);
        },
        [currentEdge?.id],
    );

    const handleSave = useCallback(() => {
        setIsSaveDiagramModalOpen(v => !v);
    }, []);

    const handleStopEdit = useCallback(async () => {
        if (!editMode) {
            setEditMode(v => !v);
        } else {
            const confirm = await Confirm({
                title: 'Are you sure?',
                message: <>Are you sure you want to clear all changes?</>,
            });

            if (confirm) {
                setNodes(diagram.nodes);
                setEdges(diagram.edges);
                setEditMode(v => !v);
            }
        }
    }, [diagram?.edges, diagram?.nodes, editMode]);

    useEffect(() => {
        if (id) {
            setIsDataLoadedFromLocalStorage(false);
            getResourceData(id).then(res => {
                setDiagram(res.data);
                setNodes(res.data.nodes);
                setEdges(res.data.edges);
            });
            getResource(id).then(res => {
                setDiagramResource(res);
            });
        }
        setEditMode(!id);
    }, [id]);

    const nodeTypes = useMemo(() => ({ default: CustomNode, group: CustomGroup }), []);
    const edgeTypes = useMemo(() => ({ default: CustomEdge /* SmoothStepEdge */ }), []);

    useEffect(() => {
        if (nodes?.length > 0 && !id) {
            asyncLocalStorage.setItem('diagram', JSON.stringify(reactFlowInstance?.toObject()));
        }
    }, [nodes, edges, reactFlowInstance, id]);

    useEffect(() => {
        const loadLocalData = async () => {
            const data = await asyncLocalStorage.getItem('diagram');
            const localDiagram = await JSON.parse(data);
            if (!id && localDiagram && localDiagram.nodes.length > 0) {
                setNodes(localDiagram.nodes);
                setEdges(localDiagram.edges);
                setIsDataLoadedFromLocalStorage(true);
            } else {
                setIsDataLoadedFromLocalStorage(false);
            }
        };
        loadLocalData();
    }, [id]);

    return {
        diagramRef,
        reactFlowInstance,
        diagram,
        nodes,
        edges,
        diagramResource,
        editMode,
        nodeTypes,
        edgeTypes,
        currentNode,
        currentGroup,
        currentEdge,
        currentMenu,
        handleStopEdit,
        handleSave,
        handleResetDiagram,
        handlePaneContextMenu,
        handleNodeContextMenu,
        handleEdgeContextMenu,
        onSelectionContextMenu,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setReactFlowInstance,
        handleAddNode,
        handleEditNode,
        handleDeleteNode,
        handleEditEdge,
        handleDeleteEdge,
        handleAddGroup,
        handleEditGroup,
        addNode,
        saveNode,
        addGroup,
        saveEdge,
        handleAddEdge,
        saveGroup,
        menuOpen,
        setMenuOpen,
        isDataLoadedFromLocalStorage,
        setIsEditNodeModalOpen,
        setIsEditGroupModalOpen,
        setIsEditEdgeModalOpen,
        setIsSaveDiagramModalOpen,
        setIsExportDiagramModalOpen,
        setIsHelpModalOpen,
        isEditNodeModalOpen,
        isEditGroupModalOpen,
        isEditEdgeModalOpen,
        isSaveDiagramModalOpen,
        isExportDiagramModalOpen,
        isHelpModalOpen,
    };
}
export default useDiagramEditor;
