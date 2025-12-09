import capitalize from 'capitalize';
import { unescape } from 'he';
import { isNaN, isString, sortBy } from 'lodash';
import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import slugifyString from 'slugify';

import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getStatements } from '@/services/backend/statements';

export const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const range = (start, end) => [...Array(1 + end - start).keys()].map((v) => start + v);

/**
 * Parse error response body (originating from server) by field name
 *
 * Not specifying a `field` name will return the global `errors.message`
 *
 * @param {Object} errors
 * @param {String} field
 */
export const getErrorMessage = (errors, field = null) => {
    if (!errors) {
        return null;
    }
    if (field === null) {
        return errors.message ? errors.message?.replace?.('Predicate', 'Property') : null;
    }
    const fieldError = errors.errors ? errors.errors.find((e) => e.field === field) : null;
    return fieldError ? capitalize(fieldError.message).replace('Predicate', 'Property') : null;
};

/**
 * Filter a list of statements by predicate id and return the object (including the statement id and created_at)
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {String} classID Class ID
 * @param {String} subjectID Subject ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 */
export const filterObjectOfStatementsByPredicateAndClass = (statementsArray, predicateID, isUnique = true, classID = null, subjectID = null) => {
    if (!statementsArray) {
        return isUnique ? null : [];
    }
    let result = statementsArray.filter(
        (statement) => statement.predicate.id === predicateID && (statement.subject.id === subjectID || subjectID === null),
    );
    if (classID) {
        result = statementsArray.filter((statement) => statement.object.classes && statement.object.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].object, statementId: result[0].id, s_created_at: result[0].created_at }; // TODO, check if statementId and s_created_at are needed
    }
    if (result.length > 0 && !isUnique) {
        return result.map((s) => ({ ...s.object, statementId: s.id, s_created_at: s.created_at }));
    }
    return isUnique ? null : [];
};

export const getAuthorsInList = ({ resourceId, statements }) => {
    const sortedStatements = sortBy(statements ?? [], 'index');
    const authorList = filterObjectOfStatementsByPredicateAndClass(
        sortedStatements.filter((s) => s.subject.id === resourceId),
        PREDICATES.HAS_AUTHORS,
        false,
    );
    const authorListId = authorList?.[0]?.id;
    if (!authorListId) {
        return [];
    }
    const authors = filterObjectOfStatementsByPredicateAndClass(sortedStatements, PREDICATES.HAS_LIST_ELEMENT, false, null, authorListId);

    const authorsArray = [];
    for (const author of authors) {
        const orcid = sortedStatements.find((s) => s.subject.id === author.id && s.predicate.id === PREDICATES.HAS_ORCID);
        if (orcid) {
            authorsArray.push({ ...author, orcid: orcid.object.label });
        } else {
            authorsArray.push({ ...author, orcid: '' });
        }
    }
    return authorsArray ?? [];
};

export const getAuthorStatements = async (statements) => {
    const listId = statements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS)?.object?.id;
    if (!listId) {
        return [];
    }
    return getStatements({
        subjectId: listId,
        sortBy: [{ property: 'index', direction: 'asc' }],
    });
};

export const addAuthorsToStatements = async (statements) => {
    const listId = statements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS)?.object?.id;
    if (!listId) {
        return statements;
    }
    return [...statements, ...(await getAuthorStatements(statements))];
};

/**
 * Parse author statements and return an author object
 * @param {Object} resource Author resource
 * @param {Array} statements Author Statements
 */
export const getAuthorData = (resource, statements) => {
    const orcid = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_ORCID, true);
    const website = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.WEBSITE, true);
    const linkedIn = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.LINKED_IN_ID, true);
    const researchGate = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.RESEARCH_GATE_ID, true);
    const googleScholar = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.GOOGLE_SCHOLAR_ID, true);

    return {
        ...resource,
        label: resource.label ? resource.label : 'No Name',
        orcid,
        website,
        linkedIn,
        researchGate,
        googleScholar,
        dblp: '',
    };
};

const isNumeric = (str) => {
    if (typeof str !== 'string') return false; // we only process strings!
    return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    );
};

/**
 * Sort Method
 *
 * @param {String} a
 * @param {String} b
 */
export const sortMethod = (a, b) => {
    // force null and undefined to the bottom
    let _a = a === null || a === undefined ? -Infinity : a;
    let _b = b === null || b === undefined ? -Infinity : b;
    // check if a and b are numbers (contains only digits)
    const aIsNum = isNumeric(_a);
    const bIsNum = isNumeric(_b);
    if (aIsNum && bIsNum) {
        _a = parseFloat(_a);
        _b = parseFloat(_b);
    } else {
        // force any string values to lowercase
        _a = typeof _a === 'string' ? _a.toLowerCase() : _a;
        _b = typeof _b === 'string' ? _b.toLowerCase() : _b;
    }
    // Return either 1 or -1 to indicate a sort priority
    if (_a > _b) {
        return 1;
    }
    if (_a < _b) {
        return -1;
    }
    // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
    return 0;
};

/**
 * Filter a list of statements by predicate id and return the subject (including the statement id and created_at)
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 * @param {String} classID class ID
 */
export const filterSubjectOfStatementsByPredicateAndClass = (statementsArray, predicateID, isUnique = true, classID = null) => {
    if (!statementsArray) {
        return isUnique ? null : [];
    }
    let result = statementsArray.filter((statement) => statement.predicate.id === predicateID);
    if (classID) {
        result = statementsArray.filter((statement) => statement.subject.classes && statement.subject.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].subject, statementId: result[0].id, s_created_at: result[0].created_at };
    }
    if (result.length > 0 && !isUnique) {
        return result.map((s) => ({ ...s.subject, statementId: s.id, s_created_at: s.created_at }));
    }
    return isUnique ? null : [];
};

// https://stackoverflow.com/questions/42921220/is-any-solution-to-do-localstorage-setitem-in-asynchronous-way-in-javascript
export const asyncLocalStorage = {
    setItem(key, value) {
        return Promise.resolve().then(() => {
            localStorage.setItem(key, value);
        });
    },
    getItem(key) {
        return Promise.resolve().then(() => localStorage.getItem(key));
    },
    removeItem(key) {
        return Promise.resolve().then(() => localStorage.removeItem(key));
    },
};

export function convertTreeToFlat(treeStructure, childrenAttribute = 'versions') {
    const flatten = (children, extractChildren) =>
        Array.prototype.concat.apply(
            children,
            children.map((x) => flatten(extractChildren(x) || [], extractChildren)),
        );
    const extractChildren = (x) => x[childrenAttribute] ?? [];
    const flat = flatten(extractChildren(treeStructure), extractChildren);
    return flat;
}

/**
 * Merge two arrays with alternating values
 * @param {Array} array1 Array 2
 * @param {Array} array2 Array 2
 */
export const mergeAlternate = (array1, array2) => {
    const result = [];
    const l = Math.min(array1.length, array2.length);
    for (let i = 0; i < l; i++) {
        result.push(array1[i], array2[i]);
    }
    result.push(...array1.slice(l), ...array2.slice(l));
    return result;
};

// TODO: could be part of a 'parseDoi' hook when the add paper wizard is refactored to support hooks
export const parseCiteResult = (paper) => {
    let paperTitle = '';
    let paperAuthors = [];
    let paperPublicationMonth = '';
    let paperPublicationYear = '';
    let doi = '';
    let publishedIn = '';
    let url = '';

    try {
        const { title, subtitle, author, issued, DOI, URL, 'container-title': containerTitle } = paper.data[0];

        paperTitle = title;
        if (subtitle && subtitle.length > 0) {
            // include the subtitle
            paperTitle = unescape(`${paperTitle}: ${subtitle[0]}`);
        }
        if (author) {
            paperAuthors = author.map((_author) => {
                let fullname = [_author.given, _author.family].join(' ').trim();
                if (!fullname) {
                    fullname = _author.literal ? _author.literal : '';
                }
                return {
                    name: unescape(fullname),
                    ...(_author.ORCID
                        ? {
                              identifiers: {
                                  orcid: [_author.ORCID?.split('/')?.[1]],
                              },
                          }
                        : {}),
                };
            });
        }
        const [year, month] = issued['date-parts'][0];

        if (month) {
            paperPublicationMonth = month;
        }
        if (year) {
            paperPublicationYear = year;
        }
        doi = DOI || '';
        url = URL || '';
        if (containerTitle && isString(containerTitle)) {
            publishedIn = unescape(containerTitle);
        }
    } catch (e) {
        console.log('Error setting paper data: ', e);
    }

    return {
        paperTitle,
        paperAuthors,
        paperPublicationMonth,
        paperPublicationYear,
        doi,
        publishedIn,
        url,
    };
};

/**
 * Get resource link based on class
 *
 * @param {String} classId class ID
 * @param {String} resourceId Resource ID
 * @result {String} Link of the resource
 */
export const getResourceLink = (classId, id) => {
    const links = {
        [CLASSES.PAPER]: [ROUTES.VIEW_PAPER, 'resourceId'],
        paper: [ROUTES.VIEW_PAPER, 'resourceId'],
        [CLASSES.PROBLEM]: [ROUTES.RESEARCH_PROBLEM_NO_SLUG, 'researchProblemId'],
        [CLASSES.AUTHOR]: [ROUTES.AUTHOR_PAGE, 'authorId'],
        [CLASSES.COMPARISON]: [ROUTES.COMPARISON, 'comparisonId'],
        comparison: [ROUTES.COMPARISON, 'comparisonId'],
        [CLASSES.COMPARISON_PUBLISHED]: [ROUTES.COMPARISON, 'comparisonId'],
        [CLASSES.VENUE]: [ROUTES.VENUE_PAGE, 'venueId'],
        [CLASSES.NODE_SHAPE]: [ROUTES.TEMPLATE, 'id'],
        template: [ROUTES.TEMPLATE, 'id'],
        [CLASSES.VISUALIZATION]: [ROUTES.VISUALIZATION, 'id'],
        visualization: [ROUTES.VISUALIZATION, 'id'],
        [CLASSES.CONTRIBUTION]: [ROUTES.CONTRIBUTION, 'id'],
        [CLASSES.SMART_REVIEW_PUBLISHED]: [ROUTES.REVIEW, 'id'],
        'smart-review': [ROUTES.REVIEW, 'id'],
        [CLASSES.LITERATURE_LIST_PUBLISHED]: [ROUTES.LIST, 'id'],
        'literature-list': [ROUTES.LIST, 'id'],
        [ENTITIES.RESOURCE]: [ROUTES.RESOURCE, 'id'],
        [ENTITIES.PREDICATE]: [ROUTES.PROPERTY, 'id'],
        [ENTITIES.CLASS]: [ROUTES.CLASS, 'id'],
        [ENTITIES.LITERAL]: [ROUTES.LITERAL, 'id'],
        [CLASSES.RESEARCH_FIELD]: [ROUTES.RESEARCH_FIELD_NO_SLUG, 'researchFieldId'],
        [CLASSES.ROSETTA_STONE_STATEMENT]: [ROUTES.RS_STATEMENT, 'id'],
        [CLASSES.ROSETTA_NODE_SHAPE]: [ROUTES.RS_TEMPLATE, 'id'],
        default: [ROUTES.RESOURCE, 'id'],
    };
    const [route, idParam] = links[classId] || links.default;
    return `${reverse(route, { [idParam]: id })}${route === ROUTES.RESOURCE ? '?noRedirect' : ''}`;
};

/**
 * Get resource link based on entity type
 *
 * @param {String} _class Entity type
 * @param {String} id ID
 * @result {String} Link of the resource
 */
export const getLinkByEntityType = (_class, id) => {
    const links = {
        [ENTITIES.RESOURCE]: ROUTES.RESOURCE,
        [`${ENTITIES.RESOURCE}_ref`]: ROUTES.RESOURCE,
        [ENTITIES.CLASS]: ROUTES.CLASS,
        [`${ENTITIES.CLASS}_ref`]: ROUTES.CLASS,
        [ENTITIES.PREDICATE]: ROUTES.PROPERTY,
        [`${ENTITIES.PREDICATE}_ref`]: ROUTES.PROPERTY,
    };
    return links[_class] ? `${reverse(links[_class], { id })}?noRedirect` : '';
};

/**
 * Stringify sort value
 *
 * @param {String} sort sort value
 * @result {String} Label
 */
export const stringifySort = (sort) => {
    const stringsSortMapping = {
        newest: 'Recently added',
        oldest: 'Oldest first',
        featured: 'Featured',
        combined: 'Top recent',
        unlisted: 'Unlisted',
        top: 'Last 30 days',
        all: 'All time',
    };
    return stringsSortMapping[sort] ?? stringsSortMapping.newest;
};

/**
 * Use reverse from 'named-urls' and automatically slugifies the slug param
 * @param input string that should be slugified
 */
export const slugify = (input) => slugifyString(input.replace('/', ' '), '_');

/**
 * Get base url of the application
 */
export const getPublicUrl = () => {
    const publicURL = env('NEXT_PUBLIC_PUBLIC_URL').endsWith('/') ? env('NEXT_PUBLIC_PUBLIC_URL').slice(0, -1) : env('NEXT_PUBLIC_PUBLIC_URL');
    return `${window.location.protocol}//${window.location.host}${publicURL}`;
};

/**
 * Use reverse from 'named-urls' and automatically slugifies the slug param
 * @param route name of the route
 * @param params route params to pass
 * @param params.slug the slug for this param
 */
export const reverseWithSlug = (route, params) => reverse(route, { ...params, slug: params.slug ? slugify(params.slug) : undefined });
