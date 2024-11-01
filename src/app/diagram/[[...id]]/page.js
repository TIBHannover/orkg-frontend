'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import useParams from 'components/useParams/useParams';
import { Controls, MarkerType, MiniMap } from 'reactflow';
import { Container, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert } from 'reactstrap';
import ContextMenu from 'components/DiagramEditor/ContextMenu';
import EditNode from 'components/DiagramEditor/EditNode';
import EditEdge from 'components/DiagramEditor/EditEdge';
import EditGroup from 'components/DiagramEditor/EditGroup';
import SaveDiagram from 'components/DiagramEditor/SaveDiagram';
import ExportDiagram from 'components/DiagramEditor/ExportDiagram';
import HelpModal from 'components/DiagramEditor/HelpModal';
import TitleBar from 'components/TitleBar/TitleBar';
import StyledReactFlow from 'components/DiagramEditor/styled';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPen, faSave, faRefresh, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import Tippy from '@tippyjs/react';
import useDiagramEditor from 'components/DiagramEditor/hooks/useDiagramEditor';

function Diagram() {
    const { id } = useParams();

    const {
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
    } = useDiagramEditor({ id });

    useEffect(() => {
        document.title = `${id ? '' : 'Create '}Diagram ${diagramResource?.label ?? ''}`;
    }, [id, diagramResource]);

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        {id && (
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                color={!editMode ? 'secondary' : 'secondary-darker'}
                                className="float-end"
                                onClick={() => (id ? handleStopEdit() : handleSave())}
                                disabled={nodes.length === 0}
                            >
                                {!editMode ? (
                                    <>
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </>
                                )}
                            </RequireAuthentication>
                        )}
                        {((id && editMode) || !id) && (
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                color="secondary"
                                className="float-end"
                                onClick={() => handleSave()}
                                disabled={nodes.length === 0}
                                style={{ marginLeft: 1 }}
                            >
                                <>
                                    <FontAwesomeIcon icon={faSave} /> Save
                                </>
                            </RequireAuthentication>
                        )}
                        {!id && nodes.length > 0 && (
                            <Button style={{ marginLeft: 2 }} size="sm" onClick={handleResetDiagram}>
                                <FontAwesomeIcon icon={faRefresh} /> Reset
                            </Button>
                        )}
                        {id && (
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem onClick={() => setIsExportDiagramModalOpen(true)}>Export diagram</DropdownItem>
                                    <DropdownItem tag={Link} end href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        )}
                    </>
                }
            >
                Diagram{diagram ? `: ${diagramResource?.label}` : ''}{' '}
                {editMode && (
                    <Tippy content="Open help modal">
                        <span className="ml-3">
                            <Button color="link" size="sm" className="p-0 m-0" style={{ fontSize: '22px' }} onClick={() => setIsHelpModalOpen(true)}>
                                <span className="text-primary">
                                    <FontAwesomeIcon icon={faQuestionCircle} />
                                </span>
                            </Button>
                        </span>
                    </Tippy>
                )}
            </TitleBar>
            {isDataLoadedFromLocalStorage && (
                <Container className="p-0">
                    <Alert color="light-darker">
                        This diagram is loaded from your browser storage. If you want to remove it, click <i>Reset</i>.
                    </Alert>
                </Container>
            )}
            <Container className="p-2 box rounded" style={{ width: '100%', height: '800px' }}>
                <StyledReactFlow
                    onPaneContextMenu={editMode ? handlePaneContextMenu : null}
                    onNodeContextMenu={editMode ? handleNodeContextMenu : null}
                    onEdgeContextMenu={editMode ? handleEdgeContextMenu : null}
                    onSelectionContextMenu={editMode ? onSelectionContextMenu : null}
                    nodesConnectable={editMode}
                    nodesDraggable={editMode}
                    nodes={nodes}
                    edges={edges.map((edge) => ({ ...edge, markerEnd: { type: MarkerType.Arrow } }))}
                    onNodesChange={editMode ? onNodesChange : null}
                    onEdgesChange={editMode ? onEdgesChange : null}
                    onConnect={editMode ? onConnect : null}
                    onInit={(inst) => setReactFlowInstance(inst)}
                    ref={diagramRef}
                    connectionLineStyle={{ strokeWidth: 5 }}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                >
                    <ContextMenu
                        currentMenu={currentMenu}
                        actions={[
                            { label: 'Add node', effect: handleAddNode, menu: ['pane'] },
                            { label: 'Edit node', effect: handleEditNode, menu: ['node'] },
                            { label: 'Delete node', effect: handleDeleteNode, menu: ['node'] },
                            { label: 'Edit edge', effect: handleEditEdge, menu: ['edge'] },
                            { label: 'Delete edge', effect: handleDeleteEdge, menu: ['edge'] },
                            { label: 'Create group', effect: handleAddGroup, menu: ['selection'] },
                            { label: 'Edit group', effect: handleEditGroup, menu: ['group'] },
                            { label: 'Delete group', effect: handleDeleteNode, menu: ['group'] },
                        ]}
                    />
                    <Controls showInteractive={false} />
                    <MiniMap />
                </StyledReactFlow>
                <EditNode
                    node={currentNode}
                    addNode={addNode}
                    saveNode={saveNode}
                    isEditNodeModalOpen={isEditNodeModalOpen}
                    setIsEditNodeModalOpen={() => setIsEditNodeModalOpen((v) => !v)}
                />

                <EditGroup
                    currentGroup={currentGroup}
                    addGroup={addGroup}
                    saveGroup={saveGroup}
                    isEditGroupModalOpen={isEditGroupModalOpen}
                    setIsEditGroupModalOpen={() => setIsEditGroupModalOpen((v) => !v)}
                />
                <EditEdge
                    edge={currentEdge}
                    addEdge={handleAddEdge}
                    saveEdge={saveEdge}
                    isEditEdgeModalOpen={isEditEdgeModalOpen}
                    setIsEditEdgeModalOpen={() => setIsEditEdgeModalOpen((v) => !v)}
                />
                <SaveDiagram
                    diagram={reactFlowInstance?.toObject() ?? {}}
                    diagramResource={diagramResource}
                    isSaveDiagramModalOpen={isSaveDiagramModalOpen}
                    setIsSaveDiagramModalOpen={() => setIsSaveDiagramModalOpen((v) => !v)}
                />
                <ExportDiagram
                    diagramResource={diagramResource}
                    diagram={reactFlowInstance?.toObject() ?? {}}
                    isExportDiagramModalOpen={isExportDiagramModalOpen}
                    setIsExportDiagramModalOpen={() => setIsExportDiagramModalOpen((v) => !v)}
                />
                <HelpModal isHelpModalOpen={isHelpModalOpen} setIsHelpModalOpen={() => setIsHelpModalOpen((v) => !v)} />
            </Container>
        </>
    );
}

export default Diagram;
