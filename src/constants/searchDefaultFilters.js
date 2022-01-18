import { CLASSES, ENTITIES } from 'constants/graphSettings';

const DEFAULT_FILTERS = [
    {
        label: 'Author',
        labelPlural: 'Authors',
        id: CLASSES.AUTHOR,
        isByMeActive: true
    },
    {
        label: 'Comparison',
        labelPlural: 'Comparisons',
        id: CLASSES.COMPARISON,
        isByMeActive: true
    },
    {
        label: 'Paper',
        labelPlural: 'Papers',
        id: CLASSES.PAPER,
        isByMeActive: true
    },
    {
        label: 'Research Problem',
        labelPlural: 'Research Problems',
        id: CLASSES.PROBLEM,
        isByMeActive: true
    },
    {
        label: 'Template',
        labelPlural: 'Templates',
        id: CLASSES.TEMPLATE,
        isByMeActive: true
    },
    {
        label: 'Venue',
        labelPlural: 'Venues',
        id: CLASSES.VENUE,
        isByMeActive: true
    },
    {
        label: 'Visualization',
        labelPlural: 'Visualizations',
        id: CLASSES.VISUALIZATION,
        isByMeActive: true
    },
    {
        label: 'SmartReview',
        labelPlural: 'SmartReviews',
        id: CLASSES.SMART_REVIEW_PUBLISHED,
        isByMeActive: true
    },
    {
        label: 'Literature List',
        labelPlural: 'Literature Lists',
        id: CLASSES.LITERATURE_LIST_PUBLISHED,
        isByMeActive: true
    },
    {
        label: 'Resource',
        labelPlural: 'Resources',
        id: ENTITIES.RESOURCE,
        isByMeActive: false
    },
    {
        label: 'Property',
        labelPlural: 'Properties',
        id: ENTITIES.PREDICATE,
        isByMeActive: false
    },
    {
        label: 'Class',
        labelPlural: 'Classes',
        id: ENTITIES.CLASS,
        isByMeActive: false
    }
];

export default DEFAULT_FILTERS;
