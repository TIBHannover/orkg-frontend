import { Certainty, ExtractionMethod } from '@/services/backend/types';

/**
 * Structural shape of everything ItemMetadata can render. Every entity type (Resource, Predicate, Class,
 * Literal, RosettaStoneStatement, Comparison, Review, LiteratureList, ...) is assignable to it, so adding
 * another one requires no change here.
 */
export type ProvenanceItem = {
    id?: string;
    label?: string;
    createdAt?: string;
    createdBy?: string;
    classes?: string[];
    datatype?: string | null;
    /** External identity of a class. The backend also returns the string `'null'` here, which counts as unset */
    uri?: string | null;
    certainty?: Certainty;
    shared?: number;
    extractionMethod?: ExtractionMethod;
    versionId?: string;
    observatoryId?: string;
    organizationId?: string;
    observatories?: string[];
    organizations?: string[];
};
