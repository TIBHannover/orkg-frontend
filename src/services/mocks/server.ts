import { setupServer } from 'msw/node';

import { handlers } from 'services/mocks/handlers';

const server = setupServer(...handlers);

export default server;
