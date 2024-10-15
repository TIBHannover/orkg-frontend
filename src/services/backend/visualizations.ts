/* eslint-disable import/prefer-default-export */
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import {
    CreatedByParam,
    ObservatoryIdParam,
    PaginatedResponse,
    PaginationParams,
    ResearchFieldIdParams,
    SdgParam,
    VerifiedParam,
    VisibilityParam,
    Visualization,
} from 'services/backend/types';

export const visualizationsUrl = `${url}visualizations/`;

export const getVisualizations = ({
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
}: PaginationParams & VerifiedParam & VisibilityParam & CreatedByParam & SdgParam & ObservatoryIdParam & ResearchFieldIdParams): Promise<
    PaginatedResponse<Visualization>
> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility, created_by, observatory_id, sdg, research_field, include_subfields });
    return submitGetRequest(`${visualizationsUrl}?${params}`);
};
