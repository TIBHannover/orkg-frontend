import { DataFactory, Quad_Object, Store, Term } from 'n3';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { createClass, getClassById, getClasses } from '@/services/backend/classes';
import { createPredicate, getPredicate, getPredicates } from '@/services/backend/predicates';
import { getResource } from '@/services/backend/resources';
import { getStatements } from '@/services/backend/statements';
import { Class, PaginatedResponse, Resource } from '@/services/backend/types';

const { namedNode } = DataFactory;

export const isORKGDefaultPredicate = (id: string) => Object.keys(PREDICATES).find((c) => PREDICATES[c] === id);

export const isORKGDefaultClass = (id: string) => Object.keys(CLASSES).find((c) => CLASSES[c] === id);

/**
 * Match triple from the RDF graph
 */
export function extractConcept<T extends boolean = true>(
    g: Store,
    concept: 'subject' | 'predicate' | 'object' = 'object',
    subject: Term | null = null,
    predicate: Term | null = null,
    object: Term | null = null,
    isUnique: T = true as T,
): T extends true ? Quad_Object | null : Quad_Object[] | null {
    const matches = g.match(subject, predicate, object);
    if (isUnique) {
        let result: Quad_Object | null = null;
        matches.forEach((match) => {
            result = match[concept as keyof typeof match] as Quad_Object;
        });
        return result as T extends true ? Quad_Object | null : Quad_Object[];
    }
    const result: Quad_Object[] = [];
    for (const match of matches) {
        result.push(match[concept as keyof typeof match] as Quad_Object);
    }
    return result as T extends true ? Quad_Object | null : Quad_Object[];
}

export const extractLabelFromRdfURI = (uri: string) => {
    // Check if the URI has a fragment identifier
    const fragmentIndex = uri.indexOf('#');
    if (fragmentIndex !== -1) {
        // Extract the fragment identifier and decode it
        const fragment = decodeURIComponent(uri.substring(fragmentIndex + 1));

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

export const mapPredicate = async (g: Store, predicateNode: Quad_Object | null) => {
    let result = null;
    if (!predicateNode) {
        return null;
    }
    const rdfs = (suffix: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${suffix}`);
    const labelNode = extractConcept(g, 'object', predicateNode, rdfs('label'), null, true);
    // check if the predicate is as ORKG default predicate
    const extractedId = extractLabelFromRdfURI(predicateNode.value);
    if (predicateNode?.value?.toString().includes('orkg.org') && isORKGDefaultPredicate(extractedId)) {
        let fetchedPredicate = await getPredicate(extractedId);
        if (!fetchedPredicate) {
            const fetchedPredicateId = await createPredicate(labelNode?.value ?? extractedId, extractedId);
            fetchedPredicate = await getPredicate(fetchedPredicateId);
        }
        return { ...fetchedPredicate, extractedId };
    }
    if (labelNode) {
        // Search for a predicate with the exact label
        const fetchedPredicate = await getPredicates({ q: labelNode?.value, exact: true });
        if (fetchedPredicate && 'page' in fetchedPredicate && fetchedPredicate.page.total_elements) {
            [result] = fetchedPredicate.content;
        } else {
            return {
                extractedId,
                label: labelNode?.value,
                uri: !predicateNode?.value?.toString().includes('orkg.org') ? predicateNode.value : null,
            };
        }
    } else {
        // Search for a predicate using the same as statement
        const fetchedPredicate = await getStatements({
            objectLabel: predicateNode.value,
            predicateId: PREDICATES.SAME_AS,
            subjectClasses: ['Predicate'],
        });
        if (Array.isArray(fetchedPredicate) && fetchedPredicate.length > 0) {
            [result] = fetchedPredicate;
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

export const mapClass = async (g: Store, classNode: Quad_Object | null) => {
    if (!classNode) {
        return null;
    }
    const owl = (suffix: string) => namedNode(`http://www.w3.org/2002/07/owl#${suffix}`);
    const rdfs = (suffix: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${suffix}`);
    const labelNode = extractConcept(g, 'object', classNode, rdfs('label'), null, true);
    const classURI = extractConcept(g, 'object', classNode, owl('equivalentClass'), null, true);
    // check if the class is an ORKG default class
    const extractedId = extractLabelFromRdfURI(classNode.value);
    if (classNode?.value?.toString().includes('orkg.org') && isORKGDefaultClass(extractLabelFromRdfURI(classNode.value))) {
        let fetchedClass: Class | null = await getClassById(extractedId);
        // the database should have the class, if not, create it
        if (!fetchedClass) {
            try {
                const fetchedClassId = await createClass(labelNode?.value ?? extractedId, classURI?.value ?? null, extractedId);
                fetchedClass = await getClassById(fetchedClassId);
            } catch {
                fetchedClass = null;
            }
        }
        if (fetchedClass) {
            return { ...fetchedClass, extractedId };
        }
    }
    let uri = classURI ? classURI.value : null;
    if (!uri) {
        uri = !classNode?.value?.toString().includes('orkg.org') ? classNode.value : null;
    }
    if (uri) {
        let fetchedClass: Class | null = null;
        try {
            const r = await getClasses({ uri });
            if (r && !('page' in r) && !('content' in r)) {
                fetchedClass = r;
            } else if (!('page' in r) && !('content' in r)) {
                fetchedClass = null;
            } else if ((r as unknown as PaginatedResponse<Class>).content.length > 0) {
                [fetchedClass] = (r as unknown as PaginatedResponse<Class>).content;
            } else {
                fetchedClass = null;
            }
        } catch {
            fetchedClass = null;
        }
        if (fetchedClass) {
            return { ...fetchedClass, extractedId };
        }
    }
    return {
        label: labelNode ? labelNode.value : extractLabelFromRdfURI(classNode.value),
        uri,
        extractedId,
    };
};

export const mapResource = async (g: Store, resourceNode: Quad_Object | null, classes: string[]) => {
    if (!resourceNode) {
        return null;
    }
    const rdfs = (suffix: string) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${suffix}`);
    const labelNode = extractConcept(g, 'object', resourceNode, rdfs('label'), null, true);
    const extractedId = extractLabelFromRdfURI(resourceNode.value);
    if (resourceNode?.value?.toString().includes('orkg.org')) {
        let fetchedResource: Resource | null = null;
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
