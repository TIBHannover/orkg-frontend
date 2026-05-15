'use client';

import { faDharmachakra, faHome, faProjectDiagram, faSitemap, faSpinner, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Label, Modal as HeroUIModal } from '@heroui/react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import { lightTheme, useSelection } from 'reagraph';

// import RobotoFont from '@/components/GraphView/roboto-medium-webfont.woff';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import Popover from '@/components/FloatingUI/Popover';
import ContextMenu from '@/components/GraphView/ContextMenu';
import GraphSearch from '@/components/GraphView/GraphSearch';
import useGraphView from '@/components/GraphView/hooks/useGraphView';
import Node from '@/components/GraphView/Node';
import SelectedEdgeBox from '@/components/GraphView/SelectedEdgeBox';
import SelectedNodeBox from '@/components/GraphView/SelectedNodeBox';
import Button from '@/components/Ui/Button/Button';
import Dropdown from '@/components/Ui/Dropdown/Dropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import { ENTITIES } from '@/constants/graphSettings';

const GraphCanvas = dynamic(() => import('reagraph').then((mod) => mod.GraphCanvas), { ssr: false });

const LazyGraphViewModal = ({ toggle, resourceId }) => {
    const [layoutType, setLayoutType] = useState('forceDirected2d');
    const [layoutSelectionOpen, setLayoutSelectionOpen] = useState(false);
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
        collapsed,
        setCollapsed,
        graphRef,
        toggleExpandNode,
        setBlackListClasses,
        blackListClasses,
    } = useGraphView({ resourceId });

    const handleLayoutChange = (newLayoutType) => {
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

    const selectedNode = selections[0] ? nodes.find((node) => node.id === selections[0]) : null;

    const getExpandButtonLabel = (data) =>
        collapsed.includes(data.id) || !data.hasObjectStatements || (data.hasObjectStatements && !data.hasFetchedObjectStatements)
            ? 'Expand'
            : 'Collapse';

    const layoutIcons = {
        forceDirected2d: faProjectDiagram,
        radialOut2d: faDharmachakra,
        circular2d: faSpinner,
    };

    const layoutIcon = layoutIcons[layoutType] || faSitemap;
    const onEdgeButtonClick = (edge) => {
        setSelectedEdge(edge);
        setSelections([]);
    };

    const handleCanvasClick = (e) => {
        setSelectedEdge(null);
        onCanvasClick(e);
    };

    return (
        <Modal size="lg" isOpen toggle={toggle} className="h-[calc(100vh-80px)]" style={{ maxWidth: '90%', marginBottom: 0 }}>
            <HeroUIModal.Header className="relative z-10 shrink-0">
                <HeroUIModal.CloseTrigger />
                <div className="flex w-full items-center">
                    <HeroUIModal.Heading>View graph</HeroUIModal.Heading>
                    <div className="flex ml-4 items-center grow">
                        <Button color="secondary" className="mr-2" size="sm" onClick={() => graphRef.current?.centerGraph()}>
                            <FontAwesomeIcon icon={faHome} className="mr-1" /> Center graph
                        </Button>
                        <Dropdown
                            color="secondary"
                            size="sm"
                            isOpen={layoutSelectionOpen}
                            toggle={() => {
                                setLayoutSelectionOpen(!layoutSelectionOpen);
                            }}
                        >
                            <DropdownToggle caret color="secondary" className="mr-2">
                                Layout:
                                <FontAwesomeIcon icon={layoutIcon} rotation={layoutType === 'treeLr2d' ? 270 : undefined} className="mx-2" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => handleLayoutChange('forceDirected2d')}>
                                    <FontAwesomeIcon icon={faProjectDiagram} className="mx-2" />
                                    Force directed
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('treeLr2d')}>
                                    <FontAwesomeIcon icon={faSitemap} rotation={270} className="mx-2" />
                                    Horizontal tree
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('treeTd2d')}>
                                    <FontAwesomeIcon icon={faSitemap} className="mx-2" />
                                    Vertical tree
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('radialOut2d')}>
                                    <FontAwesomeIcon icon={faDharmachakra} className="mx-2" />
                                    RadialOut
                                </DropdownItem>
                                <DropdownItem onClick={() => handleLayoutChange('circular2d')}>
                                    <FontAwesomeIcon icon={faSpinner} className="mx-2" />
                                    Circular
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <div className="flex mr-2 items-center">
                            <Popover
                                contentStyle={{
                                    zIndex: 9999,
                                }}
                                open={blackListClassesPopoverOpen}
                                onOpenChange={setBlackListClassesPopoverOpen}
                                content={
                                    <div className="p-1" style={{ minWidth: 300 }}>
                                        <Label htmlFor={classSelectorId}>Blacklisted classes</Label>
                                        <div>
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
                                    </div>
                                }
                            >
                                <span>
                                    <Button color="secondary" className="px-4" size="sm" onClick={() => setBlackListClassesPopoverOpen(true)}>
                                        <FontAwesomeIcon icon={faWrench} />
                                    </Button>
                                </span>
                            </Popover>
                        </div>
                        <div className="flex mr-4 items-center">
                            <Label htmlFor={depthId} className="m-0">
                                Depth
                            </Label>
                            <Input
                                type="number"
                                id={depthId}
                                min="1"
                                bsSize="sm"
                                className="ml-2"
                                style={{ width: '60px' }}
                                value={depth}
                                onChange={(e) => setDepth(e.target.value)}
                            />
                        </div>
                        <div className="ms-auto mr-4 w-full" style={{ maxWidth: 300 }}>
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
            </HeroUIModal.Header>
            <ModalBody className="p-0 mb-2 min-h-[100px] flex-1 overflow-hidden">
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
                    <div className="text-center text-accent mt-6 mb-6">
                        <span style={{ fontSize: '200%' }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="text-xl">Loading graph...</h2>
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
