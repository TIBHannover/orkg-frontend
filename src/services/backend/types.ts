import {
    AuthorIdentifierMap,
    ClassRepresentation,
    ComparisonDataSource,
    ComparisonRelatedFigureRepresentation,
    ComparisonRelatedResourceRepresentation,
    ComparisonRepresentation,
    ComparisonTableRepresentation,
    ComparisonTableRowRepresentation,
    ContributionRequestPart,
    Contributor as ContributorType,
    CreateContributionRequest,
    CreatePaperRequest,
    CreateRosettaStoneStatementRequest,
    CreateVisualizationRequest,
    EntryRepresentation,
    HeadVersionRepresentation,
    LabeledComparisonPathRepresentation,
    LiteralRepresentation,
    LiteratureListRepresentation,
    LiteratureListSectionRepresentation,
    Organization as OrganizationRepresentation,
    PageOfAuthorRecordRepresentationsPage,
    PaperRepresentation,
    PredicateRepresentation,
    PublishedSmartReviewContentRepresentation,
    ResourceReferenceRepresentation,
    ResourceRepresentation,
    ResourceRepresentationExtractionMethodEnum,
    RosettaStoneStatementRepresentation,
    RosettaStoneTemplateRepresentation,
    SimpleComparisonPath,
    SmartReviewComparisonSectionRequest,
    SmartReviewOntologySectionRequest,
    SmartReviewPredicateSectionRequest,
    SmartReviewRepresentation,
    SmartReviewResourceSectionRequest,
    SmartReviewSectionRepresentation,
    SmartReviewTextSectionRequest,
    SmartReviewVisualizationSectionRequest,
    StatementRepresentation,
    TemplateBasedResourceSnapshotRepresentation,
    TemplatePropertyRepresentation,
    TemplateRepresentation,
    ThingReferenceRepresentation,
    UpdatePaperRequest,
    UpdateRosettaStoneStatementRequest,
    VisualizationRepresentation,
} from '@orkg/orkg-client';

export type EntityType = string;

export type SortByOptions = 'id' | 'label' | 'createdAt' | 'createdBy' | 'visibility' | 'name';

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

export type Pagination<T> = {
    content: T[];
    page: PageOfAuthorRecordRepresentationsPage;
};

export type ExtractionMethod = ResourceRepresentationExtractionMethodEnum;
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

export type NewPredicate = {
    label: string;
    description: string;
};

export type NewList = {
    label: string;
    elements: string[];
};

export type NewClass = {
    label: string;
    uri: string;
};

export type Resource = ResourceRepresentation;

export type Predicate = PredicateRepresentation;

export type Literal = LiteralRepresentation;
export type Contributor = ContributorType;

export type Class = ClassRepresentation;

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

export type Organization = OrganizationRepresentation;

export type Statement = StatementRepresentation;

export type AuthorIdentifiers = AuthorIdentifierMap;

export type Author = {
    id?: string | null;
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

export type Mentioning = ResourceReferenceRepresentation;

export type Paper = PaperRepresentation;

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

export type PropertyShapeUntypedType = Extract<TemplatePropertyRepresentation, { type: 'untyped' }>;

export type RSPropertyShapeLiteralType = RSPropertyShapeUntypedType & {
    datatype?: Node;
};

export type PropertyShapeLiteralType = Extract<TemplatePropertyRepresentation, { type: 'other_literal' }>;

export type RSPropertyShapeStringType = RSPropertyShapeLiteralType & {
    pattern: string;
};

export type PropertyShapeStringType = Extract<TemplatePropertyRepresentation, { type: 'string_literal' }>;

export type RSPropertyShapeNumberType = RSPropertyShapeLiteralType & {
    min_inclusive: number;
    max_inclusive: number;
};

export type PropertyShapeNumberType = Extract<TemplatePropertyRepresentation, { type: 'number_literal' }>;

export type RSPropertyShapeResourceType = RSPropertyShapeUntypedType & {
    class?: Node;
};

export type PropertyShapeResourceType = Extract<TemplatePropertyRepresentation, { type: 'resource' }>;

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

export type Template = TemplateRepresentation;

// relaxed flavor of the generated template requests: the editor produces explicit nulls to
// clear optional fields, and counts may arrive as strings from form inputs —
// toTemplatePropertyRequest maps onto the generated union before serialization
export type PropertyShapeCreateParams = {
    label?: string;
    placeholder?: string;
    description?: string;
    minCount?: number | string | null;
    maxCount?: number | string | null;
    path: string;
    datatype?: string;
    // the generated client escapes the wire field 'class' as '_class'
    _class?: string;
    pattern?: string | null;
    minInclusive?: number | string | null;
    maxInclusive?: number | string | null;
};

export type CreateTemplateParams = {
    label: string;
    description?: string | null;
    formattedLabel?: string | null;
    targetClass: string;
    relations: { researchFields: string[]; researchProblems: string[] };
    properties: PropertyShapeCreateParams[];
    organizations?: string[];
    observatories?: string[];
    isClosed: boolean;
};

export type RosettaStoneTemplate = RosettaStoneTemplateRepresentation & {
    // set client-side by the statement-type autocomplete when offering to create a new type
    __isNew__?: boolean;
};

// latestVersionId is required on every persisted statement; it is optional here because the UI
// mints client-side drafts, and an absent latestVersionId marks a statement as an unsaved draft
export type RosettaStoneStatement = Omit<RosettaStoneStatementRepresentation, 'latestVersionId'> & {
    latestVersionId?: string;
};

// relaxed flavor of the generated rosetta stone template requests — see PropertyShapeCreateParams
export type CreateRosettaStoneTemplateParams = {
    label: string;
    description: string;
    exampleUsage: string;
    formattedLabel: string;
    properties: PropertyShapeCreateParams[];
    organizations: string[];
    observatories: string[];
};

// label and exampleUsage are required by the generated update request, so a partial payload
// must still carry them — otherwise the mapper would have to invent blank values
export type UpdateRosettaStoneTemplateParams = Partial<CreateRosettaStoneTemplateParams> &
    Pick<CreateRosettaStoneTemplateParams, 'label' | 'exampleUsage'>;

export type CreateRosettaStoneStatementParams = CreateRosettaStoneStatementRequest;

export type UpdateRosettaStoneStatementParams = UpdateRosettaStoneStatementRequest;

export type UpdateTemplateParams = Partial<CreateTemplateParams>;

export type ContributionContentsStatements = {
    [key: string]: {
        id: string;
        statements?: ContributionContentsStatements;
    }[];
};

export type CreateContributionData = Omit<CreateContributionRequest, 'contribution' | 'extractionMethod'>;

export type CreatePaperContents = CreateContributionData & {
    contributions: ContributionRequestPart[];
};

export type CreateContribution = CreateContributionData & {
    contribution: ContributionRequestPart;
};

// The generated publication info types are stricter than the app actually is (nullable fields)
export type PaperPublicationInfoData = {
    publishedMonth?: number | null;
    publishedYear?: number | null;
    publishedIn?: string | null;
    url?: string | null;
};

export type CreatePaperParams = Omit<CreatePaperRequest, 'authors' | 'extractionMethod' | 'publicationInfo'> & {
    authors: UpdateAuthor[];
    extractionMethod?: ExtractionMethod;
    publicationInfo?: PaperPublicationInfoData;
};

export type UpdatePaperParams = Omit<UpdatePaperRequest, 'authors' | 'publicationInfo'> & {
    authors?: UpdateAuthor[];
    publicationInfo?: PaperPublicationInfoData;
};

export type Visualization = VisualizationRepresentation;

// The generated author request forbids the explicit null id the author forms produce
export type CreateVisualizationParams = Omit<CreateVisualizationRequest, 'authors'> & {
    authors: UpdateAuthor[];
};

export type ComparisonVersion = HeadVersionRepresentation;

export type ComparisonRelatedFigure = ComparisonRelatedFigureRepresentation;
export type ComparisonRelatedResource = ComparisonRelatedResourceRepresentation;

export type ComparisonSourceType = ComparisonDataSource['type'];

export type Comparison = ComparisonRepresentation;

export type ThingReference = ThingReferenceRepresentation;

export type ResourceThingReference = Extract<ThingReferenceRepresentation, { _class: 'resource_ref' }>;

export type LiteralThingReference = Extract<ThingReferenceRepresentation, { _class: 'literal_ref' }>;

export type SelectedPathValues = ComparisonTableRowRepresentation;

// derived client-side when the contents are pivoted into table columns
export type ComparisonTableValue = {
    value: ThingReference;
    children: {
        [pathId: string]: ComparisonTableValue[];
    };
};

export type ComparisonTableColumn = {
    title: ThingReference;
    subtitle: ThingReference | null;
    values: {
        [pathId: string]: ComparisonTableValue[];
    };
};

export type ComparisonPathType = LabeledComparisonPathRepresentation['type'];

export type ComparisonPath = LabeledComparisonPathRepresentation;

export type ComparisonSelectedPathFlattened = ComparisonPath & {
    path?: string[];
};

export type ComparisonUpdateSelectedPath = SimpleComparisonPath;

export type ComparisonTablePaths = ComparisonPath[];

export type ComparisonContents = ComparisonTableRepresentation;

// used for optimistic section content entries created before the backend responds
export type ReviewSectionData = {
    id: string;
    label: string;
    classes: string[];
    _class: string;
};

export type ReviewSectionType = SmartReviewSectionRepresentation['type'];

export type ReviewSection = SmartReviewSectionRepresentation;

export type ReviewSectionOntology = Extract<ReviewSection, { type: 'ontology' }>;

export type ReviewSectionContentLink = Extract<ReviewSection, { type: 'resource' | 'property' | 'visualization' }>;

export type ReviewSectionComparison = Extract<ReviewSection, { type: 'comparison' }>;

export type ReviewSectionComparisonPayload = SmartReviewComparisonSectionRequest;

export type ReviewSectionVisualizationPayload = SmartReviewVisualizationSectionRequest;

export type ReviewSectionResourcePayload = SmartReviewResourceSectionRequest;

export type ReviewSectionPredicatePayload = SmartReviewPredicateSectionRequest;

export type ReviewSectionOntologyPayload = SmartReviewOntologySectionRequest;

export type ReviewSectionTextPayload = SmartReviewTextSectionRequest;

export type ReviewPublishedContents = PublishedSmartReviewContentRepresentation;

export type Review = SmartReviewRepresentation;

export type LiteratureListSectionListEntry = EntryRepresentation;

export type LiteratureListSectionType = LiteratureListSectionRepresentation['type'];

export type LiteratureListSectionText = Extract<LiteratureListSectionRepresentation, { type: 'text' }>;
export type LiteratureListSectionList = Extract<LiteratureListSectionRepresentation, { type: 'list' }>;

export type LiteratureListSection = LiteratureListSectionRepresentation;

export type LiteratureList = LiteratureListRepresentation;

export type Verified = boolean | null;

export type SortByParam = {
    sortBy?: { property: string; direction: SortDirectionOptions }[];
};

export type PaginationParams = {
    page?: number;
    size?: number;
} & SortByParam;

export type WithPaginationParams<T> = Omit<T, 'sort'> & SortByParam;

export type VerifiedParam = {
    verified?: Verified;
};

export type VisibilityParam = {
    visibility?: VisibilityFilter;
};

export type VenueIdParam = {
    venue?: string;
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

/**
 * @deprecated Use `ProblemDetails` from `@/services/backend/problemDetails`, which models the
 * RFC 9457 (Problem Details) error format the backend now returns. Kept as an alias for back-compat.
 */
export type { ProblemDetails as ApiError } from '@/services/backend/problemDetails';

export type ContentType = Paper | Comparison | LiteratureList | Visualization | Review | Template | RosettaStoneTemplate;

export type Item = {
    _class: string;
} & (ContentType | Resource | RosettaStoneStatement);

export type Snapshot = TemplateBasedResourceSnapshotRepresentation;

export type PaperSections = 'contributions' | 'statements' | 'mentions';
