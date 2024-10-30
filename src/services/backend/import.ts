import { url } from 'constants/misc';
import { getCreatedIdFromHeaders, submitPostRequest } from 'network';
import { Class, Predicate, Resource } from 'services/backend/types';
import { getResource } from 'services/backend/resources';
import { getPredicate } from 'services/backend/predicates';
import { getClassById } from 'services/backend/classes';

export const importUrl = `${url}import/`;

export const importResourceByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Resource> =>
    submitPostRequest(`${importUrl}resources/`, { 'Content-Type': 'application/json' }, { ontology, uri }, true, true, true, true)
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getResource(id));

export const importPredicateByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Predicate> =>
    submitPostRequest(`${importUrl}predicates/`, { 'Content-Type': 'application/json' }, { ontology, uri }, true, true, true, true)
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getPredicate(id));

export const importClassByURI = ({ ontology, uri }: { ontology: string; uri: string }): Promise<Class> =>
    submitPostRequest(`${importUrl}classes/`, { 'Content-Type': 'application/json' }, { ontology, uri }, true, true, true, true)
        .then(({ headers }) => getCreatedIdFromHeaders(headers))
        .then((id) => getClassById(id));
