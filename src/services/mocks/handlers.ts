import classes from '@/services/mocks/backend/classes';
import comparisons from '@/services/mocks/backend/comparisons';
import contentTypes from '@/services/mocks/backend/contentTypes';
import literals from '@/services/mocks/backend/literals';
import literatureLists from '@/services/mocks/backend/literatureLists';
import papers from '@/services/mocks/backend/papers';
import predicates from '@/services/mocks/backend/predicates';
import resources from '@/services/mocks/backend/resources';
import reviews from '@/services/mocks/backend/reviews';
import statements from '@/services/mocks/backend/statements';
import tables from '@/services/mocks/backend/tables';
import templates from '@/services/mocks/backend/templates';
import things from '@/services/mocks/backend/things';
import visualizations from '@/services/mocks/backend/visualizations';
import defaultHandlers from '@/services/mocks/defaultHandlers';
import geonames from '@/services/mocks/geonames';
import wikidata from '@/services/mocks/wikidata';

export const handlers = [
    ...literals,
    ...resources,
    ...papers,
    ...comparisons,
    ...visualizations,
    ...literatureLists,
    ...reviews,
    ...contentTypes,
    ...predicates,
    ...statements,
    ...templates,
    ...classes,
    ...things,
    ...tables,
    ...geonames,
    ...wikidata,
    ...defaultHandlers,
];

export default handlers;
