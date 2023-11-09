import { submitPostRequest, submitPutRequest, submitGetRequest, submitDeleteRequest } from 'network';
import qs from 'qs';
import { url } from 'constants/misc';
import { PaginatedResponse, Predicate } from 'services/backend/types';

export const predicatesUrl = `${url}predicates/`;

export const getPredicate = (id: string): Promise<Predicate> => submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);

export const createPredicate = (label: string, id: string | undefined = undefined): Promise<Predicate> =>
    submitPostRequest(predicatesUrl, { 'Content-Type': 'application/json' }, { label, id });

export const updatePredicate = (id: string, label: string): Promise<Predicate> =>
    submitPutRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' }, { label });

export const deletePredicate = (id: string): Promise<null> => submitDeleteRequest(`${predicatesUrl}${id}`, { 'Content-Type': 'application/json' });

export const getPredicates = ({
    page = 0,
    items: size = 9999,
    sortBy = 'created_at',
    desc = true,
    q = null,
    exact = false,
    returnContent = false,
}: {
    page?: number;
    items?: number;
    sortBy?: string;
    desc?: boolean;
    q?: string | null;
    exact?: boolean;
    returnContent?: boolean;
}): Promise<PaginatedResponse<Predicate> | Predicate[]> => {
    const sort = `${sortBy},${desc ? 'desc' : 'asc'}`;
    const params = qs.stringify(
        { page, size, exact, ...(q ? { q } : { sort }) },
        {
            skipNulls: true,
        },
    );

    return submitGetRequest(`${predicatesUrl}?${params}`).then(res => (returnContent ? res.content : res));
};
