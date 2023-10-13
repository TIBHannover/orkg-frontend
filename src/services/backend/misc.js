import { url } from 'constants/misc';
import { ENTITIES } from 'constants/graphSettings';
import { submitGetRequest, submitPostRequest } from 'network';
import { getClasses, getClassById } from 'services/backend/classes';
import { getPredicates, getPredicate } from 'services/backend/predicates';
import { getResources, getResource } from 'services/backend/resources';

export const doisUrl = `${url}dois/`;

export const getPaperByDOI = doi => submitGetRequest(`${url}widgets/?doi=${encodeURIComponent(doi)}`);

export const getPaperByTitle = title => submitGetRequest(`${url}widgets/?title=${title}`);

export const generateDoi = ({ type, resource_type, resource_id, title, subject, description, related_resources = [], authors = [], url }) =>
    submitPostRequest(
        doisUrl,
        { 'Content-Type': 'application/json' },
        { type, resource_type, resource_id, title, subject, description, related_resources, authors, url },
    );

export const createObject = payload => submitPostRequest(`${url}objects/`, { 'Content-Type': 'application/json' }, payload);

export const getEntities = (entityType, params) => {
    // { page = 0, items: size = 9999, sortBy = 'created_at', desc = true, q = null, exact = false, returnContent = false }
    // for resources there additional parameter: exclude
    // for resources there additional parameter: uri
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResources(params);
        case ENTITIES.PREDICATE:
            return getPredicates(params);
        case ENTITIES.CLASS:
            return getClasses(params);
        default:
            return getResources(params);
    }
};

/**
 * Get entity by ID
 *
 * @param {String} entityType - Entity Type
 * @param {String} id - Entity ID
 * @return {Promise} Promise object
 */
export const getEntity = (entityType = ENTITIES.RESOURCE, id) => {
    switch (entityType) {
        case ENTITIES.RESOURCE:
            return getResource(id);
        case ENTITIES.PREDICATE:
            return getPredicate(id);
        case ENTITIES.CLASS:
            return getClassById(id);
        default:
            return getResource(id);
    }
};
