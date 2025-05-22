import { CLASSES } from '@/constants/graphSettings';

const DEFAULT_FILTERS = [
    {
        label: 'Comparison',
        id: CLASSES.COMPARISON_PUBLISHED,
    },
    {
        label: 'Paper',
        id: CLASSES.PAPER,
    },
    {
        label: 'Author',
        id: CLASSES.AUTHOR,
    },
    {
        label: 'Research field',
        id: CLASSES.RESEARCH_FIELD,
    },
    {
        label: 'Research problem',
        id: CLASSES.PROBLEM,
    },
    {
        label: 'Resource',
        id: 'Resource',
    },
    {
        label: 'Property',
        id: 'Predicate',
    },
    {
        label: 'Class',
        id: 'Class',
    },
    {
        label: 'Literal',
        id: 'Literal',
    },
    {
        label: 'Template',
        id: CLASSES.NODE_SHAPE,
    },
    {
        label: 'Venue',
        id: CLASSES.VENUE,
    },
    {
        label: 'Visualization',
        id: CLASSES.VISUALIZATION,
    },
    {
        label: 'Review',
        id: CLASSES.SMART_REVIEW_PUBLISHED,
    },
    {
        label: 'List',
        id: CLASSES.LITERATURE_LIST_PUBLISHED,
    },
];

export default DEFAULT_FILTERS;
