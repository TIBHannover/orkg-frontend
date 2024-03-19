import capitalize from 'capitalize';
import env from 'components/NextJsMigration/env';
import { CLASSES, ENTITIES, MISC, PREDICATES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { unescape } from 'he';
import { isString, sortBy, uniqBy } from 'lodash';
import { reverse } from 'named-urls';
import qs from 'qs';
import { Cookies } from 'react-cookie';
import { LOCATION_CHANGE as LOCATION_CHANGE_RFH } from 'redux-first-history';
import { getStatementsByObjectAndPredicate, getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import slugifyString from 'slugify';

const cookies = new Cookies();

/**
 * Parse comma separated values from the query string
 *
 * @param {String} locationSearch useLocation().search
 * @param {String} param parameter name
 * @return {Array} the list of values
 */
export function getArrayParamFromQueryString(locationSearch, param) {
    const values = qs.parse(locationSearch, { comma: true, ignoreQueryPrefix: true })[param];
    if (!values) {
        return [];
    }
    if (typeof values === 'string' || values instanceof String) {
        return [values];
    }
    return values;
}

/**
 * Parse value from the query string
 *
 * @param {String} locationSearch useLocation().search
 * @param {String} param parameter name
 * @param {Boolean} boolean return false instead of null
 * @return {String|Boolean} value
 */
export function getParamFromQueryString(locationSearch, param, boolean = false) {
    const value = qs.parse(locationSearch, { ignoreQueryPrefix: true })[param];
    if (!value) {
        return boolean ? false : null;
    }
    if (typeof value === 'string' || value instanceof String) {
        if (boolean && (value === 'false' || !value || !['true', '1'].includes(value))) {
            return false;
        }
        return boolean ? true : value;
    }
    return value;
}

export const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const range = (start, end) => [...Array(1 + end - start).keys()].map((v) => start + v);

export function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Promise timeout'));
        }, ms);
        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            },
        );
    });
}

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

function getOrder(paperStatements) {
    let order = paperStatements.filter((statement) => statement.predicate.id === PREDICATES.ORDER);
    if (order.length > 0) {
        order = order[0].object.label;
    } else {
        order = Infinity;
    }
    return order;
}

/**
 * Filter the objects and return one doi object
 * @param {Array} objects Array of object of DOI statements
 * @param {Boolean} isDataCite The doi type to filter on (DataCite is the doi given by orkg)
 * @return {Object} Doi object
 */
export const filterDoiObjects = (objects, isDataCite = false) => {
    if (!objects.length) {
        return '';
    }
    if (isDataCite) {
        return objects.find((doi) => doi.label?.startsWith(env('DATACITE_DOI_PREFIX'))) ?? '';
    }
    return objects.find((doi) => doi.label?.startsWith('10.') && !doi.label?.startsWith(env('DATACITE_DOI_PREFIX'))) ?? '';
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

export const addAuthorsToStatementBundle = async (statements) => {
    const authorListStatements = statements.map((bundle) => bundle.statements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS));
    const _authors = await getStatementsBySubjects({ ids: authorListStatements.filter((p) => p?.object?.id).map((p) => p?.object?.id) });

    return statements.map((bundle, index) => ({
        ...bundle,
        statements: [...bundle.statements, ...(_authors.find(({ id }) => id === authorListStatements[index]?.object?.id)?.statements ?? [])],
    }));
};

export const getAuthorStatements = async (statements) => {
    const listId = statements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS)?.object?.id;
    if (!listId) {
        return statements;
    }
    return getStatementsBySubject({
        id: listId,
        sortBy: 'index',
        desc: false,
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
 * Parse paper statements and return a a paper object
 *
 * @param {Array} paperStatements
 */
export const getPaperDataViewPaper = (paperResource, paperStatements) => {
    const paperStatementsFirstLevel = paperStatements.filter((s) => s.subject.id === paperResource.id);
    const authors = getAuthorsInList({ resourceId: paperResource.id, statements: paperStatements });
    const authorListResource = filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_AUTHORS, false)?.[0];

    const contributions = filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_CONTRIBUTION, false, null);
    const doi = filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_DOI, false);
    return {
        paperResource,
        authors,
        authorListResource,
        // sort contributions ascending, so contribution 1, is actually the first one
        contributions: contributions.sort((a, b) => a.label.localeCompare(b.label)),
        publicationMonth: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PUBLICATION_MONTH, true),
        publicationYear: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PUBLICATION_YEAR, true),
        doi: filterDoiObjects(doi),
        researchField: filterObjectOfStatementsByPredicateAndClass(
            paperStatementsFirstLevel,
            PREDICATES.HAS_RESEARCH_FIELD,
            true,
            CLASSES.RESEARCH_FIELD,
        ),
        publishedIn: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_VENUE, true),
        url: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.URL, true),
        hasVersion: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PREVIOUS_VERSION, true),
        dataCiteDoi: filterDoiObjects(doi, true),
    };
};

/**
 * Parse paper statements and return a paper object
 * @param {Object} resource Paper resource
 * @param {Array} paperStatements
 */

export const getPaperData = (resource, paperStatements) => {
    let doi = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_DOI, true);
    if (doi && doi.label.includes('10.') && !doi.label.startsWith('10.')) {
        doi = { ...doi, label: doi.label.substring(doi.label.indexOf('10.')) };
    }
    const authorListResource = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHORS, false)?.[0];
    const researchField = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD);
    const publicationYear = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_YEAR, true);
    // gets month[0] and resourceId[1]
    const publicationMonth = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_MONTH, true);
    const authors = getAuthorsInList({ resourceId: resource.id, statements: paperStatements });
    const contributions = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
    const order = getOrder(paperStatements);
    const publishedIn = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_VENUE, true);
    const url = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.URL, true);

    return {
        ...resource,
        id: resource.id,
        label: resource.label ? resource.label : 'No Title',
        publicationYear,
        publicationMonth,
        researchField,
        doi,
        authors,
        authorListResource,
        // sort contributions ascending, so contribution 1, is actually the first one
        contributions: contributions ? contributions.sort((a, b) => a.label.localeCompare(b.label)) : [],
        order,
        created_by: resource.created_by !== MISC.UNKNOWN_ID ? resource.created_by : null,
        publishedIn,
        url,
    };
};

/**
 * Parse review statements and return a review object
 * @param {Object} resource Review resource
 * @param {Array} statements Review Statements
 */
export const getReviewData = async (resource, statements) => {
    const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
    const paperId = (await getStatementsByObjectAndPredicate({ objectId: resource.id, predicateId: PREDICATES.HAS_PUBLISHED_VERSION }))?.[0]?.subject
        ?.id;

    return {
        ...resource,
        id: resource.id,
        label: resource.label ? resource.label : 'No Title',
        description: description?.label ?? '',
        paperId,
    };
};

/**
 * Parse list statements and return a list object
 * @param {Object} resource List resource
 * @param {Array} statements List  Statements
 */
export const getListData = async (resource, statements) => {
    const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
    const listId = (await getStatementsByObjectAndPredicate({ objectId: resource.id, predicateId: PREDICATES.HAS_PUBLISHED_VERSION }))?.[0]?.subject
        ?.id;

    return {
        ...resource,
        id: resource.id,
        label: resource.label ? resource.label : 'No Title',
        description: description?.label ?? '',
        listId,
    };
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
    };
};

/**
 * Parse comparison statements and return a comparison object
 * @param {Object} resource Comparison resource
 * @param {Array} comparisonStatements
 */
export const getComparisonData = (resource, comparisonStatements) => {
    const description = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.DESCRIPTION, true);
    const contributions = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.COMPARE_CONTRIBUTION, false);
    const references = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.REFERENCE, false);
    const doi = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_DOI, true);
    const hasPreviousVersion = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.HAS_PREVIOUS_VERSION,
        true,
        CLASSES.COMPARISON,
    );
    const icon = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.ICON, true);
    const type = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.TYPE, true);
    const order = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.ORDER, true);
    const onHomePage = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.ON_HOMEPAGE, true);
    const subject = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_SUBJECT, true, CLASSES.RESEARCH_FIELD);
    const resources = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.RELATED_RESOURCE,
        false,
        CLASSES.COMPARISON_RELATED_RESOURCE,
    );
    const figures = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.RELATED_FIGURE,
        false,
        CLASSES.COMPARISON_RELATED_FIGURE,
    );
    const visualizations = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.HAS_VISUALIZATION,
        false,
        CLASSES.VISUALIZATION,
    );

    const video = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_VIDEO, true);
    const authors = getAuthorsInList({ resourceId: resource.id, statements: comparisonStatements });
    const properties = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_PROPERTY, false);
    const anonymized = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.IS_ANONYMIZED, true);

    return {
        ...resource,
        label: resource.label ? resource.label : 'No Title',
        authors,
        contributions,
        references,
        doi: doi ? doi.label : '',
        description: description ? description.label : '',
        icon: icon ? icon.label : '',
        order: order ? order.label : Infinity,
        type: type ? type.id : '',
        onHomePage: !!onHomePage,
        researchField: subject,
        hasPreviousVersion,
        visualizations,
        figures,
        resources,
        properties,
        video,
        anonymized: !!anonymized,
    };
};

/**
 * Parse template propertyShape statements and return a propertyShape object
 * @param {Object} propertyShape
 * @param {Array} propertyShapeStatements
 */
export const getPropertyShapeData = (propertyShape, propertyShapeStatements) => {
    const property = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_PATH, true, null, propertyShape.id);
    const datatype = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_DATATYPE, true, null, propertyShape.id);
    const shClass = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_CLASS, true, null, propertyShape.id);
    const value = shClass || datatype;

    const minInclusive = filterObjectOfStatementsByPredicateAndClass(
        propertyShapeStatements,
        PREDICATES.SHACL_MIN_INCLUSIVE,
        true,
        null,
        propertyShape.id,
    );
    const maxInclusive = filterObjectOfStatementsByPredicateAndClass(
        propertyShapeStatements,
        PREDICATES.SHACL_MAX_INCLUSIVE,
        true,
        null,
        propertyShape.id,
    );

    const placeholder = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.PLACEHOLDER, true, null, propertyShape.id);

    const description = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.DESCRIPTION, true, null, propertyShape.id);

    const pattern = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_PATTERN, true, null, propertyShape.id);

    const minCount = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_MIN_COUNT, true, null, propertyShape.id);

    const maxCount = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_MAX_COUNT, true, null, propertyShape.id);

    const order = filterObjectOfStatementsByPredicateAndClass(propertyShapeStatements, PREDICATES.SHACL_ORDER, true, null, propertyShape.id);

    return {
        id: propertyShape.id,
        property: property
            ? {
                  id: property.id,
                  label: property.label,
              }
            : {},
        value: value
            ? {
                  id: value.id,
                  label: value.label,
                  uri: value.uri,
              }
            : null,
        minCount: minCount ? minCount.label : 0,
        maxCount: maxCount ? maxCount.label : null,
        placeholder: placeholder ? placeholder.label : '',
        description: description ? description.label : '',
        order: order ? order.label : null,
        minInclusive: minInclusive?.label ?? null,
        maxInclusive: maxInclusive?.label ?? null,
        pattern: pattern?.label ?? null,
    };
};

/**
 * Parse visualization statements and return a visualization object
 * @param {String} id
 * @param {String } label
 * @param {Array} visualizationStatements
 */
export const getVisualizationData = (resource, visualizationStatements) => {
    const description = visualizationStatements.find((statement) => statement.predicate.id === PREDICATES.DESCRIPTION);
    const authors = getAuthorsInList({ resourceId: resource.id, statements: visualizationStatements });

    return {
        ...resource,
        description: description ? description.object.label : '',
        authors,
    };
};

/**
 * Sort Method
 *
 * @param {String} a
 * @param {String} b
 */
export const sortMethod = (a, b) => {
    // force null and undefined to the bottom
    a = a === null || a === undefined ? -Infinity : a;
    b = b === null || b === undefined ? -Infinity : b;
    // check if a and b are numbers (contains only digits)
    const aisnum = /^(\d|.)+$/.test(a);
    const bisnum = /^(\d|.)+$/.test(b);
    if (aisnum && bisnum) {
        a = parseFloat(a);
        b = parseFloat(b);
    } else {
        // force any string values to lowercase
        a = typeof a === 'string' ? a.toLowerCase() : a;
        b = typeof b === 'string' ? b.toLowerCase() : b;
    }
    // Return either 1 or -1 to indicate a sort priority
    if (a > b) {
        return 1;
    }
    if (a < b) {
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

export function listToTree(list) {
    const map = {};
    let node;
    const roots = [];
    let i;
    list = sortBy(list, 'hasPreviousVersion');
    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        const v = list[i].hasPreviousVersion;
        list[i].versions = v && !list.find((c) => c.id === v.id) ? [list[i].hasPreviousVersion] : []; // initialize the versions
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        // Check that map[node.hasPreviousVersion.id] exists : The parent could be not part of the list (not fetched yet!)
        if (node.hasPreviousVersion && node.hasPreviousVersion.id !== null && map[node.hasPreviousVersion.id]) {
            list[map[node.hasPreviousVersion.id]].versions.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

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
 * Group comparisons versions
 * @param {Array} comparisons comparison data objects
 * @param {Function} sortFunc Sort function
 */
export const groupVersionsOfComparisons = (comparisons, sortFunc = (a, b) => new Date(b.created_at) - new Date(a.created_at)) => {
    // 1- Remove duplicated and keep the ones with hasPreviousVersion
    let result = comparisons.filter((c) => c?.classes?.includes(CLASSES.COMPARISON));
    // 2- Make a tree of versions
    result = listToTree(uniqBy(sortBy(result, 'hasPreviousVersion'), 'id'));
    // 3- We flat the versions  inside the roots
    for (let i = 0; i < result.length; i += 1) {
        // Always the new version if the main resource
        const arrayVersions = [...convertTreeToFlat(result[i], 'versions'), result[i]].sort(sortFunc);
        result[i] = { ...arrayVersions[0], versions: arrayVersions };
    }
    // 4- We sort the roots
    result = [...result, ...comparisons.filter((c) => !c?.classes?.includes(CLASSES.COMPARISON))].sort(sortFunc);
    return result;
};

/**
 * Compare input value to select options
 * Built-ins https://github.com/JedWatson/react-select/blob/d2a820efc70835adf864169eebc76947783a15e2/packages/react-select/src/Creatable.js
 * @param {String} inputValue candidate label
 * @param {Object} option option
 */
export const compareOption = (inputValue = '', option) => {
    const candidate = String(inputValue).toLowerCase();
    const optionValue = String(option.value).toLowerCase();
    const optionLabel = String(option.label).toLowerCase();
    const optionURI = String(option.uri).toLowerCase();
    return optionValue === candidate || optionLabel === candidate || optionURI === candidate;
};

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
            paperAuthors = author.map((author) => {
                let fullname = [author.given, author.family].join(' ').trim();
                if (!fullname) {
                    fullname = author.literal ? author.literal : '';
                }
                return {
                    name: unescape(fullname),
                    ...(author.ORCID
                        ? {
                              identifiers: {
                                  orcid: [author.ORCID?.split('/')?.[1]],
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
 * Parse resources statements and return a related figures objects
 * @param {Array} resourceStatements
 */
export function getRelatedFiguresData(resourcesStatements) {
    const _figures = resourcesStatements.map((resourceStatements) => {
        const imageStatement = resourceStatements.statements.find((statement) => statement.predicate.id === PREDICATES.IMAGE);
        const alt = resourceStatements.statements.length ? resourceStatements.statements[0]?.subject?.label : null;
        return {
            src: imageStatement ? imageStatement.object.label : '',
            figureId: resourceStatements.id,
            alt,
        };
    });
    return _figures;
}

/**
 * Parse resources statements and return a related resources objects
 * @param {Array} resourceStatements
 */
export function getRelatedResourcesData(resourcesStatements) {
    const _resources = resourcesStatements.map((resourceStatements) => {
        const imageStatement = resourceStatements.statements.find((statement) => statement.predicate.id === PREDICATES.IMAGE);
        const urlStatement = resourceStatements.statements.find((statement) => statement.predicate.id === PREDICATES.URL);
        const descriptionStatement = resourceStatements.statements.find((statement) => statement.predicate.id === PREDICATES.DESCRIPTION);
        return {
            url: urlStatement ? urlStatement.object.label : '',
            image: imageStatement ? imageStatement.object.label : '',
            id: resourceStatements.id,
            title: resourceStatements.statements[0]?.subject?.label,
            description: descriptionStatement ? descriptionStatement.object.label : '',
        };
    });
    return _resources;
}

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
        [CLASSES.TEMPLATE]: [ROUTES.TEMPLATE, 'id'],
        [CLASSES.PROBLEM]: [ROUTES.RESEARCH_PROBLEM_NO_SLUG, 'researchProblemId'],
        [CLASSES.AUTHOR]: [ROUTES.AUTHOR_PAGE, 'authorId'],
        [CLASSES.COMPARISON]: [ROUTES.COMPARISON, 'comparisonId'],
        [CLASSES.VENUE]: [ROUTES.VENUE_PAGE, 'venueId'],
        [CLASSES.NODE_SHAPE]: [ROUTES.TEMPLATE, 'id'],
        [CLASSES.VISUALIZATION]: [ROUTES.VISUALIZATION, 'id'],
        [CLASSES.CONTRIBUTION]: [ROUTES.CONTRIBUTION, 'id'],
        [CLASSES.SMART_REVIEW_PUBLISHED]: [ROUTES.REVIEW, 'id'],
        [CLASSES.LITERATURE_LIST_PUBLISHED]: [ROUTES.LIST, 'id'],
        [ENTITIES.RESOURCE]: [ROUTES.RESOURCE, 'id'],
        [ENTITIES.PREDICATE]: [ROUTES.PROPERTY, 'id'],
        [ENTITIES.CLASS]: [ROUTES.CLASS, 'id'],
        [CLASSES.RESEARCH_FIELD]: [ROUTES.RESEARCH_FIELD_NO_SLUG, 'researchFieldId'],
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
        [ENTITIES.CLASS]: ROUTES.CLASS,
        [ENTITIES.PREDICATE]: ROUTES.PROPERTY,
    };
    return links[_class] ? `${reverse(links[_class], { id })}?noRedirect` : '';
};

/**
 * Get Entity Type based on ID
 * (Only works for IDs with the default pattern (#Rxxx, #Cxxx, #Pxxx)
 * @param {String} id Entity ID
 * @result {String} Entity type or false if no pattern matched
 */
export const getEntityTypeByID = (value) => {
    if (value.match(REGEX.RESOURCE_PATTERN)) {
        return ENTITIES.RESOURCE;
    }
    if (value.match(REGEX.PROPERTY_PATTERN)) {
        return ENTITIES.PREDICATE;
    }
    if (value.match(REGEX.CLASS_PATTERN)) {
        return ENTITIES.CLASS;
    }
    return false;
};

/**
 * Get resource type label based on class
 *
 * @param {String} classId class ID
 * @result {String} resource label
 */
export const getResourceTypeLabel = (classId) => {
    let label = 'resource';

    switch (classId) {
        case CLASSES.PAPER: {
            label = 'paper';
            break;
        }
        case CLASSES.PROBLEM: {
            label = 'research problem';
            break;
        }
        case CLASSES.AUTHOR: {
            label = 'author';
            break;
        }
        case CLASSES.COMPARISON: {
            label = 'comparison';
            break;
        }
        case CLASSES.VENUE: {
            label = 'venue';
            break;
        }
        case CLASSES.NODE_SHAPE: {
            label = 'template';
            break;
        }
        case CLASSES.VISUALIZATION: {
            label = 'visualization';
            break;
        }
        case CLASSES.CONTRIBUTION: {
            label = 'contribution';
            break;
        }
        case ENTITIES.RESOURCE: {
            label = 'resource';
            break;
        }
        case ENTITIES.PREDICATE: {
            label = 'predicate';
            break;
        }
        default: {
            label = 'resource';
            break;
        }
    }

    return label;
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
    const publicURL = env('PUBLIC_URL').endsWith('/') ? env('PUBLIC_URL').slice(0, -1) : env('PUBLIC_URL');
    return `${window.location.protocol}//${window.location.host}${publicURL}`;
};

/**
 * Use reverse from 'named-urls' and automatically slugifies the slug param
 * @param route name of the route
 * @param params route params to pass
 * @param params.slug the slug for this param
 */
export const reverseWithSlug = (route, params) => reverse(route, { ...params, slug: params.slug ? slugify(params.slug) : undefined });

/**
 * check if Cookies is enabled
 * @return {Boolean}
 */
export const checkCookie = () => {
    cookies.set('testcookie', 1, { path: env('PUBLIC_URL'), maxAge: 5 });
    const cookieEnabled = cookies.get('testcookie') ? cookies.get('testcookie') : null;
    return !!cookieEnabled;
};

export const filterStatementsBySubjectId = (statements, subjectId) => statements.filter((statement) => statement.subject.id === subjectId);

/**
 * Parse resource statements and return an object of its type
 * @param {Object} resource resource
 * @param {Array} statements Statements
 */
export const getDataBasedOnType = (resource, statements) => {
    if (resource?.classes?.includes(CLASSES.PAPER)) {
        return getPaperData(resource, statements);
    }
    if (resource?.classes?.includes(CLASSES.COMPARISON)) {
        return getComparisonData(resource, statements);
    }
    if (resource?.classes?.includes(CLASSES.VISUALIZATION)) {
        return getVisualizationData(resource, statements);
    }
    if (resource?.classes?.includes(CLASSES.SMART_REVIEW) || resource?.classes?.includes(CLASSES.SMART_REVIEW_PUBLISHED)) {
        return getReviewData(resource, statements);
    }
    if (resource?.classes?.includes(CLASSES.LITERATURE_LIST) || resource?.classes?.includes(CLASSES.LITERATURE_LIST_PUBLISHED)) {
        return getListData(resource, statements);
    }
    return undefined;
};

const isInTest = typeof global.it === 'function';
export const LOCATION_CHANGE = !isInTest ? LOCATION_CHANGE_RFH : 'NoReset';

export const handleSortableHoverReactDnd = ({ item, monitor, currentRef, hoverIndex, handleUpdate }) => {
    if (!currentRef) {
        return;
    }
    const dragIndex = item.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
        return;
    }
    // Determine rectangle on screen
    const hoverBoundingRect = currentRef.getBoundingClientRect();
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
    }
    // Time to actually perform the action
    handleUpdate({ dragIndex, hoverIndex });

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex;
};

export const convertAuthorToOldFormat = (author) => ({
    id: author.id,
    label: author.name,
    orcid: author.identifiers?.orcid?.[0],
    _class: author.id ? ENTITIES.RESOURCE : ENTITIES.LITERAL,
});
export const convertAuthorsToOldFormat = (authors) => authors.map((author) => convertAuthorToOldFormat(author));

export const convertAuthorToNewFormat = (author) => ({
    id: author.classes && author.classes.includes(CLASSES.AUTHOR) ? author.id : null,
    name: author.label,
    ...(author.orcid
        ? {
              identifiers: {
                  orcid: author.orcid ? [author.orcid] : [],
              },
          }
        : {}),
});

export const convertAuthorsToNewFormat = (authors) => authors.map((author) => convertAuthorToNewFormat(author));

export const convertVisualizationToNewFormat = (visualization) => ({
    id: visualization.id,
    title: visualization.label,
    authors: visualization.authors.map((author) => convertAuthorToNewFormat(author)),
    organizations: visualization.organizations,
    observatories: visualization.observatories,
    extraction_method: visualization.extraction_method,
    created_at: visualization.created_at,
    created_by: visualization.created_by,
    visibility: visualization.visibility,
    description: visualization.description,
});

export const convertComparisonToNewFormat = (comparison) => ({
    id: comparison.id,
    title: comparison.label,
    description: comparison.description,
    ...(comparison.researchField ? { research_fields: [comparison.researchField] } : {}),
    ...(comparison.doi
        ? {
              identifiers: {
                  doi: comparison.doi,
              },
          }
        : {}),
    publication_info: {
        published_month: comparison.publicationMonth?.label,
        published_year: comparison.publicationYear?.label,
        published_in: comparison.publishedIn?.label,
        url: comparison.url?.label,
    },
    versions: comparison.versions,
    authors: comparison.authors.map((author) => convertAuthorToNewFormat(author)),
    contributions: comparison.contributions,
    visualizations: comparison.visualizations,
    related_figures: comparison.figures,
    related_resources: comparison.resources,
    references: comparison.references,
    observatories: comparison.observatories,
    organizations: comparison.organizations,
    extraction_method: comparison.extraction_method,
    created_at: comparison.created_at,
    created_by: comparison.created_by,
    previous_version: comparison.hasPreviousVersion?.id,
    is_anonymized: comparison.anonymized,
    visibility: comparison.visibility,
});

export const convertPaperToNewFormat = (paper) => ({
    id: paper.id,
    title: paper.title || paper.label,
    ...(paper.researchField ? { research_fields: [paper.researchField] } : {}),
    ...(paper.doi
        ? {
              identifiers: {
                  doi: [paper.doi.label],
              },
          }
        : {}),
    publication_info: {
        published_month: paper.publicationMonth?.label,
        published_year: paper.publicationYear?.label,
        published_in: paper.publishedIn,
        url: paper.url?.label,
    },
    authors: paper.authors ? paper.authors.map((author) => convertAuthorToNewFormat(author)) : [],
    contributions: paper.contributions,
    organizations: [paper.organization_id],
    observatories: [paper.observatory_id],
    extraction_method: paper.extractionMethod,
    created_at: paper.created_at,
    created_by: paper.created_by,
    verified: paper.verified,
    visibility: paper.visibility,
    unlisted_by: paper.unlisted_by,
});
