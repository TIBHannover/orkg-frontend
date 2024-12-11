import { url } from 'constants/misc';
import { MISC } from 'constants/graphSettings';
import { Literal } from 'services/backend/types';
import backendApi from 'services/backend/backendApi';

export const literalsUrl = `${url}literals/`;
export const literalsApi = backendApi.extend(() => ({ prefixUrl: literalsUrl }));

export const updateLiteral = (id: string, label: string, datatype: string | undefined = undefined) =>
    literalsApi.put<Literal>(id, { json: { label, datatype } }).json();

export const createLiteral = (label: string, datatype: string = MISC.DEFAULT_LITERAL_DATATYPE) =>
    literalsApi.post<Literal>('', { json: { label, datatype } }).json();
