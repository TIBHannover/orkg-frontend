import { url } from 'constants/misc';
import { Class, Predicate, Resource } from 'services/backend/types';
import { getResource } from 'services/backend/resources';
import { getPredicate } from 'services/backend/predicates';
import { getClassById } from 'services/backend/classes';
import backendApi, { getCreatedIdFromHeaders } from 'services/backend/backendApi';

export const importUrl = `${url}import/`;
export const importApi = backendApi.extend(() => ({ prefixUrl: importUrl }));

export const importResourceByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Resource> =>
    importApi
        .post<Resource>(`resources`, { json: { ontology, uri } })
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getResource(id));

export const importPredicateByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Predicate> =>
    importApi
        .post<Predicate>(`predicates`, { json: { ontology, uri } })
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getPredicate(id));

export const importClassByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Class> =>
    importApi
        .post<Class>(`classes`, { json: { ontology, uri } })
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getClassById(id));
