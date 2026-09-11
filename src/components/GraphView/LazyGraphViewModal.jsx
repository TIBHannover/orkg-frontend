'use client';

import { faDharmachakra, faHome, faProjectDiagram, faSitemap, faSpinner, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Label, Modal, NumberField, Popover } from '@heroui/react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import { lightTheme, useSelection } from 'reagraph';

// import RobotoFont from '@/components/GraphView/roboto-medium-webfont.woff';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ContextMenu from '@/components/GraphView/ContextMenu';
import GraphLoadingIndicator from '@/components/GraphView/GraphLoadingIndicator';
import GraphSearch from '@/components/GraphView/GraphSearch';
import GraphViewModalShell from '@/components/GraphView/GraphViewModalShell';
import useGraphView from '@/components/GraphView/hooks/useGraphView';
import Node from '@/components/GraphView/Node';
import SelectedEdgeBox from '@/components/GraphView/SelectedEdgeBox';
import SelectedNodeBox from '@/components/GraphView/SelectedNodeBox';
import { ENTITIES } from '@/constants/graphSettings';

const GraphCanvas = dynamic(() => import('reagraph').then((mod) => mod.GraphCanvas), { ssr: false });

const LAYOUTS = [
    { id: 'forceDirected2d', label: 'Force directed', icon: faProjectDiagram },
    { id: 'treeLr2d', label: 'Horizontal tree', icon: faSitemap, rotation: 270 },
    { id: 'treeTd2d', label: 'Vertical tree', icon: faSitemap },
    { id: 'radialOut2d', label: 'Radial out', icon: faDharmachakra },
    { id: 'circular2d', label: 'Circular', icon: faSpinner },
];

const LazyGraphViewModal = ({ toggle, resourceId }) => {
    const [layoutType, setLayoutType] = useState('forceDirected2d');
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [blackListClassesPopoverOpen, setBlackListClassesPopoverOpen] = useState(false);
    const classSelectorId = useId();
    const depthId = useId();

    const {
        nodes,
        edges,
        setDepth,
        depth,
        fetchIncomingStatements,
        isLoadingStatements,
        hasLoadedStatements,
        collapsed,
        setCollapsed,
        graphRef,
        toggleExpandNode,
        setBlackListClasses,
        blackListClasses,
    } = useGraphView({ resourceId });

    const { onNodePointerOver, onNodePointerOut, selections, actives, onNodeClick, onCanvasClick, setSelections } = useSelection({
        ref: graphRef,
        nodes,
        edges,
        pathSelectionType: 'all',
        pathHoverType: 'all',
        focusOnSelect: false,
    });

    const selectedNode = selections[0] ? nodes.find((node) => node.id === selections[0]) : null;

    const getExpandButtonLabel = (data) =>
        collapsed.includes(data.id) || !data.hasObjectStatements || (data.hasObjectStatements && !data.hasFetchedObjectStatements)
            ? 'Expand'
            : 'Collapse';

    const activeLayout = LAYOUTS.find((layout) => layout.id === layoutType);

    const onEdgeButtonClick = (edge) => {
        setSelectedEdge(edge);
        setSelections([]);
    };

    const handleCanvasClick = (e) => {
        setSelectedEdge(null);
        onCanvasClick(e);
    };

    return (
        <GraphViewModalShell toggle={toggle}>
            <Modal.CloseTrigger />
            {/* relative anchors the absolutely-positioned close trigger to the header */}
            <Modal.Header className="relative z-10 shrink-0 gap-2 border-b border-border px-6 pt-4 pb-3">
                <div className="flex items-center gap-3 pe-10">
                    <Modal.Heading>View graph</Modal.Heading>
                    {hasLoadedStatements && (
                        <span className="text-xs text-muted">
                            {nodes.length} nodes · {edges.length} connections
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" onPress={() => graphRef.current?.centerGraph()}>
                        <FontAwesomeIcon icon={faHome} className="me-1 text-muted" /> Center graph
                    </Button>
                    <Dropdown>
                        <Button variant="secondary" size="sm" aria-label="Change graph layout">
                            <FontAwesomeIcon icon={activeLayout.icon} rotation={activeLayout.rotation} className="me-1 text-muted" />
                            {activeLayout.label}
                        </Button>
                        <Dropdown.Popover placement="bottom start" className="min-w-[220px]">
                            <Dropdown.Menu
                                aria-label="Graph layout"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={[layoutType]}
                                onSelectionChange={(keys) => setLayoutType([...keys][0])}
                            >
                                {LAYOUTS.map((layout) => (
                                    <Dropdown.Item key={layout.id} id={layout.id} textValue={layout.label}>
                                        <Dropdown.ItemIndicator />
                                        <Label>
                                            <FontAwesomeIcon icon={layout.icon} rotation={layout.rotation} className="me-2 text-muted" />
                                            {layout.label}
                                        </Label>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                    <Popover isOpen={blackListClassesPopoverOpen} onOpenChange={setBlackListClassesPopoverOpen}>
                        <Button variant="secondary" size="sm" isIconOnly aria-label="Graph settings">
                            <FontAwesomeIcon icon={faWrench} className="text-muted" />
                        </Button>
                        <Popover.Content className="w-[320px]">
                            <Popover.Dialog>
                                <Label htmlFor={classSelectorId}>Blacklisted classes</Label>
                                <div className="mt-2">
                                    <Autocomplete
                                        entityType={ENTITIES.CLASS}
                                        isMulti
                                        placeholder="Select a class"
                                        onChange={(selected) => {
                                            setBlackListClasses(!selected ? [] : selected);
                                        }}
                                        value={blackListClasses}
                                        openMenuOnFocus
                                        isClearable={false}
                                        inputId={classSelectorId}
                                        size="sm"
                                        enableExternalSources={false}
                                    />
                                </div>
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                    <NumberField
                        className="flex-row items-center gap-2"
                        id={depthId}
                        minValue={1}
                        value={depth}
                        onChange={(value) => {
                            if (value !== undefined && !Number.isNaN(value)) {
                                setDepth(value);
                            }
                        }}
                    >
                        <Label className="m-0 text-sm text-muted">Depth</Label>
                        {/* the group is a `40px 1fr 40px` grid: sizing the children instead of the tracks
                            pins them to the start of their cell */}
                        <NumberField.Group className="h-8 grid-cols-[32px_1fr_32px] rounded-full">
                            <NumberField.DecrementButton className="!h-8 w-full border-0" />
                            <NumberField.Input className="w-10 px-0 text-center" />
                            <NumberField.IncrementButton className="!h-8 w-full border-0" />
                        </NumberField.Group>
                    </NumberField>
                    {/* grid, not block: react-select's container doesn't stretch through a plain wrapper */}
                    <div className="ms-auto grid h-8 w-full max-w-[280px]">
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
            </Modal.Header>
            <Modal.Body className="relative mt-0 min-h-0 flex-1 overflow-hidden p-0">
                {selectedNode && (
                    <SelectedNodeBox
                        nodes={nodes}
                        selectedNode={selectedNode}
                        getExpandButtonLabel={getExpandButtonLabel}
                        toggleExpandNode={toggleExpandNode}
                        fetchIncomingStatements={fetchIncomingStatements}
                    />
                )}
                {selectedEdge && !selectedNode && <SelectedEdgeBox selectedEdge={selectedEdge} />}

                {hasLoadedStatements && (
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
                        onEdgeClick={onEdgeButtonClick}
                        onNodeClick={(node) => {
                            if (onNodeClick) {
                                onNodeClick(node);
                            }
                        }}
                        onNodePointerOver={onNodePointerOver}
                        onNodePointerOut={onNodePointerOut}
                        onCanvasClick={handleCanvasClick}
                        layoutOverrides={
                            layoutType === 'forceDirected2d'
                                ? {
                                      nodeStrength: -350,
                                      linkDistance: 100,
                                  }
                                : {}
                        }
                        // labelFontUrl={RobotoFont}
                        renderNode={(renderedNode) => <Node renderedNode={renderedNode} toggleExpandNode={toggleExpandNode} collapsed={collapsed} />}
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
                    <GraphLoadingIndicator isOverlay={hasLoadedStatements} message={hasLoadedStatements ? 'Updating graph...' : 'Loading graph...'} />
                )}
            </Modal.Body>
        </GraphViewModalShell>
    );
};

LazyGraphViewModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
};

export default LazyGraphViewModal;
