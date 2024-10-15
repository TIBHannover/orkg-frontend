import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    PublishedParam,
    Review,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
    ResearchFieldIdParams,
} from 'services/backend/types';

export const reviewUrl = `${url}smart-reviews/`;

export const getReviews = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    created_by,
    observatory_id,
    research_field,
    include_subfields,
    sdg,
    published,
}: PaginationParams &
    VerifiedParam &
    VisibilityParam &
    CreatedByParam &
    PublishedParam &
    SdgParam &
    ObservatoryIdParam &
    ResearchFieldIdParams): Promise<PaginatedResponse<Review>> => {
    const params = prepareParams({
        page,
        size,
        sortBy,
        verified,
        visibility,
        created_by,
        observatory_id,
        sdg,
        published,
        research_field,
        include_subfields,
    });
    return submitGetRequest(`${reviewUrl}?${params}`);
};
