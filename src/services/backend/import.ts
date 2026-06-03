import { EntityImportApi, ImportImportClassByRequest, ImportImportPredicateByRequest } from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId } from '@/services/backend/backendApi';
import { getClassById } from '@/services/backend/classes';
import { getPredicate } from '@/services/backend/predicates';
import { getResource } from '@/services/backend/resources';
import { Class, Predicate, Resource } from '@/services/backend/types';

export const importUrl = `${urlNoTrailingSlash}/import`;

const importApiClient = new EntityImportApi(configuration);

export const importResourceByURI = (data: ImportImportClassByRequest): Promise<Resource> =>
    importApiClient
        .importResourceByRaw({ importImportClassByRequest: data })
        .then(getCreatedId)
        .then((id) => getResource(id));

export const importPredicateByURI = (data: ImportImportPredicateByRequest): Promise<Predicate> =>
    importApiClient
        .importPredicateByRaw({ importImportPredicateByRequest: data })
        .then(getCreatedId)
        .then((id) => getPredicate(id));

export const importClassByURI = (data: ImportImportClassByRequest): Promise<Class> =>
    importApiClient
        .importClassByRaw({ importImportClassByRequest: data })
        .then(getCreatedId)
        .then((id) => getClassById(id));
