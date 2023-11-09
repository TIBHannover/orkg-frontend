export type PaginatedResponse<T> = {
    content: T[];
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    first: boolean;
    number: number;
    numberOfElements: number;
    size: number;
    empty: boolean;
};

export type ExtractionMethod = 'UNKNOWN' | 'MANUAL' | 'AUTOMATIC';

export type Resource = {
    id: string;
    label: string;
    classes: string[];
    shared: number;
    featured: boolean;
    unlisted: boolean;
    verified: boolean;
    extraction_method: ExtractionMethod;
    _class: 'resource';
    created_at: string;
    created_by: string;
    observatory_id: string;
    organization_id: string;
    formatted_label: string;
};

export type Predicate = {
    id: string;
    label: string;
    description: string;
    _class: 'predicate';
    created_at: string;
    created_by: string;
};

export type Literal = {
    id: string;
    label: string;
    datatype: string;
    _class: 'literal';
    created_at: string;
    created_by: string;
};

export type Class = {
    id: string;
    label: string;
    uri: string | null;
    description: string | null;
    _class: 'class';
    created_at: string;
    created_by: string;
};

export type BenchmarkSummary = {
    research_problem: {
        id: string;
        label: string;
    };
    research_fields: {
        id: string;
        label: string;
    }[];
    total_papers: number;
    total_datasets: number;
    total_codes: number;
};

export type ConferenceSeries = {
    id: string;
    organizationId: string;
    name: string;
    homepage: string;
    display_id: string;
    metadata: {
        start_date: string;
        review_process: string;
    };
};

export type Contributor = {
    id: string;
    display_name: string;
    joined_at: string;
    organization_id: string;
    observatory_id: string;
    gravatar_id: string;
    avatar_url: string;
};

export type Comment = {
    id: string;
    message: string;
    created_by: string;
    created_at: string;
};

export type List = {
    id: string;
    label: string;
    elements: string[];
    created_at: string;
    created_by: string;
    _class: 'list';
};

export type Observatory = {
    id: string;
    name: string;
    description: string;
    research_field: {
        id: string;
        label: string;
    };
    members: string[];
    organization_ids: string[];
    display_id: string;
};

export type Organization = {
    id: string;
    name: string;
    created_by: string;
    homepage: string;
    observatory_ids: string[];
    display_id: string;
    type: string;
};

export type Statement = {
    id: string;
    subject: Resource;
    predicate: Predicate;
    object: Resource | Literal;
    created_at: string;
    created_by: string;
};

export type User = {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
    organization_id: string | null;
    observatory_id: string | null;
    is_curation_allowed: boolean;
};
