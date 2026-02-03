import { LiteralsApi } from '@orkg/orkg-client';

import { MISC } from '@/constants/graphSettings';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId } from '@/services/backend/backendApi';

// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const literalsUrl = `${urlNoTrailingSlash}/literals`;

const literalsApi = new LiteralsApi(configuration);

export const getLiteral = (id: string) => literalsApi.findById({ id });

export const updateLiteral = (id: string, label: string, datatype: string | undefined = undefined) =>
    literalsApi.update({ id, updateLiteralRequest: { label, datatype } });

export const createLiteral = (label: string, datatype: string = MISC.DEFAULT_LITERAL_DATATYPE) =>
    literalsApi.createRaw({ createLiteralRequest: { label, datatype } }).then(getCreatedId);
