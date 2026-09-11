import { EntityType } from '@/services/backend/types';

/** The `data` payload useGraphView attaches to each reagraph node: the entity plus its expansion state. */
export type GraphNodeData = {
    id: string;
    label: string;
    _class: EntityType;
    classes?: string[];
    /** whether the node has outgoing statements at all */
    hasObjectStatements?: boolean;
    /** whether those statements have already been fetched into the graph */
    hasFetchedObjectStatements?: boolean;
    isLoading?: boolean;
};

export type GraphNode = {
    id: string;
    label: string;
    fill: string;
    data: GraphNodeData;
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    label: string;
    propertyId: string;
    size: number;
};
