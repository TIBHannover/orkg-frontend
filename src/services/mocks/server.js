import { setupServer } from 'msw/node';
import literals from './backend/literals';
import resources from './backend/resources';
import defaultHandlers from './defaultHandlers';

export const server = setupServer(...literals, ...resources, ...defaultHandlers);
