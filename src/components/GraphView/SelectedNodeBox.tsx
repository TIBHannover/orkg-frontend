'use client';

import { Button, ButtonGroup, Separator } from '@heroui/react';
import Link from 'next/link';
import { Fragment } from 'react';

import SelectedEntityPanel from '@/components/GraphView/SelectedEntityPanel';
import { GraphNode, GraphNodeData } from '@/components/GraphView/types';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResourceLink } from '@/utils';

type SelectedNodeBoxProps = {
    nodes: GraphNode[];
    selectedNode: GraphNode;
    getExpandButtonLabel: (data: GraphNodeData) => string;
    toggleExpandNode: (id: string) => void;
    fetchIncomingStatements: (id: string) => void;
};

const SelectedNodeBox = ({ nodes, selectedNode, getExpandButtonLabel, toggleExpandNode, fetchIncomingStatements }: SelectedNodeBoxProps) => {
    const isResource = selectedNode.data._class === ENTITIES.RESOURCE;
    // the selection is a snapshot; expanding mutates hasObjectStatements/isLoading on the live node
    const node = nodes.find(({ id }) => id === selectedNode.id) ?? selectedNode;
    const classes = selectedNode.data.classes ?? [];

    return (
        <SelectedEntityPanel
            kind={isResource ? 'Resource' : 'Literal'}
            id={selectedNode.id}
            href={isResource ? `${reverse(ROUTES.RESOURCE, { id: selectedNode.id })}?noRedirect` : undefined}
            linkLabel="View resource"
        >
            <div className="max-h-40 overflow-auto overscroll-contain text-sm break-words text-foreground">
                {selectedNode.data._class === ENTITIES.LITERAL ? (
                    <ValuePlugins type={ENTITIES.LITERAL}>{selectedNode.data.label}</ValuePlugins>
                ) : (
                    selectedNode.data.label
                )}
            </div>

            {isResource && (
                <>
                    {classes.length > 0 && (
                        <div className="text-xs text-muted">
                            Instance of{' '}
                            {classes.map((c, index) => (
                                <Fragment key={c}>
                                    <Link href={getResourceLink(ENTITIES.CLASS, c)} target="_blank" className="text-accent hover:underline">
                                        {c}
                                    </Link>
                                    {index + 1 < classes.length && ', '}
                                </Fragment>
                            ))}
                        </div>
                    )}

                    <Separator className="my-1" />

                    <ButtonGroup className="w-full" size="sm" variant="secondary">
                        <Button
                            className="flex-1"
                            isDisabled={!node.data.hasObjectStatements}
                            isPending={node.data.isLoading}
                            onPress={() => toggleExpandNode(selectedNode.id)}
                        >
                            {getExpandButtonLabel(node.data)}
                        </Button>
                        <Button className="flex-1" onPress={() => fetchIncomingStatements(selectedNode.id)}>
                            {/* ButtonGroup draws its divider from inside the following button */}
                            <ButtonGroup.Separator />
                            Fetch incoming
                        </Button>
                    </ButtonGroup>
                </>
            )}
        </SelectedEntityPanel>
    );
};

export default SelectedNodeBox;
