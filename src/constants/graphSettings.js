export const PREDICATES = {
    HAS_DOI: 'P26',
    HAS_VENUE: 'HAS_VENUE',
    HAS_AUTHOR: 'P27',
    HAS_PUBLICATION_MONTH: 'P28',
    HAS_PUBLICATION_YEAR: 'P29',
    HAS_RESEARCH_FIELD: 'P30',
    HAS_SUB_RESEARCH_FIELD: 'P36',
    HAS_CONTRIBUTION: 'P31',
    HAS_RESEARCH_PROBLEM: 'P32',
    HAS_ORCID: 'HAS_ORCID',
    TYPE: 'type',
    ICON: 'icon',
    ORDER: 'order',
    DESCRIPTION: 'description',
    URL: 'url',
    REFERENCE: 'reference',
    ON_HOMEPAGE: 'onHomepage',
    SAME_AS: 'SAME_AS',
    SUB_PROBLEM: 'subProblem',
    RELATED_RESOURCES: 'RelatedResource',
    RELATED_FIGURE: 'RelatedFigure',
    IMAGE: 'Image',
    TEMPLATE_OF_RESEARCH_FIELD: 'TemplateOfResearchField',
    TEMPLATE_OF_RESEARCH_PROBLEM: 'TemplateOfResearchProblem',
    TEMPLATE_OF_PREDICATE: 'TemplateOfPredicate',
    TEMPLATE_OF_CLASS: 'TemplateOfClass',
    TEMPLATE_SUB_TEMPLATE: 'TemplateSub',
    TEMPLATE_COMPONENT: 'TemplateComponent',
    TEMPLATE_COMPONENT_PROPERTY: 'TemplateComponentProperty',
    TEMPLATE_COMPONENT_VALUE: 'TemplateComponentValue',
    TEMPLATE_COMPONENT_VALIDATION_RULE: 'TemplateComponentValidationRule',
    TEMPLATE_COMPONENT_OCCURRENCE_MAX: 'TemplateComponentOccurrenceMax',
    TEMPLATE_COMPONENT_OCCURRENCE_MIN: 'TemplateComponentOccurrenceMin',
    TEMPLATE_COMPONENT_ORDER: 'TemplateComponentOrder',
    TEMPLATE_STRICT: 'TemplateStrict',
    TEMPLATE_LABEL_FORMAT: 'TemplateLabelFormat',
    HAS_PART: 'HasPart',
    HAS_CONTENT: 'hasContent',
    CONTAINS: 'contains',
    COMPARE_CONTRIBUTION: 'compareContribution',
    HAS_PROPERTY: 'hasProperty',
    HAS_PREVIOUS_VERSION: 'hasPreviousVersion',
    HAS_SUBJECT: 'hasSubject',
    HAS_SECTION: 'HasSection',
    HAS_LINK: 'HasLink',
    HAS_VISUALIZATION: 'hasVisualization',
    HAS_PAPER: 'HasPaper',
    SHOW_PROPERTY: 'ShowProperty',
    HAS_ENTITY: 'HasEntity'
};

export const CLASSES = {
    PAPER: 'Paper',
    PAPER_DELETED: 'PaperDeleted',
    FEATURED_PAPER: 'FeaturedPaper',
    RESEARCH_FIELD: 'ResearchField',
    CONTRIBUTION: 'Contribution',
    CONTRIBUTION_DELETED: 'ContributionDeleted',
    PROBLEM: 'Problem',
    AUTHOR: 'Author',
    VENUE: 'Venue',
    COMPARISON: 'Comparison',
    FEATURED_COMPARISON: 'FeaturedComparison',
    FEATURED_COMPARISON_CATEGORY: 'FeaturedComparisonCategory',
    FEATURED_COMPARISON_HOME_PAGE: 'FeaturedComparisonHomePage',
    TEMPLATE: 'ContributionTemplate',
    PREDICATE: 'Predicates',
    CLASS: 'Classes',
    QB_DATASET_CLASS: 'QBDataset',
    LOCATION: 'DCLocation',
    SENTENCE: 'Sentence',
    SMART_REVIEW: 'SmartReview',
    SMART_REVIEW_PUBLISHED: 'SmartReviewPublished',
    SECTION: 'Section',
    CONTRIBUTION_SMART_REVIEW: 'ContributionSmartReview',
    RESOURCE_SECTION: 'ResourceSection',
    PROPERTY_SECTION: 'PropertySection',
    COMPARISON_SECTION: 'ComparisonSection',
    VISUALIZATION_SECTION: 'VisualizationSection',
    ONTOLOGY_SECTION: 'OntologySection',
    VISUALIZATION: 'Visualization'
};

export const MISC = {
    RESEARCH_FIELD_MAIN: 'R11',
    DEFAULT_LITERAL_DATATYPE: 'xsd:string',
    UNKNOWN_ID: '00000000-0000-0000-0000-000000000000'
};

/* entities usually are returned by the backend (in _class) to specify the type of node  */
export const ENTITIES = {
    CLASS: 'class',
    PREDICATE: 'predicate',
    RESOURCE: 'resource',
    LITERAL: 'literal'
};
