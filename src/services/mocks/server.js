import { setupServer } from 'msw/node';
import literals from './backend/literals';
import resources from './backend/resources';
import predicates from './backend/predicates';
import statements from './backend/statements';
import defaultHandlers from './defaultHandlers';

export const server = setupServer(...literals, ...resources, ...predicates, ...statements, ...defaultHandlers);
