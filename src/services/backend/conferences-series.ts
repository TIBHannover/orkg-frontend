import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest } from 'network';
import { ConferenceSeries, PaginatedResponse } from 'services/backend/types';

export const conferenceSeriesUrl = `${url}conference-series/`;

export const createConference = (
    organization_id: string,
    name: string,
    url: string,
    display_id: string,
    metadata: {
        start_date: string;
        review_type: string;
    },
): Promise<ConferenceSeries> =>
    submitPostRequest(`${conferenceSeriesUrl}`, { 'Content-Type': 'application/json' }, { organization_id, name, display_id, url, metadata });

export const getConferencesSeries = (): Promise<PaginatedResponse<ConferenceSeries>> => submitGetRequest(`${conferenceSeriesUrl}`);

export const getSeriesListByConferenceId = (id: string): Promise<PaginatedResponse<ConferenceSeries>> =>
    submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/series`);

export const getConferenceById = (id: string): Promise<ConferenceSeries> => submitGetRequest(`${conferenceSeriesUrl}${encodeURIComponent(id)}/`);
