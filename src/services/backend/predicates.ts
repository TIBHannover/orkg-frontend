import qs from 'qs';

import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { PaginatedResponse, PaginationParams, Predicate } from '@/services/backend/types';

export const predicatesUrl = `${url}predicates/`;
export const predicatesApi = backendApi.extend(() => ({ prefixUrl: predicatesUrl }));

export const getPredicate = (id: string) => predicatesApi.get<Predicate>(encodeURIComponent(id)).json();

export const getPredicatesByIds = (ids: string[]): Promise<Predicate[]> => Promise.all(ids.map((id) => getPredicate(id)));

export const createPredicate = (label: string, id: string | undefined = undefined) =>
    predicatesApi
        .post<Predicate>('', {
            json: {
                label,
                id,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updatePredicate = (id: string, label: string) => predicatesApi.put<Predicate>(encodeURIComponent(id), { json: { label } }).json();

export const deletePredicate = (id: string) => predicatesApi.delete<void>(id);

export type GetPredicatesParams<T extends boolean = false> = {
    q?: string | null;
    exact?: boolean;
    returnContent?: T;
} & PaginationParams;

export const getPredicates = <T extends boolean = false>({
    page = 0,
    size = 9999,
    sortBy = [{ property: 'created_at', direction: 'desc' }],
    q = null,
    exact = false,
    returnContent = false as T,
}: GetPredicatesParams<T>) => {
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const searchParams = qs.stringify(
        { page, size, exact, ...(q ? { q } : { sort }) },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return predicatesApi
        .get<PaginatedResponse<Predicate>>('', {
            searchParams,
        })
        .json()
        .then((res) => (returnContent ? res.content : res)) as Promise<T extends true ? Predicate[] : PaginatedResponse<Predicate>>;
};
