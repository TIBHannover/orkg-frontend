import capitalize from 'capitalize';
import { FILTER_TYPES } from 'constants/comparisonFilterTypes';
import { CLASSES, MISC, PREDICATES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { find, flatten, flattenDepth, isEqual, isString, last, uniq, sortBy, uniqBy, isEmpty, cloneDeep } from 'lodash';
import { unescape } from 'he';
import { reverse } from 'named-urls';
import queryString from 'query-string';
import rdf from 'rdf';
import { createLiteral as createLiteralApi } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementsByIds,
    getStatementsByPredicateAndLiteral
} from 'services/backend/statements';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import slugifyString from 'slugify';

const cookies = new Cookies();

export function hashCode(s) {
    return s.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
}

/**
 * Parse comma separated values from the query string
 *
 * @param {String} locationSearch this.props.location.search
 * @param {String} param parameter name
 * @return {Array} the list of values
 */

export function getArrayParamFromQueryString(locationSearch, param) {
    const values = queryString.parse(locationSearch, { arrayFormat: 'comma' })[param];
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
 * @param {String} locationSearch this.props.location.search
 * @param {String} param parameter name
 * @param {Boolean} boolean return false instead of null
 * @return {String|Boolean} value
 */

export function getParamFromQueryString(locationSearch, param, boolean = false) {
    const value = queryString.parse(locationSearch)[param];
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

export function groupBy(array, group) {
    const hash = Object.create(null);
    const result = [];

    array.forEach(a => {
        const groupByElement = a[group];
        if (!hash[groupByElement]) {
            hash[groupByElement] = [];
            result.push(hash[groupByElement]);
        }
        hash[groupByElement].push(a);
    });

    return result;
}

export function groupByObjectWithId(array, propertyName) {
    const hash = Object.create(null);
    const result = [];

    array.forEach(a => {
        const groupId = a[propertyName].id;
        if (!hash[groupId]) {
            hash[groupId] = [];
            result.push(hash[groupId]);
        }
        hash[groupId].push(a);
    });

    return result;
}

export function deleteArrayEntryByObjectValue(arr, object, value) {
    const newArr = [...arr];

    let indexToDelete = -1;

    for (let i = 0; i < newArr.length; i++) {
        if (newArr[i][object] === value) {
            indexToDelete = i;
            break;
        }
    }

    if (indexToDelete > -1) {
        newArr.splice(indexToDelete, 1);
    }

    return newArr;
}

export const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

export const range = (start, end) => {
    return [...Array(1 + end - start).keys()].map(v => start + v);
};

export function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Promise timeout'));
        }, ms);
        promise.then(
            res => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            err => {
                clearTimeout(timeoutId);
                reject(err);
            }
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
export const get_error_message = (errors, field = null) => {
    if (!errors) {
        return null;
    }
    if (field === null) {
        return Boolean(errors.message) ? errors.message : null;
    }
    const field_error = errors.errors ? errors.errors.find(e => e.field === field) : null;
    return field_error ? capitalize(field_error.message) : null;
};

/**
 * Parse paper statements and return a a paper object
 *
 * @param {Array} paperStatements
 */
export const getPaperData_ViewPaper = (paperResource, paperStatements) => {
    const authors = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false);
    const contributions = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);

    return {
        paperResource: paperResource,
        authors: authors ? authors.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : [], // statements are ordered desc, so first author is last => thus reverse
        contributions: contributions.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
        publicationMonth: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_MONTH, true),
        publicationYear: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_YEAR, true),
        doi: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_DOI, true),
        researchField: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD),
        publishedIn: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_VENUE, true),
        url: filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.URL, true)
    };
};

/**
 * Parse paper statements and return a a paper object
 * @param {Object} resource Paper resource
 * @param {Array} paperStatements
 */

export const getPaperData = (resource, paperStatements) => {
    let doi = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_DOI, true);
    if (doi && doi.label.includes('10.') && !doi.label.startsWith('10.')) {
        doi = { ...doi, label: doi.label.substring(doi.label.indexOf('10.')) };
    }
    const researchField = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD);
    const publicationYear = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_YEAR, true);
    const publicationMonth = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_MONTH, true); // gets month[0] and resourceId[1]
    const authors = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false);
    const contributions = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
    const order = getOrder(paperStatements);

    return {
        ...resource,
        id: resource.id,
        label: resource.label ? resource.label : 'No Title',
        publicationYear,
        publicationMonth,
        researchField,
        doi,
        authors: authors ? authors.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : [],
        contributions: contributions ? contributions.sort((a, b) => a.label.localeCompare(b.label)) : [], // sort contributions ascending, so contribution 1, is actually the first one
        order,
        created_by: resource.created_by !== MISC.UNKNOWN_ID ? resource.created_by : null
    };
};

/**
 * Parse smart review statements and return a smart review object
 * @param {Object} resource Smart Review resource
 * @param {Array} statements Smart Review Statements
 */
export const getSmartReviewData = (resource, statements) => {
    const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
    const paperId = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_PAPER, true)?.id;
    const researchField = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_RESEARCH_FIELD, true, CLASSES.RESEARCH_FIELD);
    const authors = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_AUTHOR, false);
    return {
        ...resource,
        id: resource.id,
        label: resource.label ? resource.label : 'No Title',
        description: description?.label ?? '',
        researchField,
        authors,
        paperId
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
        googleScholar
    };
};

/**
 * Parse comparison statements and return a comparison object
 * @param {Object} resource Comparison resource
 * @param {Array} comparisonStatements
 */
export const getComparisonData = (resource, comparisonStatements) => {
    const description = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.DESCRIPTION, true);
    const contributions = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.COMPARE_CONTRIBUTION,
        false,
        CLASSES.CONTRIBUTION
    );
    const references = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.REFERENCE, false);
    const doi = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_DOI, true);
    const hasPreviousVersion = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.HAS_PREVIOUS_VERSION,
        true,
        CLASSES.COMPARISON
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
        CLASSES.COMPARISON_RELATED_RESOURCE
    );
    const figures = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.RELATED_FIGURE,
        false,
        CLASSES.COMPARISON_RELATED_FIGURE
    );
    const visualizations = filterObjectOfStatementsByPredicateAndClass(
        comparisonStatements,
        PREDICATES.HAS_VISUALIZATION,
        false,
        CLASSES.VISUALIZATION
    );
    const authors = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_AUTHOR, false);
    const properties = filterObjectOfStatementsByPredicateAndClass(comparisonStatements, PREDICATES.HAS_PROPERTY, false);

    return {
        ...resource,
        label: resource.label ? resource.label : 'No Title',
        authors: authors ? authors.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : [], // sort authors by their statement creation time (s_created_at)
        contributions: contributions,
        references,
        doi: doi ? doi.label : '',
        description: description ? description.label : '',
        icon: icon ? icon.label : '',
        order: order ? order.label : Infinity,
        type: type ? type.id : '',
        onHomePage: onHomePage ? true : false,
        researchField: subject,
        hasPreviousVersion,
        visualizations,
        figures,
        resources,
        properties
    };
};

/**
 * Parse template component statements and return a component object
 * @param {Object} component
 * @param {Array} componentStatements
 */
export const getTemplateComponentData = (component, componentStatements) => {
    const property = filterObjectOfStatementsByPredicateAndClass(
        componentStatements,
        PREDICATES.TEMPLATE_COMPONENT_PROPERTY,
        true,
        null,
        component.id
    );
    const value = filterObjectOfStatementsByPredicateAndClass(componentStatements, PREDICATES.TEMPLATE_COMPONENT_VALUE, true, null, component.id);

    const validationRules = filterObjectOfStatementsByPredicateAndClass(
        componentStatements,
        PREDICATES.TEMPLATE_COMPONENT_VALIDATION_RULE,
        false,
        null,
        component.id
    );

    const minOccurs = filterObjectOfStatementsByPredicateAndClass(
        componentStatements,
        PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MIN,
        true,
        null,
        component.id
    );

    const maxOccurs = filterObjectOfStatementsByPredicateAndClass(
        componentStatements,
        PREDICATES.TEMPLATE_COMPONENT_OCCURRENCE_MAX,
        true,
        null,
        component.id
    );

    const order = filterObjectOfStatementsByPredicateAndClass(componentStatements, PREDICATES.TEMPLATE_COMPONENT_ORDER, true, null, component.id);

    return {
        id: component.id,
        property: property
            ? {
                  id: property.id,
                  label: property.label
              }
            : {},
        value: value
            ? {
                  id: value.id,
                  label: value.label
              }
            : null,
        minOccurs: minOccurs ? minOccurs.label : 0,
        maxOccurs: maxOccurs ? maxOccurs.label : null,
        order: order ? order.label : null,
        validationRules:
            validationRules && Object.keys(validationRules).length > 0
                ? validationRules.reduce((obj, item) => {
                      const rule = item.label.split(/#(.+)/)[0];
                      const value = item.label.split(/#(.+)/)[1];
                      return Object.assign(obj, { [rule]: value });
                  }, {})
                : {}
    };
};

/**
 * Parse visualization statements and return a visualization object
 * @param {String} id
 * @param {String } label
 * @param {Array} visualizationStatements
 */
export const getVisualizationData = (resource, visualizationStatements) => {
    const description = visualizationStatements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);
    const authors = filterObjectOfStatementsByPredicateAndClass(visualizationStatements, PREDICATES.HAS_AUTHOR, false);

    return {
        ...resource,
        description: description ? description.object.label : '',
        authors: authors ? authors.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : []
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
    const aisnum = /^\d+$/.test(a);
    const bisnum = /^\d+$/.test(b);
    if (aisnum && bisnum) {
        a = parseInt(a);
        b = parseInt(b);
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

export const generateRdfDataVocabularyFile = (data, contributions, properties, metadata) => {
    const element = document.createElement('a');
    const cubens = rdf.ns('http://purl.org/linked-data/cube#');
    const orkgVocab = rdf.ns('http://orkg.org/orkg/vocab/#');
    const orkgResource = rdf.ns('http://orkg.org/orkg/resource/');
    const gds = new rdf.Graph();
    //Vocabulary properties labels
    gds.add(new rdf.Triple(cubens('dataSet'), rdf.rdfsns('label'), new rdf.Literal('dataSet')));
    gds.add(new rdf.Triple(cubens('structure'), rdf.rdfsns('label'), new rdf.Literal('structure')));
    gds.add(new rdf.Triple(cubens('component'), rdf.rdfsns('label'), new rdf.Literal('component')));
    gds.add(new rdf.Triple(cubens('componentProperty'), rdf.rdfsns('label'), new rdf.Literal('component Property')));
    gds.add(new rdf.Triple(cubens('componentAttachment'), rdf.rdfsns('label'), new rdf.Literal('component Attachment')));
    gds.add(new rdf.Triple(cubens('dimension'), rdf.rdfsns('label'), new rdf.Literal('dimension')));
    gds.add(new rdf.Triple(cubens('attribute'), rdf.rdfsns('label'), new rdf.Literal('attribute')));
    gds.add(new rdf.Triple(cubens('measure'), rdf.rdfsns('label'), new rdf.Literal('measure')));
    gds.add(new rdf.Triple(cubens('order'), rdf.rdfsns('label'), new rdf.Literal('order')));
    //BNodes
    const ds = new rdf.BlankNode();
    const dsd = new rdf.BlankNode();
    //Dataset
    gds.add(new rdf.Triple(ds, rdf.rdfns('type'), cubens('DataSet')));
    // Metadata
    const dcterms = rdf.ns('http://purl.org/dc/terms/#');
    gds.add(new rdf.Triple(ds, dcterms('title'), new rdf.Literal(metadata.title ? metadata.title : `Comparison - ORKG`)));
    gds.add(new rdf.Triple(ds, dcterms('description'), new rdf.Literal(metadata.description ? metadata.description : `Description`)));
    gds.add(new rdf.Triple(ds, dcterms('creator'), new rdf.Literal(metadata.creator ? metadata.creator : `Creator`)));
    gds.add(new rdf.Triple(ds, dcterms('date'), new rdf.Literal(metadata.date ? metadata.date : `Date`)));
    gds.add(new rdf.Triple(ds, dcterms('license'), new rdf.NamedNode('https://creativecommons.org/licenses/by-sa/4.0/')));
    gds.add(new rdf.Triple(ds, rdf.rdfsns('label'), new rdf.Literal(`Comparison - ORKG`)));
    gds.add(new rdf.Triple(ds, cubens('structure'), dsd));
    // DataStructureDefinition
    gds.add(new rdf.Triple(dsd, rdf.rdfns('type'), cubens('DataStructureDefinition')));
    gds.add(new rdf.Triple(dsd, rdf.rdfsns('label'), new rdf.Literal('Data Structure Definition')));
    const cs = {};
    const dt = {};
    //components
    const columns = [
        { id: 'Properties', title: 'Properties' },
        ...contributions
            .filter(c => c.active)
            .map((contribution, index) => {
                return contribution;
            })
    ];
    columns.forEach(function(column, index) {
        if (column.id === 'Properties') {
            cs[column.id] = new rdf.BlankNode();
            dt[column.id] = orkgVocab('Property');
        } else {
            cs[column.id] = new rdf.BlankNode();
            dt[column.id] = orkgResource(`${column.id}`);
        }

        gds.add(new rdf.Triple(dsd, cubens('component'), cs[column.id]));
        gds.add(new rdf.Triple(cs[column.id], rdf.rdfns('type'), cubens('ComponentSpecification')));
        gds.add(new rdf.Triple(cs[column.id], rdf.rdfsns('label'), new rdf.Literal(`Component Specification`)));
        gds.add(new rdf.Triple(cs[column.id], cubens('order'), new rdf.Literal(index.toString())));
        if (column.id === 'Properties') {
            gds.add(new rdf.Triple(cs[column.id], cubens('dimension'), dt[column.id]));
            gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('DimensionProperty')));
        } else {
            gds.add(new rdf.Triple(cs[column.id], cubens('measure'), dt[column.id]));
            gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('MeasureProperty')));
        }
        gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('ComponentProperty')));
        gds.add(new rdf.Triple(dt[column.id], rdf.rdfsns('label'), new rdf.Literal(column.title.toString())));
    });
    //data
    properties
        .filter(property => property.active && data[property.id])
        .map((property, index) => {
            const bno = new rdf.BlankNode();
            gds.add(new rdf.Triple(bno, rdf.rdfns('type'), cubens('Observation')));
            gds.add(new rdf.Triple(bno, rdf.rdfsns('label'), new rdf.Literal(`Observation #{${index + 1}}`)));
            gds.add(new rdf.Triple(bno, cubens('dataSet'), ds));
            gds.add(new rdf.Triple(bno, dt['Properties'].toString(), new rdf.Literal(property.label.toString())));
            contributions.map((contribution, index2) => {
                if (contribution.active) {
                    const cell = data[property.id][index2];
                    if (cell.length > 0) {
                        cell.map(v => {
                            if (v.type && v.type === 'resource') {
                                gds.add(new rdf.Triple(bno, dt[contribution.id].toString(), orkgResource(`${v.resourceId}`)));
                            } else {
                                gds.add(new rdf.Triple(bno, dt[contribution.id].toString(), new rdf.Literal(`${v.label ? v.label : ''}`)));
                            }
                            return null;
                        });
                    } else {
                        gds.add(new rdf.Triple(bno, dt[contribution.id].toString(), new rdf.Literal('Empty')));
                    }
                }
                return null;
            });
            return null;
        });
    //Create the RDF file
    const file = new Blob(
        [
            gds
                .toArray()
                .map(t => t.toString())
                .join('\n')
        ],
        { type: 'text/n3' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'ComparisonRDF.n3';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
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
        statement => statement.predicate.id === predicateID && (statement.subject.id === subjectID || subjectID === null)
    );
    if (classID) {
        result = statementsArray.filter(statement => statement.object.classes && statement.object.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].object, statementId: result[0].id, s_created_at: result[0].created_at };
    } else if (result.length > 0 && !isUnique) {
        return result.map(s => ({ ...s.object, statementId: s.id, s_created_at: s.created_at }));
    } else {
        return isUnique ? null : [];
    }
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
    let result = statementsArray.filter(statement => statement.predicate.id === predicateID);
    if (classID) {
        result = statementsArray.filter(statement => statement.subject.classes && statement.subject.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].subject, statementId: result[0].id, s_created_at: result[0].created_at };
    } else if (result.length > 0 && !isUnique) {
        return result.map(s => ({ ...s.subject, statementId: s.id, s_created_at: s.created_at }));
    } else {
        return isUnique ? null : [];
    }
};

// https://stackoverflow.com/questions/42921220/is-any-solution-to-do-localstorage-setitem-in-asynchronous-way-in-javascript
export const asyncLocalStorage = {
    setItem: function(key, value) {
        return Promise.resolve().then(function() {
            localStorage.setItem(key, value);
        });
    },
    getItem: function(key) {
        return Promise.resolve().then(function() {
            return localStorage.getItem(key);
        });
    },
    removeItem: function(key) {
        return Promise.resolve().then(function() {
            return localStorage.removeItem(key);
        });
    }
};

/**
 * Create an extended version of propertyIds
 * (ADD the IDs of similar properties)
 * it's important to keep the order so the result table get a correct order
 * @param {Array} propertyIds properties ids from the query string
 * @param {String} data Comparison data
 */
export const extendPropertyIds = (propertyIds, data) => {
    const result = [];
    propertyIds.forEach(function(pID, index) {
        result.push(pID);
        // loop on the predicates of comparison result
        for (const [pr, values] of Object.entries(data)) {
            // flat the all contribution values for the current predicate and
            // check if there similar predicate.
            // (the target similar predicate is supposed to be the last in the path of value)
            const allV = flattenDepth(values, 2).filter(value => {
                if (value.path && value.path.length > 0 && value.path[value.path.length - 1] === pID && pr !== pID) {
                    return true;
                } else {
                    return false;
                }
            });
            if (allV.length > 0) {
                result.push(pr);
            }
        }
    });
    return result;
};

/**
 * Make sure the the predicateList fits with the comparison approach
 * Merge approach -> the predicateList is a list of predicate ids
 * Path approach -> the predicateList is a list of paths
 * This assumes that there's  no Predicate ID that contains "/"
 * @param {Array} predicatesList properties ids from the query string
 * @param {String} _comparisonType Comparison type
 * @return {Boolean} the list of values
 */
export const isPredicatesListCorrect = (propertyIds, _comparisonType) => {
    if (propertyIds.length === 0) {
        return true;
    }
    if (_comparisonType === 'merge') {
        return propertyIds.every(element => !element.includes('/'));
    } else if (_comparisonType === 'path') {
        return propertyIds.some(element => element.includes('/') || !element.match(/^P([0-9])+$/));
    }
    return true;
};

/**
 * Get Similar properties labels by Label
 * (similar properties)
 * @param {String} propertyLabel property label
 * @param {Array} propertyData property comparison data
 */
export const similarPropertiesByLabel = (propertyLabel, propertyData) => {
    const result = [];
    // flat property values and add similar but not equal labels
    flattenDepth(propertyData, 2).forEach(function(value, index) {
        if (value.pathLabels && value.pathLabels.length > 0 && value.pathLabels[value.pathLabels.length - 1] !== propertyLabel) {
            result.push(value.pathLabels[value.pathLabels.length - 1]);
        }
    });
    return uniq(result);
};

export function list_to_tree(list) {
    const map = {};
    let node;
    const roots = [];
    let i;
    list = sortBy(list, 'hasPreviousVersion');
    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        const v = list[i].hasPreviousVersion;
        list[i].versions = v && !list.find(c => c.id === v.id) ? [list[i].hasPreviousVersion] : []; // initialize the versions
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

function convertTreeToFlat(treeStructure) {
    const flatten = (children, extractChildren) =>
        Array.prototype.concat.apply(children, children.map(x => flatten(extractChildren(x) || [], extractChildren)));
    const extractChildren = x => x.versions ?? [];
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
    // 2- Make a tree of versions
    let result = list_to_tree(uniqBy(sortBy(comparisons, 'hasPreviousVersion'), 'id'));
    // 3- We flat the versions  inside the roots
    for (let i = 0; i < result.length; i += 1) {
        // Always the new version if the main resource
        const arrayVersions = [...convertTreeToFlat(result[i]), result[i]].sort(sortFunc);
        result[i] = { ...arrayVersions[0], versions: arrayVersions };
    }
    // 4- We sort the roots
    result = result.sort(sortFunc);
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

// TODO: could be part of a 'parseDoi' hook when the add paper wizard is refactored to support hooks
export const parseCiteResult = paper => {
    let paperTitle = '',
        paperAuthors = [],
        paperPublicationMonth = '',
        paperPublicationYear = '',
        doi = '',
        publishedIn = '',
        url = '';

    try {
        const { title, subtitle, author, issued, DOI, URL, 'container-title': containerTitle } = paper.data[0];

        paperTitle = title;
        if (subtitle && subtitle.length > 0) {
            // include the subtitle
            paperTitle = unescape(`${paperTitle}: ${subtitle[0]}`);
        }
        if (author) {
            paperAuthors = author.map(author => {
                let fullname = [author.given, author.family].join(' ').trim();
                if (!fullname) {
                    fullname = author.literal ? author.literal : '';
                }
                return {
                    label: unescape(fullname),
                    id: fullname,
                    orcid: author.ORCID ? author.ORCID : ''
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
        doi = DOI ? DOI : '';
        url = URL ? URL : '';
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
        url
    };
};

function getOrder(paperStatements) {
    let order = paperStatements.filter(statement => statement.predicate.id === PREDICATES.ORDER);
    if (order.length > 0) {
        order = order[0].object.label;
    } else {
        order = Infinity;
    }
    return order;
}

/**
 * Parse resources statements and return a related figures objects
 * @param {Array} resourceStatements
 */
export function getRelatedFiguresData(resourcesStatements) {
    const _figures = resourcesStatements.map(resourceStatements => {
        const imageStatement = resourceStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
        const alt = resourceStatements.statements.length ? resourceStatements.statements[0]?.subject?.label : null;
        return {
            src: imageStatement ? imageStatement.object.label : '',
            figureId: resourceStatements.id,
            alt
        };
    });
    return _figures;
}

/**
 * Parse resources statements and return a related resources objects
 * @param {Array} resourceStatements
 */
export function getRelatedResourcesData(resourcesStatements) {
    const _resources = resourcesStatements.map(resourceStatements => {
        const imageStatement = resourceStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
        const urlStatement = resourceStatements.statements.find(statement => statement.predicate.id === PREDICATES.URL);
        const descriptionStatement = resourceStatements.statements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);
        return {
            url: urlStatement ? urlStatement.object.label : '',
            image: imageStatement ? imageStatement.object.label : '',
            id: resourceStatements.id,
            title: resourceStatements.statements[0]?.subject?.label,
            description: descriptionStatement ? descriptionStatement.object.label : ''
        };
    });
    return _resources;
}

/**
 * Truncating middle portion of a string
 *
 * @param {String} str string
 * @param {Number} firstCharCount first Char Count
 * @param {Number} endCharCount end Char count
 * @param {Number} dotCount dotCount
 * @return {Array} the list of values
 */
export function truncStringPortion(str, firstCharCount = str.length, endCharCount = 0, dotCount = 3) {
    if (str === null) {
        return '';
    }
    if (
        (firstCharCount === 0 && endCharCount === 0) ||
        firstCharCount >= str.length ||
        endCharCount >= str.length ||
        firstCharCount + endCharCount >= str.length
    ) {
        return str;
    } else if (endCharCount === 0) {
        return str.slice(0, firstCharCount) + '.'.repeat(dotCount);
    } else {
        return str.slice(0, firstCharCount) + '.'.repeat(dotCount) + str.slice(str.length - endCharCount);
    }
}

// TODO: refactor the authors dialog and create a hook to put this function
export async function saveAuthors({ prevAuthors, newAuthors, paperId }) {
    if (isEqual(prevAuthors, newAuthors)) {
        return prevAuthors;
    }

    const statementsIds = [];
    // remove all authors statement from reducer
    for (const author of prevAuthors) {
        statementsIds.push(author.statementId);
    }
    deleteStatementsByIds(statementsIds);

    // Add all authors from the state
    const authors = cloneDeep(newAuthors);
    for (const [i, author] of newAuthors.entries()) {
        // create the author
        if (author.orcid) {
            // Create author with ORCID
            // check if there's an author resource
            const responseJson = await getStatementsByPredicateAndLiteral({
                predicateId: PREDICATES.HAS_ORCID,
                literal: author.orcid,
                subjectClass: CLASSES.AUTHOR,
                items: 1
            });
            if (responseJson.length > 0) {
                // Author resource exists
                const authorResource = responseJson[0];
                const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, authorResource.subject.id);
                authors[i].statementId = authorStatement.id;
                authors[i].id = authorResource.subject.id;
                authors[i].class = authorResource.subject._class;
                authors[i].classes = authorResource.subject.classes;
            } else {
                // Author resource doesn't exist
                // Create resource author
                const authorResource = await createResource(author.label, [CLASSES.AUTHOR]);
                const createLiteral = await createLiteralApi(author.orcid);
                await createLiteralStatement(authorResource.id, PREDICATES.HAS_ORCID, createLiteral.id);
                const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, authorResource.id);
                authors[i].statementId = authorStatement.id;
                authors[i].id = authorResource.id;
                authors[i].class = authorResource._class;
                authors[i].classes = authorResource.classes;
            }
        } else {
            // Author resource exists
            if (author.label !== author.id) {
                const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, author.id);
                authors[i].statementId = authorStatement.id;
                authors[i].id = author.id;
                authors[i].class = author._class;
                authors[i].classes = author.classes;
            } else {
                // Author resource doesn't exist
                const newLiteral = await createLiteralApi(author.label);
                // Create literal of author
                const authorStatement = await createLiteralStatement(paperId, PREDICATES.HAS_AUTHOR, newLiteral.id);
                authors[i].statementId = authorStatement.id;
                authors[i].id = newLiteral.id;
                authors[i].class = authorStatement.object._class;
                authors[i].classes = authorStatement.object.classes;
            }
        }
    }

    return authors;
}
/**
 * Stringify filter type of comparison
 *
 * @param {String} type filter
 * @return {String} String
 */
export const stringifyType = type => {
    switch (type) {
        case FILTER_TYPES.ONE_OF:
            return 'is One of:';
        case FILTER_TYPES.GTE:
            return '>=';
        case FILTER_TYPES.GTE_DATE:
            return 'is after:';
        case FILTER_TYPES.LTE:
            return '<=';
        case FILTER_TYPES.NEQ_DATE:
            return '!=';
        case FILTER_TYPES.NEQ:
            return '!=';
        case FILTER_TYPES.LTE_DATE:
            return 'is before:';
        case FILTER_TYPES.INC:
            return 'includes one of:';
        default:
            return type;
    }
};

/**
 * get Rules by property id
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} Rules
 */
export const getRuleByProperty = (filterControlData, propertyId) => filterControlData.find(item => item.property.id === propertyId)?.rules;

/**
 * get Values by property
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} values
 */
export const getValuesByProperty = (filterControlData, propertyId) => filterControlData.find(item => item.property.id === propertyId)?.values;

/**
 * get data for each property
 *
 * @param {Array} filterControlData filters array
 * @param {String} propertyId Property ID
 * @return {Array} Data of the property
 */
export const getDataByProperty = (filterControlData, propertyId) => filterControlData.find(item => item.property.id === propertyId);

/**
 * Check if the filters is empty
 *
 * @param {Array} data filters array
 * @return {Boolean} Whether the filters are empty or not
 */
export const areAllRulesEmpty = data => [].concat(...data.map(item => item.rules)).length > 0;

/**
 * Comparison filter rules applying
 *
 */
const applyOneOf = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(...value.map(key => data[key]));
};

const applyGte = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => parseFloat(key) >= parseFloat(value))
            .map(key => data[key])
    );
};

const applyLte = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => parseFloat(key) <= parseFloat(value))
            .map(key => data[key])
    );
};

const applyGteDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => key >= value)
            .map(key => data[key])
    );
};

const applyLteDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => key <= value)
            .map(key => data[key])
    );
};

const applyNotEq = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => !value.includes(parseFloat(key)))
            .map(key => data[key])
    );
};

const applyNotEqDate = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => !value.includes(key))
            .map(key => data[key])
    );
};

const applyInc = ({ filterControlData, propertyId, value }) => {
    const data = getValuesByProperty(filterControlData, propertyId);
    return [].concat(
        ...Object.keys(data)
            .filter(key => value.filter(val => key.includes(val)).length > 0)
            .map(key => data[key])
    );
};

export const applyRule = ({ filterControlData, type, propertyId, value }) => {
    switch (type) {
        case FILTER_TYPES.ONE_OF:
            return applyOneOf({ filterControlData, propertyId, value });
        case FILTER_TYPES.GTE:
            return applyGte({ filterControlData, propertyId, value });
        case FILTER_TYPES.GTE_DATE:
            return applyGteDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.LTE:
            return applyLte({ filterControlData, propertyId, value });
        case FILTER_TYPES.NEQ_DATE:
            return applyNotEqDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.NEQ:
            return applyNotEq({ filterControlData, propertyId, value });
        case FILTER_TYPES.LTE_DATE:
            return applyLteDate({ filterControlData, propertyId, value });
        case FILTER_TYPES.INC:
            return applyInc({ filterControlData, propertyId, value });
        default:
            return [];
    }
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
        [CLASSES.PAPER]: [ROUTES.RESOURCE, 'resourceId'],
        [CLASSES.PROBLEM]: [ROUTES.RESEARCH_PROBLEM, 'researchProblemId'],
        [CLASSES.AUTHOR]: [ROUTES.AUTHOR_PAGE, 'authorId'],
        [CLASSES.COMPARISON]: [ROUTES.COMPARISON, 'comparisonId'],
        [CLASSES.VENUE]: [ROUTES.VENUE_PAGE, 'venueId'],
        [CLASSES.TEMPLATE]: [ROUTES.TEMPLATE, 'id'],
        [CLASSES.VISUALIZATION]: [ROUTES.VISUALIZATION, 'id'],
        [CLASSES.CONTRIBUTION]: [ROUTES.CONTRIBUTION, 'id'],
        [CLASSES.SMART_REVIEW_PUBLISHED]: [ROUTES.SMART_REVIEW, 'id'],
        [ENTITIES.RESOURCE]: [ROUTES.RESOURCE, 'id'],
        [ENTITIES.PREDICATE]: [ROUTES.PROPERTY, 'id'],
        [ENTITIES.CLASS]: [ROUTES.CLASS, 'id'],
        default: [ROUTES.RESOURCE, 'id']
    };
    const [route, idParam] = links[classId] || links['default'];
    return reverse(route, { [idParam]: id });
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
        [ENTITIES.PREDICATE]: ROUTES.PROPERTY
    };
    return links[_class] ? reverse(links[_class], { id }) : '';
};

/**
 * Get resource type label based on class
 *
 * @param {String} classId class ID
 * @result {String} resource label
 */
export const getResourceTypeLabel = classId => {
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
        case CLASSES.TEMPLATE: {
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
export const stringifySort = sort => {
    const stringsSortMapping = {
        newest: 'Newest first',
        oldest: 'Oldest first',
        featured: 'Featured',
        top: 'Last 30 days',
        all: 'All time'
    };
    return stringsSortMapping[sort] ?? stringsSortMapping['newest'];
};

/**
 * Use reverse from 'named-urls' and automatically slugifies the slug param
 * @param input string that should be slugified
 */
export const slugify = input => {
    return slugifyString(input.replace('/', ' '), '_');
};

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
 * Get property object from comparison data
 * (This function is useful to make the property clickable when using the comparison type "path")
 * @param {Array} data Comparison data
 * @param {Object} value The property path
 * @return {Object} The property object
 */
export const getPropertyObjectFromData = (data, value) => {
    const notEmptyCell = find(flatten(data[value.id]), function(v) {
        return v?.path?.length > 0;
    });
    return notEmptyCell && notEmptyCell.path?.length && notEmptyCell.pathLabels?.length
        ? { id: last(notEmptyCell.path), label: last(notEmptyCell.pathLabels) }
        : value;
};

/**
 * check if Cookies is enabled
 * @return {Boolean}
 */
export const checkCookie = () => {
    cookies.set('testcookie', 1, { path: env('PUBLIC_URL'), maxAge: 5 });
    const cookieEnabled = cookies.get('testcookie') ? cookies.get('testcookie') : null;
    return cookieEnabled ? true : false;
};

export const filterStatementsBySubjectId = (statements, subjectId) => {
    return statements.filter(statement => statement.subject.id === subjectId);
};

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
    if (resource?.classes?.includes(CLASSES.SMART_REVIEW)) {
        return getSmartReviewData(resource, statements);
    } else {
        return undefined;
    }
};

// returns the position of the first differing character between
// $left and $right, or -1 if either is empty
export const stringComparePosition = (left, right) => {
    if (isEmpty(left) || isEmpty(right)) {
        return -1;
    }
    let i;
    i = 0;
    while (left[i] && left[i] === right[i]) {
        i++;
    }
    return i - 1;
};

// returns the part of the string preceding (but not including) the
// final directory delimiter, or empty if none are found
export const truncateToLastDir = str => {
    return str.substr(0, str.lastIndexOf('/')).toString();
};

export const groupArrayByDirectoryPrefix = strings => {
    const groups = {};
    const numStrings = strings?.length;
    let i;
    for (i = 0; i < numStrings; i++) {
        let j;
        for (j = i + 1; j < numStrings; j++) {
            const pos = stringComparePosition(strings[i], strings[j]);
            const prefix = truncateToLastDir(strings[i].substr(0, pos + 1));
            // append to grouping for this prefix. include both strings - this
            // gives duplicates which we'll merge later
            groups[prefix] = groups[prefix]
                ? [
                      ...groups[prefix],
                      {
                          0: strings[i],
                          1: strings[j]
                      }
                  ]
                : [
                      {
                          0: strings[i],
                          1: strings[j]
                      }
                  ];
        }
    }
    let _key_;
    for (_key_ in groups) {
        let group;
        group = groups[_key_];
        // to remove duplicates introduced above
        group = uniq(flatten(group));
    }
    return groups;
};
