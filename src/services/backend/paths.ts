import qs from 'qs';

import { url } from '@/constants/misc';
import backendApi from '@/services/backend/backendApi';
import { PaginatedResponse, PaginationParams, Resource } from '@/services/backend/types';

export const papersUrl = `${url}papers/`;
export const papersApi = backendApi.extend(() => ({ prefixUrl: papersUrl }));

export const getPapersLinkedToResource = async ({
    id,
    page = 0,
    size = 9999,
    sortBy = [{ property: 'paper.created_at', direction: 'desc' }],
    returnContent = false,
}: {
    id: string;
    returnContent?: boolean;
} & PaginationParams) => {
    const searchParams = qs.stringify(
        { linked_to: id, page, size },
        {
            skipNulls: true,
        },
    );

    const resources = await papersApi
        .get<
            PaginatedResponse<
                Resource & {
                    path: Resource[][];
                }
            >
        >('', {
            searchParams,
        })
        .json()
        .then((res) => (returnContent ? res.content : res));
    return resources;
};
