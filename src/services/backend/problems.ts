import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { url } from 'constants/misc';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { Contributor, PaginatedResponse, Resource } from 'services/backend/types';

export const problemsUrl = `${url}problems/`;

export const getResearchFieldsByResearchProblemId = (
    problemId: string,
): Promise<
    {
        field: Resource;
        freq: number;
    }[]
> => submitGetRequest(`${problemsUrl}${encodeURIComponent(problemId)}/fields`);

export const getContributorsByResearchProblemId = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<
    {
        user: Contributor;
        contributions: number;
    }[]
> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/users?${params}`);
};

export type ResearchProblemTopAuthor = {
    author: {
        value: string | Resource;
    };
    papers: number;
};

export const getAuthorsByResearchProblemId = ({
    id,
    page = 0,
    size = 9999,
}: {
    id: string;
    page?: number;
    size?: number;
}): Promise<PaginatedResponse<ResearchProblemTopAuthor>> => {
    const params = qs.stringify(
        { page, size },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/authors?${params}`);
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
}): Promise<
    PaginatedResponse<{
        id: string;
        label: string;
        created_at: string;
        featured: boolean;
        unlisted: boolean;
        classes: string[];
        created_by: string;
    }>
> => {
    // Sort is not supported in this endpoint
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, sort, visibility, classes: classes.join(',') },
        {
            skipNulls: true,
        },
    );
    return submitGetRequest(`${problemsUrl}${encodeURIComponent(id)}/?${params}`);
};
