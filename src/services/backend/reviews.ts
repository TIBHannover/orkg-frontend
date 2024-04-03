import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    Review,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
} from 'services/backend/types';

export const reviewUrl = `${url}smart-reviews/`;

export const getReviews = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    sdg,
    published,
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & PublishedParam): Promise<PaginatedResponse<Review>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, sdg, published });
    return submitGetRequest(`${reviewUrl}?${params}`);
};
