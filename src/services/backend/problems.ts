import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import qs from 'qs';
import backendApi from 'services/backend/backendApi';
import { Contributor, PaginatedResponse, Resource } from 'services/backend/types';

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

export const getContentByResearchProblemIdAndClasses = ({
    id,
    page = 0,
    size = 9999,
    sortBy = 'created_at',
    desc = true,
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    classes = [],
}: {
    id: string;
    page?: number;
    size?: number;
    sortBy?: string;
    desc?: boolean;
    visibility?: string;
    classes?: string[];
}) => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const searchParams = qs.stringify(
        { page, size, sort, visibility, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return problemsApi
        .get<
            PaginatedResponse<{
                id: string;
                label: string;
                created_at: string;
                featured: boolean;
                unlisted: boolean;
                classes: string[];
                created_by: string;
            }>
        >(encodeURIComponent(id), {
            searchParams,
        })
        .json();
};
