import { PredicatesApi, PredicatesApiFindAllRequest } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { Pagination, Predicate, WithPaginationParams } from '@/services/backend/types';

export const predicatesUrl = `${urlNoTrailingSlash}/predicates`;

const predicatesApi = new PredicatesApi(configuration);

export const getPredicate = (id: string) => predicatesApi.findById({ id });

export const getPredicatesByIds = (ids: string[]): Promise<Predicate[]> => Promise.all(ids.map((id) => getPredicate(id)));

export const createPredicate = (label: string, id: string | undefined = undefined) =>
    predicatesApi.createRaw({ createPredicateRequest: { label, id } }).then(getCreatedId);

export const updatePredicate = (id: string, label: string) => predicatesApi.update({ id, updatePredicateRequest: { label } });

export const deletePredicate = (id: string) => predicatesApi.deleteById({ id });

export type GetPredicatesParams<T extends boolean = false> = WithPaginationParams<PredicatesApiFindAllRequest> & {
    returnContent?: T;
};

export const getPredicates = <T extends boolean = false>({ returnContent = false as T, ...params }: GetPredicatesParams<T>) =>
    predicatesApi.findAll(transformPaginationParams(params)).then((res) => (returnContent ? res.content : res)) as Promise<
        T extends true ? Predicate[] : Pagination<Predicate>
    >;
