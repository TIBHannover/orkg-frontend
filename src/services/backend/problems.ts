import qs from 'qs';

import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { Contributor, PaginatedResponse, Resource } from '@/services/backend/types';

export const problemsUrl = `${url}problems/`;
export const problemsApi = backendApi.extend(() => ({ prefixUrl: problemsUrl }));

export const getResearchFieldsByResearchProblemId = (problemId: string) =>
    problemsApi
        .get<
            {
                field: Resource;
                freq: number;
            }[]
        >(`${encodeURIComponent(problemId)}/fields`)
        .json();

export const getContributorsByResearchProblemId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return problemsApi
        .get<
            {
                user: Contributor;
                contributions: number;
            }[]
        >(`${encodeURIComponent(id)}/users`, {
            searchParams,
        })
        .json();
};

export type ResearchProblemTopAuthor = {
    author: {
        value: string | Resource;
    };
    papers: number;
};

export const getAuthorsByResearchProblemId = ({ id, page = 0, size = 9999 }: { id: string; page?: number; size?: number }) => {
    const searchParams = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return problemsApi
        .get<PaginatedResponse<ResearchProblemTopAuthor>>(`${encodeURIComponent(id)}/authors`, {
            searchParams,
        })
        .json();
};
