import { faDharmachakra, faHome, faProjectDiagram, faSitemap, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ContextMenu from 'components/GraphView/ContextMenu';
import GraphSearch from 'components/GraphView/GraphSearch';
import Node from 'components/GraphView/Node';
import SelectedNodeBox from 'components/GraphView/SelectedNodeBox';
import useGraphView from 'components/GraphView/hooks/useGraphView';
import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { GraphCanvas, lightTheme, useSelection } from 'reagraph';
import RobotoFont from 'components/GraphView/roboto-medium-webfont.woff';

const LazyGraphViewModal = ({ toggle, resourceId }) => {
    const [layoutType, setLayoutType] = useState('forceDirected2d');
    const [layoutSelectionOpen, setLayoutSelectionOpen] = useState(false);

    const depthId = useId();

    const { nodes, edges, setDepth, depth, fetchIncomingStatements, isLoadingStatements, collapsed, setCollapsed, graphRef, toggleExpandNode } =
        useGraphView({ resourceId });

    const handleLayoutChange = newLayoutType => {
        setLayoutType(newLayoutType);
    };

    const { onNodePointerOver, onNodePointerOut, selections, actives, onNodeClick, onCanvasClick, setSelections } = useSelection({
        ref: graphRef,
        nodes,
        edges,
        pathSelectionType: 'all',
        pathHoverType: 'all',
        focusOnSelect: false,
    });

    const selectedNode = selections[0] ? nodes.find(node => node.id === selections[0]) : null;

    const getExpandButtonLabel = data =>
        collapsed.includes(data.id) || !data.hasObjectStatements || (data.hasObjectStatements && !data.hasFetchedObjectStatements)
            ? 'Expand'
            : 'Collapse';

    const layoutIcons = {
        forceDirected2d: faProjectDiagram,
        radialOut2d: faDharmachakra,
        circular2d: faSpinner,
    };

    const layoutIcon = layoutIcons[layoutType] || faSitemap;

    return (
        <Modal size="lg" isOpen toggle={toggle} style={{ maxWidth: '90%', marginBottom: 0 }}>
            <ModalHeader toggle={toggle} tag="div" cssModule={{ 'modal-title': 'w-100' }}>
                <div className="d-flex align-items-center">
                    <h1 className="h5 m-0">View graph</h1>
                    <div className="d-flex ms-3 align-items-center flex-grow-1">
                        <Button color="secondary" className="me-2" size="sm" onClick={() => graphRef.current?.centerGraph()}>
                            <Icon icon={faHome} className="me-1" /> Center graph
                        </Button>
                        <Dropdown
                            color="secondary"
                            size="sm"
                            isOpen={layoutSelectionOpen}
                            toggle={() => {
                                setLayoutSelectionOpen(!layoutSelectionOpen);
                            }}
                        >
                            <DropdownToggle caret color="secondary">
                                Layout:
                                <Icon icon={layoutIcon} rotation={layoutType === 'treeLr2d' ? 270 : undefined} className="mx-2" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => handleLayoutChange('forceDirected2d')}>
                                    <Icon icon={faProjectDiagram} className="mx-2" />
                                    Force directed
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('treeLr2d')}>
                                    <Icon icon={faSitemap} rotation={270} className="mx-2" />
                                    Horizontal tree
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('treeTd2d')}>
                                    <Icon icon={faSitemap} className="mx-2" />
                                    Vertical tree
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('radialOut2d')}>
                                    <Icon icon={faDharmachakra} className="mx-2" />
                                    RadialOut
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('circular2d')}>
                                    <Icon icon={faSpinner} className="mx-2" />
                                    Circular
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div className="d-flex ms-3 align-items-center">
                            <Label for={depthId} className="m-0">
                                Depth
                            </Label>
                            <Input
                                type="number"
                                id={depthId}
                                min="1"
                                bsSize="sm"
                                className="ms-2"
                                style={{ width: '60px' }}
                                value={depth}
                                onChange={e => setDepth(e.target.value)}
                            />
                        </div>
                        <div className="ms-auto me-3 w-100" style={{ maxWidth: 300 }}>
                            <GraphSearch
                                nodes={nodes}
                                edges={edges}
                                setSelections={setSelections}
                                collapsed={collapsed}
                                setCollapsed={setCollapsed}
                                graphRef={graphRef}
                            />
                        </div>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody className="p-0 mb-2" style={{ minHeight: '100px', height: 'calc(100vh - 150px)' }}>
                {selectedNode && (
                    <SelectedNodeBox
                        nodes={nodes}
                        selectedNode={selectedNode}
                        getExpandButtonLabel={getExpandButtonLabel}
                        toggleExpandNode={toggleExpandNode}
                        fetchIncomingStatements={fetchIncomingStatements}
                    />
                )}

                {!isLoadingStatements && (
                    <GraphCanvas
                        ref={graphRef}
                        theme={{
                            ...lightTheme,
                            node: {
                                ...lightTheme.node,
                                inactiveOpacity: 1,
                            },
                            edge: {
                                ...lightTheme.edge,
                                inactiveOpacity: 1,
                            },
                        }}
                        edges={edges}
                        nodes={nodes}
                        selections={selections}
                        collapsedNodeIds={collapsed}
                        layoutType={layoutType}
                        labelType="all"
                        edgeLabelPosition="natural"
                        actives={actives}
                        onNodeClick={node => {
                            if (onNodeClick) {
                                onNodeClick(node);
                            }
                        }}
                        onNodePointerOver={onNodePointerOver}
                        onNodePointerOut={onNodePointerOut}
                        onCanvasClick={onCanvasClick}
                        layoutOverrides={
                            layoutType === 'forceDirected2d'
                                ? {
                                      nodeStrength: -350,
                                      linkDistance: 100,
                                  }
                                : {}
                        }
                        labelFontUrl={RobotoFont}
                        renderNode={renderedNode => <Node renderedNode={renderedNode} toggleExpandNode={toggleExpandNode} collapsed={collapsed} />}
                        contextMenu={({ data, onClose }) => (
                            <ContextMenu
                                getExpandButtonLabel={getExpandButtonLabel}
                                toggleExpandNode={toggleExpandNode}
                                onClose={onClose}
                                fetchIncomingStatements={fetchIncomingStatements}
                                data={data.data}
                            />
                        )}
                    />
                )}
                {isLoadingStatements && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <span style={{ fontSize: '200%' }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading graph...</h2>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

LazyGraphViewModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
};

export default LazyGraphViewModal;
