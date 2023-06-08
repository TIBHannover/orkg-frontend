import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import DownloadButton from 'components/Templates/ShaclFlow/DownloadImage/DownloadButton';
import Node from 'components/Templates/ShaclFlow/Node/Node';
import useAutoLayout from 'components/Templates/ShaclFlow/hooks/useAutoLayoutAndFitView';
import { CLASSES } from 'constants/graphSettings';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { loadTemplateFlowByID } from 'services/backend/statements';
import { setDiagramMode } from 'slices/templateEditorSlice';
import { convertTreeToFlat } from 'utils';

function ShaclFlowModal() {
    useAutoLayout({ direction: 'LR' });
    const dispatch = useDispatch();
    const diagramMode = useSelector(state => state.templateEditor.diagramMode);
    const templateID = useSelector(state => state.templateEditor.templateID);
    const toggle = () => dispatch(setDiagramMode(false));
    const nodeTypes = useMemo(() => ({ [CLASSES.NODE_SHAPE]: Node }), []);

    const [isLoading, setIsLoading] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const loadFlow = useCallback(async id => {
        setIsLoading(true);
        try {
            const templatesFlow = await loadTemplateFlowByID(id, new Set());

            // We need this root node to make sure the algorithm of useAutoLayout always use as a root node if the selected template doesn't have a root (not a Tree) like qudt:Unit template
            const startNode = {
                id: 'ROOT',
                data: { label: 'Current Template' },
                position: { x: 0, y: 0 },
            };
            const flattenNodes = [templatesFlow, ...convertTreeToFlat(templatesFlow, 'neighbors').filter(n => !isEmpty(n))];
            setNodes([startNode, ...flattenNodes.map(n => ({ id: n.id, data: n, type: CLASSES.NODE_SHAPE, position: { x: 0, y: 0 } }))]);

            const _edges = [{ id: 'startingEdge', type: 'straight', source: startNode.id, target: id }];
            flattenNodes.map(cn => {
                cn.propertyShapes
                    .filter(ps => ps.value)
                    .map(ps => {
                        const targetNode = flattenNodes.find(c => c.class.id === ps.value.id);
                        if (targetNode) {
                            _edges.push({
                                style: { strokeWidth: 3 },
                                id: `${cn.id}-${targetNode.id}-${ps.id}`,
                                source: cn.id,
                                sourceHandle: ps.property.id,
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
        throw new Error('test');
    }, []);

    useEffect(() => {
        loadFlow(templateID);
    }, [loadFlow, templateID]);

    const onNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), []);
    const modalHeight = window.innerHeight - 250;

    return (
        <Modal size="xl" isOpen={diagramMode} toggle={toggle} style={{ maxWidth: '90%', marginBottom: 0 }}>
            <ModalHeader toggle={toggle}>
                Template diagram{' '}
                <Tippy content="Open help center">
                    <span>
                        <a href="https://orkg.org/help-center/article/50/Template_Visualization_Diagram" target="_blank" rel="noopener noreferrer">
                            <Icon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1 }} className="text-secondary p-0" />
                        </a>
                    </span>
                </Tippy>
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
