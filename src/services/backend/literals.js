import { url } from 'constants/misc';
import { submitPostRequest, submitPutRequest } from 'network';
import { MISC } from 'constants/graphSettings';

export const literalsUrl = `${url}literals/`;

export const updateLiteral = (id, label, datatype = undefined) => {
    return submitPutRequest(`${literalsUrl}${id}`, { 'Content-Type': 'application/json' }, { label: label, datatype: datatype });
};

export const createLiteral = (label, datatype = MISC.DEFAULT_LITERAL_DATATYPE) => {
    return submitPostRequest(literalsUrl, { 'Content-Type': 'application/json' }, { label: label, datatype: datatype });
};
