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
export type Visibility = 'default' | 'featured' | 'unlisted' | 'deleted';
export type VisibilityFilter = 'ALL_LISTED' | 'UNLISTED' | 'FEATURED' | 'NON_FEATURED' | 'DELETED';

export type Node = {
    id: string;
    label: string;
};

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

export type Author = {
    id: string;
    name: string;
    identifiers: {
        orcid: string[];
        google_scholar: string[];
        research_gate: string[];
        linked_in: string[];
        wikidata: string[];
        web_of_science: string[];
        homepage: string[];
    }[];
};

export type Paper = {
    id: string;
    title: string;
    research_fields: Node[];
    identifiers: {
        doi?: string[];
    };
    publication_info: {
        published_month?: number | null;
        published_year?: number | null;
        published_in?: string | null | Node;
        url?: string | null;
    };
    authors: Author[];
    contributions: Node[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    verified: boolean;
    visibility: Visibility;
    unlisted_by: string;
};

export type ContributionContentsStatements = {
    [key: string]: {
        id: string;
        statements?: ContributionContentsStatements;
    }[];
};

export type CreateContributionData = {
    resources?: {
        [key: string]: {
            label: string;
            classes: string[];
        };
    };
    literals?: {
        [key: string]: {
            label: string;
            data_type?: string;
        };
    };
    predicates?: {
        [key: string]: {
            label: string;
            description?: string;
        };
    };
    lists?: {
        [key: string]: {
            label: string;
            elements: string[];
        };
    };
};

export type NewContribution = {
    label: string;
    classes?: string[];
    statements: ContributionContentsStatements;
};

export type CreatePaperContents = CreateContributionData & {
    contributions: NewContribution[];
};

export type CreateContribution = CreateContributionData & {
    contribution: NewContribution;
};

export type CreatePaperParams = Partial<Omit<Paper, 'id' | 'research_fields'> & { research_fields: string[]; contents: CreatePaperContents }>;
export type UpdatePaperParams = Partial<Omit<Paper, 'id' | 'research_fields'> & { research_fields: string[] }>;

export type Visualization = {
    id: string;
    title: string;
    authors: Author[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    visibility: Visibility;
    description: string;
};

export type ComparisonVersion = {
    created_at: string;
    id: string;
    label: string;
};

// type not complete, but part of other issue: https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/1610
export type Comparison = {
    id: string;
    title: string;
    description: string;
    research_fields: Node[];
    identifiers: {
        doi?: string;
    };
    publication_info: {
        published_month: number;
        published_year: number;
        published_in: string | null;
        url: string | null;
    };
    authors: Author[];
    contributions: Node[];
    visualizations: any[];
    related_figures: any[];
    related_resources: any[];
    references: any[];
    observatories: string[];
    organizations: string[];
    extraction_method: string;
    created_at: string;
    created_by: string;
    previous_version: string;
    is_anonymized: boolean;
    visibility: string;
    versions: ComparisonVersion[];
};

export type Verified = boolean | null;

export type PaginationParams = {
    page?: number;
    size?: number;
    sortBy?: { property: string; direction: 'asc' | 'desc' }[];
};

export type VerifiedParam = {
    verified?: Verified;
};

export type VisibilityParam = {
    visibility?: VisibilityFilter;
};

export type TopContributor = {
    contributor: string;
    comparisons: number;
    papers: number;
    contributions: number;
    problems: number;
    visualizations: number;
    total: number;
};

export type Activity = {
    id: string;
    label: string;
    created_at: string;
    classes: string[];
    profile: {
        id: string;
        display_name: string;
        gravatar_id: string;
        gravatar_url: string;
    };
};
