import capitalize from 'capitalize';
import queryString from 'query-string';
import { flattenDepth, uniq } from 'lodash';
import rdf from 'rdf';
import { PREDICATES, MISC } from 'constants/graphSettings';
import { isString } from 'lodash';

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
    const values = queryString.parse(decodeURIComponent(locationSearch), { arrayFormat: 'comma' })[param];
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
    const researchField = getResearchField(paperStatements);
    const publishedIn = getPublishedIn(paperStatements);
    const [publicationYear, publicationYearResourceId] = getPublicationYear(paperStatements);

    const authors = getAuthors(paperStatements);
    const contributions = getContributions(paperStatements);

    // publication month
    const [publicationMonth, publicationMonthResourceId] = getPublicationMonth(paperStatements);
    // DOI
    const [doi, doiResourceId] = getDOI(paperStatements);
    //url
    const [url, urlResourceId] = getURL(paperStatements);

    return {
        title: paperResource.label,
        paperResourceId: paperResource.id,
        contributions: contributions.sort((a, b) => a.label.localeCompare(b.label)), // sort contributions ascending, so contribution 1, is actually the first one
        authors: authors.reverse(), // statements are ordered desc, so first author is last => thus reverse
        publicationMonth: parseInt(publicationMonth),
        publicationMonthResourceId,
        publicationYear: parseInt(publicationYear),
        publicationYearResourceId,
        doi,
        doiResourceId,
        researchField,
        publishedIn,
        url,
        urlResourceId,
        createdBy: paperResource.created_by !== MISC.UNKNOWN_ID ? paperResource.created_by : null
    };
};

/**
 * Parse paper statements and return a a paper object
 * @param {String} id
 * @param {String} label
 * @param {Array} paperStatements
 */

export const getPaperData = (id, label, paperStatements) => {
    // research field
    const researchField = getResearchField(paperStatements);
    const publicationYear = getPublicationYear(paperStatements)[0]; // gets year[0] and resourceId[1]
    const publicationMonth = getPublicationMonth(paperStatements)[0]; // gets month[0] and resourceId[1]
    const [doi, doiResourceId] = getDOI(paperStatements); // more complex object, returns doi and doi resources as an array
    const authors = getAuthors(paperStatements);
    const contributions = getContributions(paperStatements);
    const order = getOrder(paperStatements);

    return {
        id,
        label,
        publicationYear,
        publicationMonth,
        researchField,
        doi,
        doiResourceId,
        authorNames: authors.sort((a, b) => a.created_at.localeCompare(b.created_at)),
        contributions: contributions.sort((a, b) => a.label.localeCompare(b.label)),
        order
    };
};

/**
 * Parse comparison statements and return a comparison object
 * @param {String} id
 * @param {String } label
 * @param {Array} comparisonStatements
 */
export const getComparisonData = (id, label, comparisonStatements) => {
    // description
    const description = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);

    // reference
    const reference = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.REFERENCE);

    // url
    const url = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.URL);

    // icon
    const icon = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.ICON);

    // type
    const type = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.TYPE);

    // order
    const order = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.ORDER);

    // onHomePage
    const onHomePage = comparisonStatements.find(statement => statement.predicate.id === PREDICATES.ON_HOMEPAGE);

    return {
        id,
        label,
        created_at: url ? url.object.created_at : '',
        nbContributions: url ? getArrayParamFromQueryString(url.object.label, 'contributions').length : 0,
        url: url ? url.object.label : '',
        reference: reference ? reference.object.label : '',
        description: description ? description.object.label : '',
        icon: icon ? icon.object.label : '',
        order: order ? order.object.label : Infinity,
        type: type ? type.object.id : '',
        onHomePage: onHomePage ? true : false
    };
};

/**
 * Parse visualization statements and return a visualization object
 * @param {String} id
 * @param {String } label
 * @param {Array} visualizationStatements
 */
export const getVisualizationData = (id, label, visualizationStatements) => {
    // description
    const description = visualizationStatements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);

    const authors = getAuthors(visualizationStatements);

    return {
        id,
        label,
        created_at: description ? description.object.created_at : '',
        description: description ? description.object.label : '',
        authorNames: authors.sort((a, b) => a.created_at.localeCompare(b.created_at))
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
 * Filter a list of statements by predicate id and return the object
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 */
export const filterObjectOfStatementsByPredicate = (statementsArray, predicateID, isUnique = true) => {
    if (!statementsArray) {
        return null;
    }
    const result = statementsArray.filter(statement => statement.predicate.id === predicateID);
    if (result.length > 0 && isUnique) {
        return result[0].object;
    } else if (result.length > 0 && !isUnique) {
        return result.map(s => s.object);
    } else {
        return null;
    }
};

/**
 * Filter a list of statements by predicate id and return the subject
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 */
export const filterSubjectOfStatementsByPredicate = (statementsArray, predicateID, isUnique = true) => {
    if (!statementsArray) {
        return null;
    }
    const result = statementsArray.filter(statement => statement.predicate.id === predicateID);
    if (result.length > 0 && isUnique) {
        return result[0].subject;
    } else if (result.length > 0 && !isUnique) {
        return result.map(s => s.subject);
    } else {
        return null;
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

/**
 * Compare input value to select options
 * Builtins https://github.com/JedWatson/react-select/blob/d2a820efc70835adf864169eebc76947783a15e2/packages/react-select/src/Creatable.js
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

/** Helper Functions to increase structure, readability and reuse **/
/** ------------------------------------------------------------- **/
// HERE THE INPUT IS 'paperStatements'  and output is based on some filtering

export function getPublicationMonth(paperStatements) {
    // publication month
    const publicationMonthStatements = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_MONTH);
    let publicationMonthResourceId = 0;
    let publicationMonth = 0;

    if (publicationMonthStatements.length > 0) {
        publicationMonth = publicationMonthStatements[0].object.label;
        publicationMonthResourceId = publicationMonthStatements[0].object.id;
    }

    return [publicationMonth, publicationMonthResourceId];
}

export function getPublicationYear(paperStatements) {
    let publicationYear = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_PUBLICATION_YEAR);
    let publicationYearResourceId = 0;
    if (publicationYear.length > 0) {
        publicationYearResourceId = publicationYear[0].object.id;
        publicationYear = publicationYear[0].object.label;
    } else {
        publicationYear = '';
    }

    return [publicationYear, publicationYearResourceId];
}

// TODO: could be part of a 'parseDoi' hook when the add paper wizard is refactored to support hooks
export const parseCiteResult = paper => {
    let paperTitle = '',
        paperAuthors = [],
        paperPublicationMonth = '',
        paperPublicationYear = '',
        doi = '',
        publishedIn = '';

    try {
        const { title, subtitle, author, issued, DOI, 'container-title': containerTitle } = paper.data[0];

        paperTitle = title;
        if (subtitle && subtitle.length > 0) {
            // include the subtitle
            paperTitle = `${paperTitle}: ${subtitle[0]}`;
        }
        if (author) {
            paperAuthors = author.map(author => {
                let fullname = [author.given, author.family].join(' ').trim();
                if (!fullname) {
                    fullname = author.literal ? author.literal : '';
                }
                return {
                    label: fullname,
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
        if (containerTitle && isString(containerTitle)) {
            publishedIn = containerTitle;
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
        publishedIn
    };
};

function getURL(paperStatements) {
    let url = paperStatements.filter(statement => statement.predicate.id === PREDICATES.URL);
    let urlResourceId = 0;

    if (url.length > 0) {
        urlResourceId = url[0].object.id;
        url = url[0].object.label;
    } else {
        url = null;
    }
    return [url, urlResourceId];
}

function getPublishedIn(paperStatements) {
    // venue
    let publishedIn = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_VENUE);

    if (publishedIn.length > 0) {
        publishedIn = { ...publishedIn[0].object, statementId: publishedIn[0].id };
    } else {
        publishedIn = '';
    }
    return publishedIn;
}

function getResearchField(paperStatements) {
    let researchField = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_RESEARCH_FIELD);
    if (researchField.length > 0) {
        researchField = { ...researchField[0].object, statementId: researchField[0].id };
    } else {
        researchField = {};
    }
    return researchField;
}

export function getAuthors(paperStatements) {
    const authors = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR);
    const authorNamesArray = [];
    if (authors.length > 0) {
        for (const author of authors) {
            authorNamesArray.push({
                id: author.object.id,
                statementId: author.id,
                class: author.object._class,
                label: author.object.label,
                classes: author.object.classes,
                created_at: author.created_at
            });
        }
    }
    return authorNamesArray;
}

function getDOI(paperStatements) {
    let doi = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_DOI);
    let doiResourceId = 0;
    if (doi.length > 0) {
        doiResourceId = doi[0].object.id;
        doi = doi[0].object.label;

        if (doi.includes('10.') && !doi.startsWith('10.')) {
            doi = doi.substring(doi.indexOf('10.'));
        }
    } else {
        doi = '';
    }
    return [doi, doiResourceId];
}

function getContributions(paperStatements) {
    const contributions = paperStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_CONTRIBUTION);
    const contributionArray = [];
    if (contributions.length > 0) {
        for (const contribution of contributions) {
            contributionArray.push({ ...contribution.object, statementId: contribution.id });
        }
    }
    return contributionArray;
}

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
