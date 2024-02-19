import { CLASSES, PREDICATES } from 'constants/graphSettings';
import rdf from 'rdf';
import { createClass, getClassById, getClasses } from 'services/backend/classes';
import { createPredicate, getPredicate, getPredicates } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { getStatementsByPredicateAndLiteral } from 'services/backend/statements';

export const isORKGDefaultPredicate = id => Object.keys(PREDICATES).find(c => PREDICATES[c] === id);

export const isORKGDefaultClass = id => Object.keys(CLASSES).find(c => CLASSES[c] === id);

/**
 * Match triple from the RDF graph
 *
 * @param {String} g RDF graph
 * @param {String} concept target concept (object | subject | predicate)
 * @param {Object} subject subject node selector
 * @param {Object} predicate predicate node selector
 * @param {Object} object object node selector
 * @param {Boolean} isUnique if one concept should be returned
 * @result {Object} Concept or array of matched concepts
 */
export const extractConcept = (g, concept = 'object', subject = null, predicate = null, object = null, isUnique = true) => {
    const triples = g.match(subject, predicate, object);
    let result = isUnique ? null : [];
    triples.forEach(s => {
        if (isUnique) {
            result = s[concept];
        } else {
            result.push(s[concept]);
        }
    });
    return result;
};

export const extractLabelFromRdfURI = uri => {
    // Check if the URI has a fragment identifier
    const fragmentIndex = uri.indexOf('#');
    if (fragmentIndex !== -1) {
        // Extract the fragment identifier and decode it
        const fragment = decodeURIComponent(uri.substr(fragmentIndex + 1));

        // Split the fragment identifier by slashes and return the last part
        const parts = fragment.split('/');
        return parts[parts.length - 1];
    }
    // If there is no fragment identifier, extract the last segment of the URI's path
    const url = new URL(uri);
    const pathSegments = url.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Decode the last segment and return it
    return decodeURIComponent(lastSegment);
};

export const mapPredicate = async (g, predicateNode) => {
    let result = null;
    if (!predicateNode) {
        return null;
    }
    const labelNode = extractConcept(g, 'object', predicateNode, rdf.rdfsns('label'), null, true);
    // check if the predicate is as ORKG default predicate
    const extractedId = extractLabelFromRdfURI(predicateNode.value);
    if (predicateNode?.value?.toString().includes('orkg.org') && isORKGDefaultPredicate(extractedId)) {
        let fetchedPredicate = await getPredicate(extractedId);
        if (!fetchedPredicate) {
            fetchedPredicate = await createPredicate(labelNode?.value ?? extractedId, extractedId);
        }
        return { ...fetchedPredicate, extractedId };
    }
    if (labelNode) {
        // Search for a predicate with the exact label
        let fetchedPredicate = await getPredicates({ q: labelNode?.value, exact: true });
        if (fetchedPredicate.totalElements) {
            [result] = fetchedPredicate.content;
        } else {
            // Search for a predicate with same label
            fetchedPredicate = await getPredicates({ q: labelNode?.value, size: 1 });
            if (fetchedPredicate.totalElements) {
                [result] = fetchedPredicate.content;
            } else {
                return {
                    extractedId,
                    label: labelNode?.value,
                    uri: !predicateNode?.value?.toString().includes('orkg.org') ? predicateNode.value : null,
                };
            }
        }
    } else {
        // Search for a predicate using the same as statement
        const fetchedPredicate = await getStatementsByPredicateAndLiteral({
            literal: predicateNode.value,
            predicateId: PREDICATES.SAME_AS,
            subjectClass: 'Predicate',
        });
        if (fetchedPredicate.totalElements) {
            [result] = fetchedPredicate.content;
            result = result.subject;
        } else {
            return {
                extractedId,
                label: extractLabelFromRdfURI(predicateNode.value),
                uri: !predicateNode?.value?.toString().includes('orkg.org') ? predicateNode.value : null,
            };
        }
    }
    return { extractedId, ...result };
};

export const mapClass = async (g, classNode) => {
    if (!classNode) {
        return null;
    }
    const owl = rdf.ns('http://www.w3.org/2002/07/owl#');
    const labelNode = extractConcept(g, 'object', classNode, rdf.rdfsns('label'), null, true);
    const classURI = extractConcept(g, 'object', classNode, owl('equivalentClass'), null, true);
    // check if the class is as ORKG default class
    const extractedId = extractLabelFromRdfURI(classNode.value);
    if (classNode?.value?.toString().includes('orkg.org') && isORKGDefaultClass(extractLabelFromRdfURI(classNode.value))) {
        let fetchedClass = await getClassById(extractedId);
        if (!fetchedClass) {
            try {
                fetchedClass = await createClass(labelNode?.value ?? extractedId, classURI?.value ?? null, extractedId);
            } catch {
                fetchedClass = null;
            }
        }
        if (fetchedClass) {
            return fetchedClass;
        }
    }
    let uri = classURI ? classURI.value : null;
    if (!uri) {
        uri = !classNode?.value?.toString().includes('orkg.org') ? classNode.value : null;
    }
    if (uri) {
        let fetchedClass;
        try {
            fetchedClass = await getClasses({ uri });
        } catch {
            fetchedClass = null;
        }
        if (fetchedClass) {
            return fetchedClass;
        }
    }
    return {
        label: labelNode ? labelNode.value : extractLabelFromRdfURI(classNode.value),
        uri,
    };
};

export const mapResource = async (g, resourceNode, classes) => {
    if (!resourceNode) {
        return null;
    }
    const labelNode = extractConcept(g, 'object', resourceNode, rdf.rdfsns('label'), null, true);
    const extractedId = extractLabelFromRdfURI(resourceNode.value);
    if (resourceNode?.value?.toString().includes('orkg.org')) {
        let fetchedResource;
        try {
            fetchedResource = await getResource(extractedId);
        } catch {
            fetchedResource = null;
        }
        if (fetchedResource) {
            return fetchedResource;
        }
    }
    return {
        label: labelNode ? labelNode.value : extractLabelFromRdfURI(resourceNode.value),
        classes,
    };
};
