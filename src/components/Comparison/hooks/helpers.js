import { find, flatten, flattenDepth, groupBy, isEmpty, last, uniq } from 'lodash';
import { DataFactory, Store, Writer } from 'n3';
import qs from 'qs';

import { DEFAULT_COMPARISON_METHOD, LICENSE_URL } from '@/constants/misc';

const { namedNode, literal, blankNode, quad } = DataFactory;

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
    if (_comparisonType === 'MERGE') {
        return propertyIds.every((element) => !element.includes('/'));
    }
    if (_comparisonType === 'PATH') {
        return propertyIds.some((element) => element.includes('/') || !element.match(/^P([0-9])+$/));
    }
    return true;
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
    propertyIds.forEach((pID, index) => {
        result.push(pID);
        // loop on the predicates of comparison result
        for (const [pr, values] of Object.entries(data)) {
            // flat the all contribution values for the current predicate and
            // check if there similar predicate.
            // (the target similar predicate is supposed to be the last in the path of value)
            const allV = flattenDepth(values, 2).filter((value) => {
                if (value.path && value.path.length > 0 && value.path[value.path.length - 1] === pID && pr !== pID) {
                    return true;
                }
                return false;
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
    flattenDepth(propertyData, 2).forEach((value, index) => {
        if (
            value.path_labels &&
            value.path_labels.length > 0 &&
            value.path_labels[value.path_labels.length - 1]?.toLowerCase() !== propertyLabel?.toLowerCase()
        ) {
            result.push(value.path_labels[value.path_labels.length - 1]);
        }
    });
    return uniq(result);
};

/**
 * Generate Filter Control Data
 *
 * @param {Array} contributions Array of contributions
 * @param {Array} properties Array of properties
 * @param {Object} data Comparison Data object
 * @return {Array} Filter Control Data
 */
export const generateFilterControlData = (contributions, properties, data) => {
    const controlData = [
        ...properties.map((property) => ({
            property,
            rules: [],
            values: groupBy(
                flatten(contributions.map((_, index) => data[property.id][index]).filter(([first]) => Object.keys(first).length !== 0)),
                'label',
            ),
        })),
    ];
    controlData.forEach((item) => {
        Object.keys(item.values).forEach((key) => {
            item.values[key] = item.values[key].map(({ path }) => path[0]);
        });
    });
    return controlData;
};

/**
 * Get ordered list of selected properties
 */
export const activatedPropertiesToList = (propertiesData) => {
    const activeProperties = [];
    propertiesData.forEach((property, index) => {
        if (property.active) {
            activeProperties.push(property.id);
        }
    });
    return activeProperties;
};

/**
 * Get ordered list of selected contributions
 */
export const activatedContributionsToList = (contributionsData) => {
    const activeContributions = [];
    contributionsData.forEach((contribution, index) => {
        if (contribution.active) {
            activeContributions.push(contribution.id);
        }
    });
    return activeContributions;
};

export function getComparisonURLFromConfig({
    contributions = [],
    predicates = [],
    type = DEFAULT_COMPARISON_METHOD,
    transpose = false,
    hasPreviousVersion = null,
}) {
    const params = qs.stringify(
        {
            contributions,
            properties: predicates.map((predicate) => encodeURIComponent(predicate)),
            type,
            transpose,
            hasPreviousVersion,
        },
        {
            skipNulls: true,
            encode: false,
            arrayFormat: 'repeat',
        },
    );
    return `?${params}`;
}

export function getComparisonURLConfigOfReduxState(comparisonState) {
    return getComparisonURLFromConfig({
        contributions: activatedContributionsToList(comparisonState.contributions),
        predicates: comparisonState.configuration.predicatesList,
        type: comparisonState.configuration.comparisonType,
        transpose: comparisonState.configuration.transpose,
    });
}

// returns the part of the string preceding (but not including) the
// final directory delimiter, or empty if none are found
export const truncateToLastDir = (str) => str.substr(0, str.lastIndexOf('/')).toString();

export const groupArrayByDirectoryPrefix = (strings) => {
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
                          1: strings[j],
                      },
                  ]
                : [
                      {
                          0: strings[i],
                          1: strings[j],
                      },
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

/**
 * Get property object from comparison data
 * (This function is useful to make the property clickable when using the comparison type "path")
 * @param {Array} data Comparison data
 * @param {Object} value The property path
 * @return {Object} The property object
 */
export const getPropertyObjectFromData = (data, value) => {
    const notEmptyCell = find(flatten(data[value.id]), (v) => v?.path?.length > 0);
    return notEmptyCell && notEmptyCell.path?.length && notEmptyCell.path_labels?.length
        ? { id: last(notEmptyCell.path), label: last(notEmptyCell.path_labels) }
        : value;
};

export const generateRdfDataVocabularyFile = (data, contributions, properties, metadata) => {
    const element = document.createElement('a');

    // Namespace helper functions
    const cubens = (term) => namedNode(`http://purl.org/linked-data/cube#${term}`);
    const orkgVocab = (term) => namedNode(`https://orkg.org/vocab/#${term}`);
    const orkgResource = (term) => namedNode(`https://orkg.org/resource/${term}`);
    const rdfsns = (term) => namedNode(`http://www.w3.org/2000/01/rdf-schema#${term}`);
    const rdfns = (term) => namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${term}`);
    const dcterms = (term) => namedNode(`http://purl.org/dc/terms/#${term}`);

    const store = new Store();
    // Vocabulary properties labels
    store.addQuad(quad(cubens('dataSet'), rdfsns('label'), literal('dataSet')));
    store.addQuad(quad(cubens('structure'), rdfsns('label'), literal('structure')));
    store.addQuad(quad(cubens('component'), rdfsns('label'), literal('component')));
    store.addQuad(quad(cubens('componentProperty'), rdfsns('label'), literal('component Property')));
    store.addQuad(quad(cubens('componentAttachment'), rdfsns('label'), literal('component Attachment')));
    store.addQuad(quad(cubens('dimension'), rdfsns('label'), literal('dimension')));
    store.addQuad(quad(cubens('attribute'), rdfsns('label'), literal('attribute')));
    store.addQuad(quad(cubens('measure'), rdfsns('label'), literal('measure')));
    store.addQuad(quad(cubens('order'), rdfsns('label'), literal('order')));
    // BNodes
    const ds = blankNode();
    const dsd = blankNode();
    // Dataset
    store.addQuad(quad(ds, rdfns('type'), cubens('DataSet')));
    // Metadata
    store.addQuad(quad(ds, dcterms('title'), literal(metadata.title ? metadata.title : 'Comparison - ORKG')));
    store.addQuad(quad(ds, dcterms('description'), literal(metadata.description ? metadata.description : 'Description')));
    store.addQuad(quad(ds, dcterms('creator'), literal(metadata.creator ? metadata.creator : 'Creator')));
    store.addQuad(quad(ds, dcterms('date'), literal(metadata.date ? metadata.date : 'Date')));
    store.addQuad(quad(ds, dcterms('license'), namedNode(LICENSE_URL)));
    store.addQuad(quad(ds, rdfsns('label'), literal('Comparison - ORKG')));
    store.addQuad(quad(ds, cubens('structure'), dsd));
    // DataStructureDefinition
    store.addQuad(quad(dsd, rdfns('type'), cubens('DataStructureDefinition')));
    store.addQuad(quad(dsd, rdfsns('label'), literal('Data Structure Definition')));
    const cs = {};
    const dt = {};
    // components
    const columns = [{ id: 'Properties', title: 'Properties' }, ...contributions.filter((c) => c.active).map((contribution, index) => contribution)];
    columns.forEach((column, index) => {
        if (column.id === 'Properties') {
            cs[column.id] = blankNode();
            dt[column.id] = orkgVocab('Property');
        } else {
            cs[column.id] = blankNode();
            dt[column.id] = orkgResource(`${column.id}`);
        }

        store.addQuad(quad(dsd, cubens('component'), cs[column.id]));
        store.addQuad(quad(cs[column.id], rdfns('type'), cubens('ComponentSpecification')));
        store.addQuad(quad(cs[column.id], rdfsns('label'), literal('Component Specification')));
        store.addQuad(quad(cs[column.id], cubens('order'), literal(index.toString())));
        if (column.id === 'Properties') {
            store.addQuad(quad(cs[column.id], cubens('dimension'), dt[column.id]));
            store.addQuad(quad(dt[column.id], rdfns('type'), cubens('DimensionProperty')));
        } else {
            store.addQuad(quad(cs[column.id], cubens('measure'), dt[column.id]));
            store.addQuad(quad(dt[column.id], rdfns('type'), cubens('MeasureProperty')));
        }
        store.addQuad(quad(dt[column.id], rdfns('type'), cubens('ComponentProperty')));
        store.addQuad(quad(dt[column.id], rdfsns('label'), literal(column?.label?.toString() ?? column?.title?.toString() ?? '')));
    });
    // data
    properties
        .filter((property) => property.active && data[property.id])
        .map((property, index) => {
            const bno = blankNode();
            store.addQuad(quad(bno, rdfns('type'), cubens('Observation')));
            store.addQuad(quad(bno, rdfsns('label'), literal(`Observation #{${index + 1}}`)));
            store.addQuad(quad(bno, cubens('dataSet'), ds));
            store.addQuad(quad(bno, dt.Properties, literal(property.label.toString())));
            contributions.map((contribution, index2) => {
                if (contribution.active) {
                    const cell = data[property.id][index2];
                    if (cell.length > 0) {
                        cell.map((v) => {
                            if (v.type && v.type === 'resource') {
                                store.addQuad(quad(bno, dt[contribution.id], orkgResource(`${v.resourceId}`)));
                            } else {
                                store.addQuad(quad(bno, dt[contribution.id], literal(`${v.label ? v.label : ''}`)));
                            }
                            return null;
                        });
                    } else {
                        store.addQuad(quad(bno, dt[contribution.id], literal('Empty')));
                    }
                }
                return null;
            });
            return null;
        });
    // Create the RDF file using N3.js Writer
    const writer = new Writer({ format: 'N3' });

    // Add all quads from the store to the writer
    const quads = store.getQuads();
    writer.addQuads(quads);

    writer.end((error, result) => {
        if (error) {
            console.error('Error serializing RDF:', error);
            return;
        }

        const file = new Blob([result], { type: 'text/n3' });
        element.href = URL.createObjectURL(file);
        element.download = 'ComparisonRDF.n3';
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    });
};
