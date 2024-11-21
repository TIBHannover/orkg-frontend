import { url } from 'constants/misc';
import { submitDeleteRequest, submitGetRequest, submitPostRequest, submitPutRequest } from 'network';
import qs from 'qs';
import { PaginatedResponse, PaginationParams, Predicate } from 'services/backend/types';

export const predicatesUrl = `${url}predicates/`;

export const getPredicate = (id: string): Promise<Predicate> => submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);

export const getPredicatesByIds = (ids: string[]): Promise<Predicate[]> => Promise.all(ids.map((id) => getPredicate(id)));

export const createPredicate = (label: string, id: string | undefined = undefined): Promise<Predicate> =>
    submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label, id });

export const updatePredicate = (id: string, label: string): Promise<Predicate> =>
    submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label });

export const deletePredicate = (id: string): Promise<null> => submitDeleteRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' });

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
}: GetPredicatesParams<T>): Promise<T extends true ? Predicate[] : PaginatedResponse<Predicate>> => {
    const sort = sortBy.map(({ property, direction }) => `${property},${direction}`).join(',');
    const params = qs.stringify(
        { page, size, exact, ...(q ? { q } : { sort }) },
        {
            skipNulls: true,
            arrayFormat: 'repeat',
        },
    );

    return submitGetRequest(`${predicatesUrl}?${params}`).then((res) => (returnContent ? res.content : res));
};
