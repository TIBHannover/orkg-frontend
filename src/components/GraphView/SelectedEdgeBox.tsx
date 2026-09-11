'use client';

import SelectedEntityPanel from '@/components/GraphView/SelectedEntityPanel';
import { GraphEdge } from '@/components/GraphView/types';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type SelectedEdgeBoxProps = {
    selectedEdge: GraphEdge;
};

const SelectedEdgeBox = ({ selectedEdge }: SelectedEdgeBoxProps) => (
    <SelectedEntityPanel
        kind="Property"
        id={selectedEdge.propertyId}
        href={selectedEdge.propertyId ? `${reverse(ROUTES.PROPERTY, { id: selectedEdge.propertyId })}?noRedirect` : undefined}
        linkLabel="View property"
    >
        <div className="text-sm break-words text-foreground">{selectedEdge.label}</div>
    </SelectedEntityPanel>
);

export default SelectedEdgeBox;
