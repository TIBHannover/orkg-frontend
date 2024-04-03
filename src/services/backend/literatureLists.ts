import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    LiteratureList,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const lists = `${url}literature-lists/`;

export const getLiteratureLists = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    sdg,
    published,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & PublishedParam): Promise<PaginatedResponse<LiteratureList>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, sdg, published });
    return submitGetRequest(`${lists}?${params}`);
};
