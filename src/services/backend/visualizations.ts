/* eslint-disable import/prefer-default-export */
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import { prepareParams } from 'services/backend/misc';
import { PaginatedResponse, PaginationParams, VerifiedParam, VisibilityParam, Visualization } from 'services/backend/types';

export const visualizationsUrl = `${url}visualizations/`;

export const getVisualizations = ({
    page = 0,
    size = 999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    verified = null,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
}: PaginationParams & VerifiedParam & VisibilityParam): Promise<PaginatedResponse<Visualization>> => {
    const params = prepareParams({ page, size, sortBy, verified, visibility });
    return submitGetRequest(`${visualizationsUrl}?${params}`);
};
