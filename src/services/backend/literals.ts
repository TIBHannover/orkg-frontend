import { MISC } from '@/constants/graphSettings';
import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { Literal } from '@/services/backend/types';

export const literalsUrl = `${url}literals/`;
export const literalsApi = backendApi.extend(() => ({ prefixUrl: literalsUrl }));

export const getLiteral = (id: string) => literalsApi.get<Literal>(id).json();

export const updateLiteral = (id: string, label: string, datatype: string | undefined = undefined) =>
    literalsApi.put<Literal>(id, { json: { label, datatype } }).json();

export const createLiteral = (label: string, datatype: string = MISC.DEFAULT_LITERAL_DATATYPE) =>
    literalsApi.post<Literal>('', { json: { label, datatype } }).then(({ headers }) => getCreatedIdFromHeaders(headers));
