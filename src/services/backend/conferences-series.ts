import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { ConferenceSeries, PaginatedResponse } from '@/services/backend/types';

export const conferenceSeriesUrl = `${url}conference-series/`;
// the entire /conference-series resource is absent from the generated client (reported spec
// gap), so this service stays on ky until the spec covers it. Note the wire mixes cases:
// organizationId is camelCase while display_id and metadata.* are snake_case.
const conferenceSeriesApi = backendApi.extend(() => ({ prefixUrl: conferenceSeriesUrl }));

export const createConference = (
    organization_id: string,
    name: string,
    _url: string,
    display_id: string,
    metadata: {
        start_date: string;
        review_type: string;
    },
) =>
    conferenceSeriesApi
        .post<ConferenceSeries>('', { json: { organization_id, name, display_id, url: _url, metadata } })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const getConferencesSeries = () => conferenceSeriesApi.get<PaginatedResponse<ConferenceSeries>>('').json();

export const getSeriesListByConferenceId = (id: string) =>
    conferenceSeriesApi.get<PaginatedResponse<ConferenceSeries>>(`${encodeURIComponent(id)}/series`).json();

export const getConferenceById = (id: string) => conferenceSeriesApi.get<ConferenceSeries>(encodeURIComponent(id)).json();
