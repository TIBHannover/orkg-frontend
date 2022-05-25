import { CLASSES, ENTITIES } from 'constants/graphSettings';

const DEFAULT_FILTERS = [
    {
        label: 'Author',
        labelPlural: 'Authors',
        id: CLASSES.AUTHOR,
        isCreatedByActive: true,
    },
    {
        label: 'Comparison',
        labelPlural: 'Comparisons',
        id: CLASSES.COMPARISON,
        isCreatedByActive: true,
    },
    {
        label: 'Paper',
        labelPlural: 'Papers',
        id: CLASSES.PAPER,
        isCreatedByActive: true,
    },
    {
        label: 'Research Problem',
        labelPlural: 'Research Problems',
        id: CLASSES.PROBLEM,
        isCreatedByActive: true,
    },
    {
        label: 'Template',
        labelPlural: 'Templates',
        id: CLASSES.TEMPLATE,
        isCreatedByActive: true,
    },
    {
        label: 'Venue',
        labelPlural: 'Venues',
        id: CLASSES.VENUE,
        isCreatedByActive: true,
    },
    {
        label: 'Visualization',
        labelPlural: 'Visualizations',
        id: CLASSES.VISUALIZATION,
        isCreatedByActive: true,
    },
    {
        label: 'Review',
        labelPlural: 'Reviews',
        id: CLASSES.SMART_REVIEW_PUBLISHED,
        isCreatedByActive: true,
    },
    {
        label: 'List',
        labelPlural: 'Lists',
        id: CLASSES.LITERATURE_LIST_PUBLISHED,
        isCreatedByActive: true,
    },
    {
        label: 'Resource',
        labelPlural: 'Resources',
        id: ENTITIES.RESOURCE,
        isCreatedByActive: false,
    },
    {
        label: 'Property',
        labelPlural: 'Properties',
        id: ENTITIES.PREDICATE,
        isCreatedByActive: false,
    },
    {
        label: 'Class',
        labelPlural: 'Classes',
        id: ENTITIES.CLASS,
        isCreatedByActive: false,
    },
];

export default DEFAULT_FILTERS;
