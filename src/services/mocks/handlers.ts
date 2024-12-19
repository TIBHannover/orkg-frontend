import literals from 'services/mocks/backend/literals';
import resources from 'services/mocks/backend/resources';
import predicates from 'services/mocks/backend/predicates';
import statements from 'services/mocks/backend/statements';
import templates from 'services/mocks/backend/templates';
import classes from 'services/mocks/backend/classes';
import things from 'services/mocks/backend/things';
import tables from 'services/mocks/backend/tables';
import geonames from 'services/mocks/geonames';
import wikidata from 'services/mocks/wikidata';
import defaultHandlers from 'services/mocks/defaultHandlers';

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
