import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { ConferenceSeries, PaginatedResponse } from '@/services/backend/types';

export const conferenceSeriesUrl = `${url}conference-series/`;
export const conferenceSeriesApi = backendApi.extend(() => ({ prefixUrl: conferenceSeriesUrl }));

export const createConference = (
    organization_id: string,
    name: string,
    url: string,
    display_id: string,
    metadata: {
        start_date: string;
        review_type: string;
    },
) => conferenceSeriesApi.post<ConferenceSeries>('', { json: { organization_id, name, display_id, url, metadata } }).json();

export const getConferencesSeries = () => conferenceSeriesApi.get<PaginatedResponse<ConferenceSeries>>('').json();

export const getSeriesListByConferenceId = (id: string) =>
    conferenceSeriesApi.get<PaginatedResponse<ConferenceSeries>>(`${encodeURIComponent(id)}/series`).json();

export const getConferenceById = (id: string) => conferenceSeriesApi.get<ConferenceSeries>(encodeURIComponent(id)).json();
