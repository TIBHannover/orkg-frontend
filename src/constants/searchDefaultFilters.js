import { CLASSES, ENTITIES } from 'constants/graphSettings';

const DEFAULT_FILTERS = [
    {
        label: 'Comparison',
        id: CLASSES.COMPARISON,
        isCreatedByActive: true,
    },
    {
        label: 'Paper',
        id: CLASSES.PAPER,
        isCreatedByActive: true,
    },
    {
        label: 'Research field',
        id: CLASSES.RESEARCH_FIELD,
        isCreatedByActive: false,
    },
    {
        label: 'Research problem',
        id: CLASSES.PROBLEM,
        isCreatedByActive: true,
    },
    {
        label: 'Author',
        id: CLASSES.AUTHOR,
        isCreatedByActive: true,
    },
    {
        label: 'Template',
        id: CLASSES.TEMPLATE,
        isCreatedByActive: true,
    },
    {
        label: 'Venue',
        id: CLASSES.VENUE,
        isCreatedByActive: true,
    },
    {
        label: 'Visualization',
        id: CLASSES.VISUALIZATION,
        isCreatedByActive: true,
    },
    {
        label: 'Review',
        id: CLASSES.SMART_REVIEW_PUBLISHED,
        isCreatedByActive: true,
    },
    {
        label: 'List',
        id: CLASSES.LITERATURE_LIST_PUBLISHED,
        isCreatedByActive: true,
    },
    {
        label: 'Resource',
        id: ENTITIES.RESOURCE,
        isCreatedByActive: false,
    },
    {
        label: 'Property',
        id: ENTITIES.PREDICATE,
        isCreatedByActive: false,
    },
    {
        label: 'Class',
        id: ENTITIES.CLASS,
        isCreatedByActive: false,
    },
];

export default DEFAULT_FILTERS;
