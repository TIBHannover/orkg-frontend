import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const DEDICATED_PAGE_LINKS = {
    [CLASSES.PAPER]: {
        label: 'Paper',
        route: ROUTES.VIEW_PAPER,
        routeParams: 'resourceId',
    },
    [CLASSES.PAPER_VERSION]: {
        label: 'Paper',
        route: ROUTES.VIEW_PAPER,
        routeParams: 'resourceId',
    },
    [CLASSES.PROBLEM]: {
        label: 'Research problem',
        route: ROUTES.RESEARCH_PROBLEM,
        routeParams: 'researchProblemId',
        hasSlug: true,
    },
    [CLASSES.COMPARISON]: {
        label: 'Comparison',
        route: ROUTES.COMPARISON,
        routeParams: 'comparisonId',
    },
    [CLASSES.COMPARISON_PUBLISHED]: {
        label: 'Comparison',
        route: ROUTES.COMPARISON,
        routeParams: 'comparisonId',
    },
    [CLASSES.AUTHOR]: {
        label: 'Author',
        route: ROUTES.AUTHOR_PAGE,
        routeParams: 'authorId',
    },
    [CLASSES.RESEARCH_FIELD]: {
        label: 'Research field',
        route: ROUTES.RESEARCH_FIELD,
        routeParams: 'researchFieldId',
        hasSlug: true,
    },
    [CLASSES.VENUE]: {
        label: 'Venue',
        route: ROUTES.VENUE_PAGE,
        routeParams: 'venueId',
    },
    [CLASSES.NODE_SHAPE]: {
        label: 'Template',
        route: ROUTES.TEMPLATE,
        routeParams: 'id',
    },
    [CLASSES.CONTRIBUTION]: {
        label: 'Contribution',
        route: ROUTES.CONTRIBUTION,
        routeParams: 'id',
    },
    [CLASSES.SMART_REVIEW]: {
        label: 'Review',
        route: ROUTES.REVIEW,
        routeParams: 'id',
    },
    [CLASSES.SMART_REVIEW_PUBLISHED]: {
        label: 'Review',
        route: ROUTES.REVIEW,
        routeParams: 'id',
    },
    [CLASSES.LITERATURE_LIST]: {
        label: 'List',
        route: ROUTES.LIST,
        routeParams: 'id',
    },
    [CLASSES.LITERATURE_LIST_PUBLISHED]: {
        label: 'List',
        route: ROUTES.LIST,
        routeParams: 'id',
    },
    [CLASSES.ROSETTA_STONE_STATEMENT]: {
        label: 'Statement',
        route: ROUTES.RS_STATEMENT,
        routeParams: 'id',
    },
    [CLASSES.ROSETTA_NODE_SHAPE]: {
        label: 'Statement template',
        route: ROUTES.RS_TEMPLATE,
        routeParams: 'id',
    },
};

export default DEDICATED_PAGE_LINKS;
