import { url } from 'constants/misc';
import { submitPostRequest, submitPutRequest } from 'network';
import { MISC } from 'constants/graphSettings';
import { Literal } from 'services/backend/types';

export const literalsUrl = `${url}literals/`;

export const updateLiteral = (id: string, label: string, datatype: string | undefined = undefined): Promise<Literal> =>
    submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label, datatype });

export const createLiteral = (label: string, datatype: string = MISC.DEFAULT_LITERAL_DATATYPE): Promise<Literal> =>
    submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label, datatype });
