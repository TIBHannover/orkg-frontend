import { CLASSES } from 'constants/graphSettings';

const contentTypes: string[] = [
    CLASSES.PAPER,
    CLASSES.CONTRIBUTION,
    CLASSES.COMPARISON,
    CLASSES.LITERATURE_LIST_PUBLISHED,
    CLASSES.SMART_REVIEW_PUBLISHED,
    CLASSES.VISUALIZATION,
    CLASSES.PROBLEM,
];

// Define the type for VISIBILITY_FILTERS using a const assertion
export const VISIBILITY_FILTERS = {
    ALL_LISTED: 'ALL_LISTED',
    UNLISTED: 'UNLISTED',
    FEATURED: 'FEATURED',
    NON_FEATURED: 'NON_FEATURED',
    DELETED: 'DELETED',
} as const;

export default contentTypes;
