import { url as baseUrl } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { Class, Predicate, Resource } from '@/services/backend/types';

export const thingsUrl = `${baseUrl}things/`;
export const thingsApi = backendApi.extend(() => ({ prefixUrl: thingsUrl }));

export const getThing = (id: string) => thingsApi.get<Resource | Predicate | Class>(id).json();

export default getThing;
