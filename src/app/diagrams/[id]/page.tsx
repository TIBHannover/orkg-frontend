'use client';

import { faEllipsisV, faPen, faQuestionCircle, faRefresh, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Dropdown, Tooltip } from '@heroui/react';
import { Controls, MarkerType, MiniMap } from '@xyflow/react';
import { useEffect } from 'react';

import ContextMenu from '@/components/DiagramEditor/ContextMenu';
import EditEdge from '@/components/DiagramEditor/EditEdge';
import EditGroup from '@/components/DiagramEditor/EditGroup';
import EditNode from '@/components/DiagramEditor/EditNode';
import ExportDiagram from '@/components/DiagramEditor/ExportDiagram';
import HelpModal from '@/components/DiagramEditor/HelpModal';
import useDiagramEditor from '@/components/DiagramEditor/hooks/useDiagramEditor';
import SaveDiagram from '@/components/DiagramEditor/SaveDiagram';
import StyledReactFlow from '@/components/DiagramEditor/styled';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const Diagram = () => {
    const { id } = useParams<{ id: string }>();

    // useDiagramEditor is still legacy JS; TypeScript infers `null`-only state and
    // collides with the strict ReactFlow types. Cast once here until the hook is migrated.
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
    } = useDiagramEditor({ id }) as any;

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
                                className="button--orkg-secondary"
                                onPress={() => (id ? handleStopEdit() : handleSave())}
                                isDisabled={nodes.length === 0}
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
                                className="button--orkg-secondary"
                                onPress={() => handleSave()}
                                isDisabled={nodes.length === 0}
                            >
                                <FontAwesomeIcon icon={faSave} /> Save
                            </RequireAuthentication>
                        )}
                        {!id && nodes.length > 0 && (
                            <Button size="sm" className="button--orkg-secondary" onPress={handleResetDiagram}>
                                <FontAwesomeIcon icon={faRefresh} /> Reset
                            </Button>
                        )}
                        {id && (
                            <Dropdown>
                                <Button size="sm" isIconOnly aria-label="More options" className="button--orkg-secondary">
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </Button>
                                <Dropdown.Popover placement="bottom end">
                                    <Dropdown.Menu>
                                        <Dropdown.Item onAction={() => setIsExportDiagramModalOpen(true)} textValue="Export diagram">
                                            Export diagram
                                        </Dropdown.Item>
                                        <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`} textValue="View resource">
                                            View resource
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                        )}
                    </>
                }
            >
                <span className="inline-flex items-center gap-2 align-middle">
                    <span>Diagram{diagram ? `: ${diagramResource?.label}` : ''}</span>
                    {editMode && (
                        <Tooltip delay={300}>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconOnly
                                aria-label="Open help modal"
                                className="text-accent"
                                onPress={() => setIsHelpModalOpen(true)}
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} />
                            </Button>
                            <Tooltip.Content>Open help modal</Tooltip.Content>
                        </Tooltip>
                    )}
                </span>
            </TitleBar>
            {isDataLoadedFromLocalStorage && (
                <Container>
                    <Alert status="accent">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>
                                This diagram is loaded from your browser storage. If you want to remove it, click <i>Reset</i>.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                </Container>
            )}
            <Container>
                <div className="p-2 box rounded" style={{ width: '100%', height: '800px' }}>
                    <StyledReactFlow
                        onPaneContextMenu={editMode ? handlePaneContextMenu : undefined}
                        onNodeContextMenu={editMode ? handleNodeContextMenu : undefined}
                        onEdgeContextMenu={editMode ? handleEdgeContextMenu : undefined}
                        onSelectionContextMenu={editMode ? onSelectionContextMenu : undefined}
                        nodesConnectable={editMode}
                        nodesDraggable={editMode}
                        nodes={nodes}
                        edges={edges.map((edge: any) => ({ ...edge, markerEnd: { type: MarkerType.Arrow } }))}
                        onNodesChange={editMode ? onNodesChange : undefined}
                        onEdgesChange={editMode ? onEdgesChange : undefined}
                        onConnect={editMode ? onConnect : undefined}
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
                        setIsEditNodeModalOpen={() => setIsEditNodeModalOpen((v: boolean) => !v)}
                    />
                    <EditGroup
                        currentGroup={currentGroup}
                        addGroup={addGroup}
                        saveGroup={saveGroup}
                        isEditGroupModalOpen={isEditGroupModalOpen}
                        setIsEditGroupModalOpen={() => setIsEditGroupModalOpen((v: boolean) => !v)}
                    />
                    <EditEdge
                        edge={currentEdge}
                        addEdge={handleAddEdge}
                        saveEdge={saveEdge}
                        isEditEdgeModalOpen={isEditEdgeModalOpen}
                        setIsEditEdgeModalOpen={() => setIsEditEdgeModalOpen((v: boolean) => !v)}
                    />
                    <SaveDiagram
                        diagram={reactFlowInstance?.toObject() ?? {}}
                        diagramResource={diagramResource}
                        isSaveDiagramModalOpen={isSaveDiagramModalOpen}
                        setIsSaveDiagramModalOpen={() => setIsSaveDiagramModalOpen((v: boolean) => !v)}
                    />
                    <ExportDiagram
                        diagramResource={diagramResource}
                        diagram={reactFlowInstance?.toObject() ?? {}}
                        isExportDiagramModalOpen={isExportDiagramModalOpen}
                        setIsExportDiagramModalOpen={() => setIsExportDiagramModalOpen((v: boolean) => !v)}
                    />
                    <HelpModal isHelpModalOpen={isHelpModalOpen} setIsHelpModalOpen={() => setIsHelpModalOpen((v: boolean) => !v)} />
                </div>
            </Container>
        </>
    );
};

export default Diagram;
