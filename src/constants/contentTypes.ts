import { CLASSES } from '@/constants/graphSettings';
import { Certainty, Visibility, VisibilityFilter } from '@/services/backend/types';

const CONTENT_TYPES: string[] = [
    CLASSES.PAPER,
    CLASSES.CONTRIBUTION,
    CLASSES.COMPARISON,
    CLASSES.LITERATURE_LIST_PUBLISHED,
    CLASSES.SMART_REVIEW_PUBLISHED,
    CLASSES.VISUALIZATION,
    CLASSES.PROBLEM,
];

export const VISIBILITY_FILTERS: { [key: string]: VisibilityFilter } = {
    TOP_RECENT: 'combined',
    ALL_LISTED: 'ALL_LISTED',
    UNLISTED: 'UNLISTED',
    FEATURED: 'FEATURED',
    NON_FEATURED: 'NON_FEATURED',
    DELETED: 'DELETED',
} as const;

export const VISIBILITY: { [key: string]: Visibility } = {
    DEFAULT: 'DEFAULT',
    FEATURED: 'FEATURED',
    UNLISTED: 'UNLISTED',
    DELETED: 'DELETED',
};

export const CERTAINTY: { [key: string]: Certainty } = {
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
};

export default CONTENT_TYPES;
