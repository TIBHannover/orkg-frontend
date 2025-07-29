import 'reactflow/dist/style.css';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import Tooltip from '@/components/FloatingUI/Tooltip';
import DownloadButton from '@/components/Templates/ShaclFlow/DownloadImage/DownloadButton';
import useAutoLayout from '@/components/Templates/ShaclFlow/hooks/useAutoLayoutAndFitView';
import useExportSHACL from '@/components/Templates/ShaclFlow/hooks/useExportSHACL';
import Node from '@/components/Templates/ShaclFlow/Node/Node';
import Button from '@/components/Ui/Button/Button';
import { CLASSES } from '@/constants/graphSettings';
import { loadTemplateFlowByID } from '@/services/backend/statements';
import { setDiagramMode, setTemplateFlow } from '@/slices/templateEditorSlice';
import { convertTreeToFlat } from '@/utils';

function ShaclFlowModal() {
    useAutoLayout({ direction: 'LR' });
    const dispatch = useDispatch();
    const diagramMode = useSelector((state) => state.templateEditor.diagramMode);
    const templateID = useSelector((state) => state.templateEditor.id);
    const toggle = () => dispatch(setDiagramMode(false));
    const nodeTypes = useMemo(() => ({ [CLASSES.NODE_SHAPE]: Node }), []);
    const { exportSHACL, isConvertingToSHACL } = useExportSHACL();
    const [isLoading, setIsLoading] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const loadFlow = useCallback(
        async (id) => {
            setIsLoading(true);
            try {
                const templatesFlow = await loadTemplateFlowByID(id, new Set());
                const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter((n) => !isEmpty(n))];
                dispatch(setTemplateFlow(flattenNodes));
                // We need this root node to make sure the algorithm of useAutoLayout always use as a root node if the selected template doesn't have a root (not a Tree) like qudt:Unit template
                const startNode = {
                    id: 'ROOT',
                    data: { label: 'Current Template' },
                    position: { x: 0, y: 0 },
                };
                setNodes([startNode, ...flattenNodes.map((n) => ({ id: n.id, data: n, type: CLASSES.NODE_SHAPE, position: { x: 0, y: 0 } }))]);

                const _edges = [{ id: 'startingEdge', type: 'straight', source: startNode.id, target: id }];
                flattenNodes.map((cn) => {
                    cn.properties
                        .filter((ps) => ps.class)
                        .map((ps) => {
                            const targetNode = flattenNodes.find((c) => c.target_class.id === ps.class.id);
                            if (targetNode) {
                                _edges.push({
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
        loadFlow(templateID);
    }, [loadFlow, templateID]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const modalHeight = window.innerHeight - 250;

    return (
        <Modal size="xl" isOpen={diagramMode} toggle={toggle} style={{ maxWidth: '90%', marginBottom: 0 }}>
            <ModalHeader toggle={toggle}>
                Template diagram{' '}
                <Tooltip content="Open help center">
                    <span>
                        <a href="https://orkg.org/help-center/article/50/Template_Visualization_Diagram" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1 }} className="text-secondary p-0" />
                        </a>
                    </span>
                </Tooltip>
            </ModalHeader>
            <ModalBody>
                <ErrorBoundary fallback="Something went wrong while loading the diagram!">
                    <div style={{ width: '100%', height: modalHeight }}>
                        {!isLoading && (
                            <ReactFlow
                                proOptions={{ hideAttribution: true }}
                                nodeTypes={nodeTypes}
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                fitView
                            >
                                <Controls />
                                <MiniMap />
                                <Background variant="dots" gap={12} size={1} />
                            </ReactFlow>
                        )}
                        {isLoading && 'Loading...'}
                    </div>
                </ErrorBoundary>
            </ModalBody>
            <ModalFooter className="d-flex justify-content-between">
                <div>
                    <DownloadButton />
                    <ButtonWithLoading color="light" isLoading={isConvertingToSHACL} onClick={exportSHACL}>
                        Export as SHACL
                    </ButtonWithLoading>
                </div>
                <div>
                    <Button
                        className="me-1"
                        color="light"
                        onClick={() => {
                            setNodes([]);
                            loadFlow(templateID);
                        }}
                    >
                        Reload
                    </Button>
                    <Button onClick={toggle} color="primary">
                        Close
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}

function ShaclFlowModalWithProvider(props) {
    return (
        <ReactFlowProvider>
            <ShaclFlowModal {...props} />
        </ReactFlowProvider>
    );
}

export default ShaclFlowModalWithProvider;
