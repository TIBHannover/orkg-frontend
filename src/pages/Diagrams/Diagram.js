import { useState, useCallback, useRef, useEffect } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, Controls, addEdge } from 'react-flow-renderer';
import { Container, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useContextMenu } from 'react-contexify';
import ContextMenu from 'components/DiagramEditor/ContextMenu';
import { DIAGRAM_CONTEXT_MENU_ID } from 'constants/misc';
import AddNode from 'components/DiagramEditor/AddNode';
import SaveDiagram from 'components/DiagramEditor/SaveDiagram';
import TitleBar from 'components/TitleBar/TitleBar';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPen, faSave } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { getResourceData } from 'services/similarity/index';

function Diagram(props) {
    const location = useLocation();
    const { id } = useParams();
    const { show } = useContextMenu({
        id: DIAGRAM_CONTEXT_MENU_ID,
    });

    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [diagram, setDiagram] = useState();

    const diagramRef = useRef(null);
    const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
    const [isSaveDiagramModalOpen, setIsSaveDiagramModalOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), [setEdges]);
    const onConnect = useCallback(connection => setEdges(eds => addEdge(connection, eds)), [setEdges]);

    useEffect(() => {
        if (id) {
            getResourceData(id).then(res => {
                setDiagram(res.data);
                setNodes(res.data.nodes);
                setEdges(res.data.edges);
            });
        }
    }, [id]);

    const handleContextMenu = event => {
        event.preventDefault();
        show(event, {
            props: {
                key: 'value',
                event,
            },
        });
    };

    const handleAddNode = useCallback(event => {
        const bounds = diagramRef.current.getBoundingClientRect();
        // Compute mouse coords relative to canvas
        const clientX = event.props.event.clientX - bounds.left;
        const clientY = event.props.event.clientY - bounds.top;
        setPosition({ x: clientX, y: clientY });
        setIsAddNodeModalOpen(v => !v);
    }, []);

    const addNode = useCallback(
        value => {
            const node = {
                id: value.id,
                data: { label: value.value, ...value },
                position,
            };
            setNodes(prevNodes => [...prevNodes, node]);
            setIsAddNodeModalOpen(false);
        },
        [position],
    );

    const handleSave = useCallback(() => {
        setIsSaveDiagramModalOpen(v => !v);
    }, []);

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        <RequireAuthentication
                            component={Button}
                            size="sm"
                            color="secondary"
                            className="float-end"
                            onClick={() => (id ? setEditMode(v => !v) : handleSave())}
                        >
                            {id ? (
                                <>
                                    <Icon icon={faPen} /> Edit
                                </>
                            ) : (
                                <>
                                    <Icon icon={faSave} /> Save
                                </>
                            )}
                        </RequireAuthentication>
                        {id && (
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem tag={NavLink} end to={reverse(ROUTES.RESOURCE, { id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        )}
                    </>
                }
            >
                Diagram
            </TitleBar>
            <Container className="p-2 box rounded" style={{ width: '100%', height: '500px' }}>
                <ReactFlow
                    onPaneContextMenu={handleContextMenu}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={inst => setReactFlowInstance(inst)}
                    ref={diagramRef}
                >
                    <ContextMenu actions={[{ label: 'Add node', effect: handleAddNode }]} />
                    <Controls />
                </ReactFlow>
                <AddNode addNode={addNode} isAddNodeModalOpen={isAddNodeModalOpen} setIsAddNodeModalOpen={() => setIsAddNodeModalOpen(v => !v)} />
                <SaveDiagram
                    diagram={reactFlowInstance?.toObject() ?? {}}
                    isSaveDiagramModalOpen={isSaveDiagramModalOpen}
                    setIsSaveDiagramModalOpen={() => setIsSaveDiagramModalOpen(v => !v)}
                />
            </Container>
        </>
    );
}

export default Diagram;
