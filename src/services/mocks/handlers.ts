import classes from '@/services/mocks/backend/classes';
import literals from '@/services/mocks/backend/literals';
import predicates from '@/services/mocks/backend/predicates';
import resources from '@/services/mocks/backend/resources';
import statements from '@/services/mocks/backend/statements';
import tables from '@/services/mocks/backend/tables';
import templates from '@/services/mocks/backend/templates';
import things from '@/services/mocks/backend/things';
import defaultHandlers from '@/services/mocks/defaultHandlers';
import geonames from '@/services/mocks/geonames';
import wikidata from '@/services/mocks/wikidata';

export const handlers = [
    ...literals,
    ...resources,
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
