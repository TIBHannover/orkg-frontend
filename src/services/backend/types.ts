export type EntityType = 'class' | 'predicate' | 'resource' | 'literal';

export type SortByOptions = 'id' | 'label' | 'created_at' | 'created_by' | 'visibility' | 'name';

export type SortDirectionOptions = 'asc' | 'desc';

export type VisibilityOptions = 'combined' | 'ALL_LISTED' | 'UNLISTED' | 'FEATURED' | 'NON_FEATURED' | 'DELETED';

export type PaginatedResponse<T> = {
    content: T[];
    page: {
        number: number;
        size: number;
        total_elements: number;
        total_pages: number;
    };
};

export type ExtractionMethod = 'UNKNOWN' | 'MANUAL' | 'AUTOMATIC';
export type Visibility = 'DEFAULT' | 'FEATURED' | 'UNLISTED' | 'DELETED';
export type VisibilityFilter = 'combined' | 'ALL_LISTED' | 'UNLISTED' | 'FEATURED' | 'NON_FEATURED' | 'DELETED';
export type Certainty = 'LOW' | 'MODERATE' | 'HIGH';

export type Node = {
    id: string;
    label: string;
};

export type NewLiteral = {
    label: string;
    data_type: string;
};

export type NewResource = {
    label: string;
    classes: string[];
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
    sdgs: Node[];
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

type AuthorIdentifiers = {
    orcid?: string[];
    google_scholar?: string[];
    research_gate?: string[];
    linked_in?: string[];
    wikidata?: string[];
    web_of_science?: string[];
};

export type Author = {
    id: string | null;
    name: string;
    identifiers: AuthorIdentifiers;
    homepage?: string;
};

export type UpdateAuthor = Omit<Author, 'id' | 'identifiers'> & {
    id?: string | null;
    identifiers?: AuthorIdentifiers;
};

export type FilterConfigOperator = 'EQ' | 'LT' | 'GT' | 'GE' | 'LE' | 'NE';

export type FilterConfigValue = {
    op: FilterConfigOperator;
    value: string | Resource;
};

export type FilterConfig = {
    id?: string;
    observatory_id?: string;
    label?: string;
    path: string[];
    range: string;
    exact: boolean;
    created_at?: string;
    created_by?: string;
    featured?: boolean;
    persisted?: boolean;
    values?: FilterConfigValue[];
    source?: string;
};

type PaperPublicationInfo = {
    published_month?: number | null;
    published_year?: number | null;
    published_in?: Node;
    url?: string | null;
};

export type UpdatePaperPublicationInfo = Omit<PaperPublicationInfo, 'published_in'> & { published_in?: string | null };
export type Mentioning = {
    id: string;
    _class: string;
    classes: string[];
    label: string;
};
export type Paper = {
    id: string;
    title: string;
    research_fields: Node[];
    identifiers: {
        doi?: string[];
    };
    publication_info: PaperPublicationInfo;
    authors: Author[];
    contributions: Node[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    observatory_id: string;
    verified: boolean;
    visibility: Visibility;
    unlisted_by: string;
    sdgs: Node[];
    mentionings: Mentioning[];
};

export type RSPropertyShapeUntypedType = {
    id?: string;
    label?: string;
    placeholder: string;
    description: string;
    min_count?: number | string;
    max_count?: number | string;
    path?: Node;
    created_at?: string;
    created_by?: string;
    preposition?: string;
    postposition?: string;
};

export type PropertyShapeUntypedType = {
    id?: string;
    label?: string;
    placeholder: string;
    description: string;
    min_count?: number | string;
    max_count?: number | string;
    path: Node;
    created_at?: string;
    created_by?: string;
    preposition?: string;
    postposition?: string;
};

export type RSPropertyShapeLiteralType = RSPropertyShapeUntypedType & {
    datatype?: Node;
};

export type PropertyShapeLiteralType = PropertyShapeUntypedType & {
    datatype?: Node;
};

export type RSPropertyShapeStringType = RSPropertyShapeLiteralType & {
    pattern: string;
};

export type PropertyShapeStringType = PropertyShapeLiteralType & {
    pattern: string;
};

export type RSPropertyShapeNumberType = RSPropertyShapeLiteralType & {
    min_inclusive: number;
    max_inclusive: number;
};

export type PropertyShapeNumberType = PropertyShapeLiteralType & {
    min_inclusive: number;
    max_inclusive: number;
};

export type RSPropertyShapeResourceType = RSPropertyShapeUntypedType & {
    class?: Node;
};

export type PropertyShapeResourceType = PropertyShapeUntypedType & {
    class?: Node;
};

export type RSPropertyShape =
    | RSPropertyShapeUntypedType
    | RSPropertyShapeLiteralType
    | RSPropertyShapeStringType
    | RSPropertyShapeNumberType
    | RSPropertyShapeResourceType;

export type PropertyShape =
    | PropertyShapeUntypedType
    | PropertyShapeLiteralType
    | PropertyShapeStringType
    | PropertyShapeNumberType
    | PropertyShapeResourceType;

export type Template = {
    id: string;
    label: string;
    description: string;
    formatted_label: string;
    target_class: Node & { uri?: string | null };
    relations: { research_fields: Node[]; research_problems: Node[] };
    properties: PropertyShape[];
    is_closed: boolean;
    organizations: string[];
    observatories: string[];
    created_at: string;
    created_by: string;
    visibility: Visibility;
    unlisted_by?: string;
};

export type PropertyShapeCreateParams = Omit<PropertyShape, 'path'> & { path: string };

export type CreateTemplateParams = {
    label: string;
    target_class: string;
    relations: { research_fields: string[]; research_problems: string[] };
    properties: PropertyShapeCreateParams[];
    organizations: string[];
    observatories: string[];
};

export type RosettaStoneTemplate = {
    __isNew__?: boolean;
    id: string;
    label: string;
    description: string;
    formatted_label: string;
    example_usage: string;
    target_class: Node;
    properties: RSPropertyShape[];
    organizations: string[];
    observatories: string[];
    created_at: string;
    created_by: string;
    visibility: Visibility;
    unlisted_by: string;
};

export type RosettaStoneStatement = {
    id: string;
    template_id: string;
    latest_version_id?: string;
    version_id?: string;
    is_latest_version: boolean;
    context: string;
    subjects: Node[];
    objects: Node[][];
    created_at: string;
    created_by: string;
    certainty: Certainty;
    negated: boolean;
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    visibility: Visibility;
    unlisted_by?: string;
    modifiable: boolean;
};

export type CreateRosettaStoneTemplateParams = {
    label: string;
    description: string;
    example_usage: string;
    formatted_label: string;
    properties: (Omit<RSPropertyShape, 'path'> & { path: string })[];
    organizations: string[];
    observatories: string[];
};

export type UpdateRosettaStoneTemplateParams = {
    label?: string;
    description?: string;
    example_usage?: string;
    formatted_label?: string;
    properties?: (Omit<PropertyShape, 'path'> & { path: string })[];
    organizations?: string[];
    observatories?: string[];
};

export type CreateRosettaStoneStatementParams = {
    template_id: string;
    context: string;
    subjects: string[];
    objects: string[][] | string[];
    certainty: Certainty;
    resources: {
        [key: string]: NewResource;
    };
    literals: {
        [key: string]: NewLiteral;
    };
    lists: {
        [key: string]: Node;
    };
    classes: {
        [key: string]: Node;
    };
    negated: boolean;
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
};

export type UpdateRosettaStoneStatementParams = {
    subjects: string[];
    objects: string[][] | string[];
    certainty: Certainty;
    resources: {
        [key: string]: NewResource;
    };
    literals: {
        [key: string]: NewLiteral;
    };
    lists: {
        [key: string]: Node;
    };
    classes: {
        [key: string]: Node;
    };
    negated: boolean;
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
};

export type UpdateTemplateParams = Partial<Omit<Template, 'id' | 'created_at' | 'created_by' | 'visibility' | 'unlisted_by'>>;

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

export type CreatePaperParams = Partial<
    Omit<Paper, 'id' | 'research_fields' | 'sdgs' | 'authors' | 'publication_info'> & { research_fields: string[]; contents: CreatePaperContents }
> & {
    sdgs?: string[];
} & {
    authors: UpdateAuthor[];
} & {
    publication_info: UpdatePaperPublicationInfo;
};
export type UpdatePaperParams = Partial<
    Omit<Paper, 'id' | 'research_fields' | 'sdgs' | 'mentionings'> & {
        sdgs: string[];
        mentionings: string[];
        research_fields: string[];
    }
>;

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
    unlisted_by: string;
};

export type CreateVisualizationParams = Omit<Visualization, 'id' | 'created_at' | 'created_by' | 'visibility' | 'unlisted_by'>;

export type ComparisonVersion = {
    created_at: string;
    created_by: string;
    id: string;
    label: string;
};

export type ComparisonRelatedFigure = {
    created_at: string;
    created_by: string;
    description: string;
    id: string;
    image: string;
    label: string;
};
export type ComparisonRelatedResource = {
    created_at: string;
    created_by: string;
    description: string;
    id: string;
    image: string;
    label: string;
    url: string;
};

// type not complete, but part of other issue: https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/1610
export type Comparison = {
    id: string;
    title: string;
    description: string;
    research_fields: Node[];
    identifiers: {
        doi?: string[];
    };
    publication_info: {
        published_month: number;
        published_year: number;
        published_in: string | null;
        url: string | null;
    };
    authors: Author[];
    contributions: Node[];
    visualizations: Node[];
    related_figures: Node[];
    related_resources: Node[];
    references: string[];
    observatories: string[];
    organizations: string[];
    extraction_method: string;
    created_at: string;
    created_by: string;
    previous_version: string;
    is_anonymized: boolean;
    visibility: string;
    versions: {
        head: ComparisonVersion;
        published: ComparisonVersion[];
    };
    sdgs: Node[];
    config: {
        predicates: string[];
        contributions: string[];
        transpose: boolean;
        type: 'PATH' | 'MERGE';
    };
    data: {
        contributions: {
            id: string;
            label: string;
            paper_id: string;
            paper_label: string;
            paper_year: string;
            active: boolean;
        }[];
        predicates: {
            id: string;
            label: string;
            n_contributions: string;
            active: boolean;
            similar_predicates: string[];
        }[];
        data: {
            [predicateId: string]: {
                id: string;
                label: string;
                classes: string[];
                path: string[];
                path_labels: string[];
                _class: string;
            }[][];
        };
    };
};

export type ReviewSectionData = {
    id: string;
    label: string;
    classes: string[];
    _class: string;
};

export type ReviewSectionType = 'text' | 'resource' | 'property' | 'comparison' | 'visualization' | 'ontology';

export type ReviewSection = {
    id: string;
    heading: string;
    classes: string[];
    class?: string | null;
    text?: string;
    type: ReviewSectionType;
    comparison?: ReviewSectionData;
    visualization?: ReviewSectionData;
    resource?: ReviewSectionData;
    predicate?: Omit<ReviewSectionData, 'classes'>;
    predicates?: Omit<ReviewSectionData, 'classes'>[];
    entities?: ReviewSectionData[];
};

export type ReviewSectionComparisonPayload = {
    heading: string;
    comparison: string | null;
};

export type ReviewSectionVisualizationPayload = {
    heading: string;
    visualization: string | null;
};

export type ReviewSectionResourcePayload = {
    heading: string;
    resource: string | null;
};

export type ReviewSectionPredicatePayload = {
    heading: string;
    predicate: string | null;
};

export type ReviewSectionOntologyPayload = {
    heading: string;
    entities: string[];
    predicates: string[];
};

export type ReviewSectionTextPayload = {
    heading: string;
    text: string;
    class: string | null;
};

export type ReviewPublishedContents = {
    _class: string;
    statements: Statement[];
};

export type Review = {
    id: string;
    title: string;
    research_fields: Node[];
    authors: Author[];
    versions: {
        head: {
            id: string;
            label: string;
            created_at: string;
        };
        published: {
            id: string;
            label: string;
            created_at: string;
            created_by: string;
            changelog: string;
        }[];
    };
    identifiers: {
        doi: string[];
    };
    sdgs: Node[];
    observatories: string[];
    organizations: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    observatory_id: string;
    visibility: Visibility;
    published: boolean;
    sections: ReviewSection[];
    references: string[];
    acknowledgements: {
        [contributorId: string]: number;
    };
};

export type LiteratureListSectionListEntry = {
    description: string;
    value: {
        id: string;
        label: string;
        classes: string[];
    };
};

export type LiteratureListSectionType = 'text' | 'list';

export type LiteratureListSectionBase = {
    id: string;
    type: LiteratureListSectionType;
};

export type LiteratureListSectionText = LiteratureListSectionBase & {
    text: string;
    heading: string;
    heading_size: number;
};
export type LiteratureListSectionList = LiteratureListSectionBase & {
    entries: LiteratureListSectionListEntry[];
};

export type LiteratureListSection = LiteratureListSectionText | LiteratureListSectionList;

export type LiteratureList = {
    id: string;
    title: string;
    research_fields: Node[];
    authors: Author[];
    versions: {
        head: {
            id: string;
            label: string;
            created_at: string;
            created_by: string;
        };
        published: {
            id: string;
            label: string;
            created_at: string;
            created_by: string;
            changelog: string;
        }[];
    };
    sdgs: Node[];
    observatories: string[];
    organizations: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    observatory_id: string;
    visibility: Visibility;
    published: boolean;
    sections: LiteratureListSection[];
    acknowledgements: {
        [contributorId: string]: number;
    };
};

export type Verified = boolean | null;

export type PaginationParams = {
    page?: number;
    size?: number;
    sortBy?: { property: string; direction: SortDirectionOptions }[];
};

export type VerifiedParam = {
    verified?: Verified;
};

export type VisibilityParam = {
    visibility?: VisibilityFilter;
};

export type CreatedByParam = {
    created_by?: string;
};

export type ObservatoryIdParam = {
    observatory_id?: string;
};

export type OrganizationIdParam = {
    organization_id?: string;
};

export type AuthorIdParam = {
    author_id?: string;
};

export type ResearchFieldIdParams = {
    research_field?: string;
    include_subfields?: boolean;
};

export type SdgParam = {
    sdg?: string;
};

export type PublishedParam = {
    published?: boolean;
};

export type TopContributor = {
    contributor: string;
    comparisons?: number;
    papers?: number;
    contributions?: number;
    problems?: number;
    visualizations?: number;
    total?: number;
} & Contributor;

export type ApiError = {
    status: number;
    error: number;
    path: string;
    timestamp: string;
    message?: string;
    errors?: {
        field: string;
        message: string;
    }[];
};

export type ContentType = Paper | Comparison | LiteratureList | Visualization | Review | Template | RosettaStoneTemplate;

export type Item = {
    _class: string;
} & (ContentType | Resource | RosettaStoneStatement);

export type Snapshot = {
    created_at: string;
    created_by: string;
    id: string;
    handle: string | null;
    resource_id: string;
    template_id: string;
    data: {
        root: Resource;
        predicates: { [predicateId: string]: Predicate };
        statements: {
            [predicateId: string]: {
                thing: Resource | Literal;
                created_at: string;
                created_by: string;
                statements: object;
            }[];
        };
    };
};

export type PaperSections = 'contributions' | 'statements' | 'mentions';
