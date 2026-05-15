import '@xyflow/react/dist/style.css';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Tooltip } from '@heroui/react';
import {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    NodeChange,
    ReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import useColorMode from '@/components/hooks/useColorMode';
import DownloadButton from '@/components/Templates/ShaclFlow/DownloadImage/DownloadButton';
import CustomEdge from '@/components/Templates/ShaclFlow/Edge/CustomEdge';
import useAutoLayout, { NodeWithPosition } from '@/components/Templates/ShaclFlow/hooks/useAutoLayoutAndFitView';
import useExportSHACL from '@/components/Templates/ShaclFlow/hooks/useExportSHACL';
import Node from '@/components/Templates/ShaclFlow/Node/Node';
import { CLASSES } from '@/constants/graphSettings';
import { loadTemplateFlowByID } from '@/services/backend/statements';
import { PropertyShapeResourceType } from '@/services/backend/types';
import { setDiagramMode, setTemplateFlow } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';
import { convertTreeToFlat } from '@/utils';

const ShaclFlowModal = () => {
    useAutoLayout({ direction: 'LR' });
    const colorMode = useColorMode();
    const dispatch = useDispatch();
    const diagramMode = useSelector((state: RootStore) => state.templateEditor.diagramMode);
    const templateID = useSelector((state: RootStore) => state.templateEditor.id);
    const toggle = () => dispatch(setDiagramMode(false));
    const nodeTypes = useMemo(() => ({ [CLASSES.NODE_SHAPE]: Node }), []);
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
    const { exportSHACL, isConvertingToSHACL } = useExportSHACL();
    const [isLoading, setIsLoading] = useState(false);
    const [nodes, setNodes] = useState<NodeWithPosition[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const loadFlow = useCallback(
        async (id: string) => {
            setIsLoading(true);
            try {
                const templatesFlow = await loadTemplateFlowByID(id, new Set());
                const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter((n) => !isEmpty(n))];
                dispatch(setTemplateFlow(flattenNodes));
                setNodes(flattenNodes.map((n) => ({ id: n.id, data: n, type: CLASSES.NODE_SHAPE, position: { x: 0, y: 0 } })));

                const _edges: Edge[] = [];
                flattenNodes.map((cn) => {
                    cn.properties
                        .filter((ps: PropertyShapeResourceType) => ps.class)
                        .map((ps: PropertyShapeResourceType) => {
                            const targetNode = flattenNodes.find((c) => ps.class && c.target_class.id === ps.class.id);
                            if (targetNode) {
                                _edges.push({
                                    type: 'custom',
                                    style: { strokeWidth: 3 },
                                    id: `${cn.id}-${targetNode.id}-${ps.id}`,
                                    source: cn.id,
                                    sourceHandle: ps.path.id,
                                    target: targetNode.id,
                                });
                            }
                            return null;
                        });
                    return null;
                });
                setEdges(_edges);
                setIsLoading(false);
            } catch {
                setIsLoading(false);
            }
        },
        [dispatch],
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadFlow(templateID);
    }, [loadFlow, templateID]);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    return (
        <Modal.Backdrop isOpen={diagramMode} onOpenChange={(open) => !open && toggle()} isDismissable>
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-[90vw] w-[90vw] h-[calc(100vh-150px)] flex flex-col">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading className="inline-flex items-center gap-2">
                            Template diagram
                            <Tooltip>
                                <Tooltip.Trigger>
                                    <a
                                        href="https://orkg.org/help-center/article/50/Template_Visualization_Diagram"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faQuestionCircle} className="text-muted text-lg" />
                                    </a>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow>
                                    <Tooltip.Arrow />
                                    Open help center
                                </Tooltip.Content>
                            </Tooltip>
                        </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="grow p-0 min-h-0">
                        <ErrorBoundary fallback="Something went wrong while loading the diagram!">
                            <div className="w-full h-full">
                                {!isLoading && (
                                    <ReactFlow
                                        colorMode={colorMode}
                                        proOptions={{ hideAttribution: true }}
                                        nodeTypes={nodeTypes}
                                        edgeTypes={edgeTypes}
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        fitView
                                    >
                                        <Controls />
                                        <MiniMap />
                                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                                    </ReactFlow>
                                )}
                                {isLoading && <div className="p-6 text-muted">Loading...</div>}
                            </div>
                        </ErrorBoundary>
                    </Modal.Body>
                    <Modal.Footer className="justify-between">
                        <div className="flex items-center gap-2">
                            <DownloadButton />
                            <ButtonWithLoading variant="tertiary" size="sm" isLoading={isConvertingToSHACL} onPress={exportSHACL}>
                                Export as SHACL
                            </ButtonWithLoading>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onPress={() => {
                                    setNodes([]);
                                    loadFlow(templateID);
                                }}
                            >
                                Reload
                            </Button>
                            <Button className="button--orkg-secondary" size="sm" onPress={toggle}>
                                Close
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

function ShaclFlowModalWithProvider() {
    return (
        <ReactFlowProvider>
            <ShaclFlowModal />
        </ReactFlowProvider>
    );
}

export default ShaclFlowModalWithProvider;
