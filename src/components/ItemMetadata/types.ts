import { Certainty, ExtractionMethod } from '@/services/backend/types';

/**
 * Structural shape of everything ItemMetadata can render. Every entity type (Resource, Predicate, Class,
 * Literal, RosettaStoneStatement, Comparison, Review, LiteratureList, ...) is assignable to it, so adding
 * another one requires no change here.
 */
export type ProvenanceItem = {
    id?: string;
    label?: string;
    // TODO: remove snake case handling after finishing services migration
    created_at?: string;
    createdAt?: string;
    created_by?: string;
    createdBy?: string;
    classes?: string[];
    datatype?: string | null;
    /** External identity of a class. The backend also returns the string `'null'` here, which counts as unset */
    uri?: string | null;
    certainty?: Certainty;
    shared?: number;
    extraction_method?: ExtractionMethod;
    version_id?: string;
    observatory_id?: string;
    organization_id?: string;
    observatories?: string[];
    organizations?: string[];
};
