import { url as baseUrl } from 'constants/misc';
import { submitGetRequest } from 'network';
import { Class, Predicate, Resource } from 'services/backend/types';

export const thingsUrl = `${baseUrl}things/`;

export const getThing = (id: string): Promise<Resource | Predicate | Class> => submitGetRequest(`${thingsUrl}${id}/`);

export default getThing;
