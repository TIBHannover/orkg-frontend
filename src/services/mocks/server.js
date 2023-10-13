import { setupServer } from 'msw/node';
import literals from 'services/mocks/backend/literals';
import resources from 'services/mocks/backend/resources';
import predicates from 'services/mocks/backend/predicates';
import statements from 'services/mocks/backend/statements';
import classes from 'services/mocks/backend/classes';
import geonames from 'services/mocks/geonames/index';
import wikidata from 'services/mocks/wikidata/index';
import defaultHandlers from 'services/mocks/defaultHandlers';

export const server = setupServer(...literals, ...resources, ...predicates, ...statements, ...classes, ...geonames, ...wikidata, ...defaultHandlers);
