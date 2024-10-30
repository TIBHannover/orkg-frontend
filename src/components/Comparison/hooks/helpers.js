import qs from 'qs';
import { getArrayParamFromQueryString, getParamFromQueryString } from 'utils';
import { isEmpty, uniq, without, flattenDepth, groupBy, flatten, last, find } from 'lodash';
import { DEFAULT_COMPARISON_METHOD, LICENSE_URL } from 'constants/misc';
import rdf from 'rdf';

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
 * Parse comparison configuration from url
 * @param {String} id
 * @param {String } label
 * @param {Array} comparisonStatements
 */
export const getComparisonConfiguration = (url) => {
    const type = getParamFromQueryString(url.substring(url.indexOf('?')), 'type') ?? DEFAULT_COMPARISON_METHOD;
    const transpose = getParamFromQueryString(url.substring(url.indexOf('?')), 'transpose', true);
    const predicatesList = getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'properties');
    const contributionsList =
        without(uniq(getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'contributions')), undefined, null, '') ?? [];

    return {
        comparisonType: type,
        transpose,
        predicatesList,
        contributionsList,
    };
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

export function getComparisonConfigObject(comparisonState) {
    return {
        contributions: activatedContributionsToList(comparisonState.contributions),
        predicates: comparisonState.configuration.predicatesList.map((predicate) => {
            try {
                return decodeURIComponent(predicate);
            } catch (e) {
                return predicate;
            }
        }),
        type: comparisonState.configuration.comparisonType,
        transpose: comparisonState.configuration.transpose,
    };
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
    const cubens = rdf.ns('http://purl.org/linked-data/cube#');
    const orkgVocab = rdf.ns('https://orkg.org/vocab/#');
    const orkgResource = rdf.ns('https://orkg.org/resource/');
    const gds = new rdf.Graph();
    // Vocabulary properties labels
    gds.add(new rdf.Triple(cubens('dataSet'), rdf.rdfsns('label'), new rdf.Literal('dataSet')));
    gds.add(new rdf.Triple(cubens('structure'), rdf.rdfsns('label'), new rdf.Literal('structure')));
    gds.add(new rdf.Triple(cubens('component'), rdf.rdfsns('label'), new rdf.Literal('component')));
    gds.add(new rdf.Triple(cubens('componentProperty'), rdf.rdfsns('label'), new rdf.Literal('component Property')));
    gds.add(new rdf.Triple(cubens('componentAttachment'), rdf.rdfsns('label'), new rdf.Literal('component Attachment')));
    gds.add(new rdf.Triple(cubens('dimension'), rdf.rdfsns('label'), new rdf.Literal('dimension')));
    gds.add(new rdf.Triple(cubens('attribute'), rdf.rdfsns('label'), new rdf.Literal('attribute')));
    gds.add(new rdf.Triple(cubens('measure'), rdf.rdfsns('label'), new rdf.Literal('measure')));
    gds.add(new rdf.Triple(cubens('order'), rdf.rdfsns('label'), new rdf.Literal('order')));
    // BNodes
    const ds = new rdf.BlankNode();
    const dsd = new rdf.BlankNode();
    // Dataset
    gds.add(new rdf.Triple(ds, rdf.rdfns('type'), cubens('DataSet')));
    // Metadata
    const dcterms = rdf.ns('http://purl.org/dc/terms/#');
    gds.add(new rdf.Triple(ds, dcterms('title'), new rdf.Literal(metadata.title ? metadata.title : 'Comparison - ORKG')));
    gds.add(new rdf.Triple(ds, dcterms('description'), new rdf.Literal(metadata.description ? metadata.description : 'Description')));
    gds.add(new rdf.Triple(ds, dcterms('creator'), new rdf.Literal(metadata.creator ? metadata.creator : 'Creator')));
    gds.add(new rdf.Triple(ds, dcterms('date'), new rdf.Literal(metadata.date ? metadata.date : 'Date')));
    gds.add(new rdf.Triple(ds, dcterms('license'), new rdf.NamedNode(LICENSE_URL)));
    gds.add(new rdf.Triple(ds, rdf.rdfsns('label'), new rdf.Literal('Comparison - ORKG')));
    gds.add(new rdf.Triple(ds, cubens('structure'), dsd));
    // DataStructureDefinition
    gds.add(new rdf.Triple(dsd, rdf.rdfns('type'), cubens('DataStructureDefinition')));
    gds.add(new rdf.Triple(dsd, rdf.rdfsns('label'), new rdf.Literal('Data Structure Definition')));
    const cs = {};
    const dt = {};
    // components
    const columns = [{ id: 'Properties', title: 'Properties' }, ...contributions.filter((c) => c.active).map((contribution, index) => contribution)];
    columns.forEach((column, index) => {
        if (column.id === 'Properties') {
            cs[column.id] = new rdf.BlankNode();
            dt[column.id] = orkgVocab('Property');
        } else {
            cs[column.id] = new rdf.BlankNode();
            dt[column.id] = orkgResource(`${column.id}`);
        }

        gds.add(new rdf.Triple(dsd, cubens('component'), cs[column.id]));
        gds.add(new rdf.Triple(cs[column.id], rdf.rdfns('type'), cubens('ComponentSpecification')));
        gds.add(new rdf.Triple(cs[column.id], rdf.rdfsns('label'), new rdf.Literal('Component Specification')));
        gds.add(new rdf.Triple(cs[column.id], cubens('order'), new rdf.Literal(index.toString())));
        if (column.id === 'Properties') {
            gds.add(new rdf.Triple(cs[column.id], cubens('dimension'), dt[column.id]));
            gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('DimensionProperty')));
        } else {
            gds.add(new rdf.Triple(cs[column.id], cubens('measure'), dt[column.id]));
            gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('MeasureProperty')));
        }
        gds.add(new rdf.Triple(dt[column.id], rdf.rdfns('type'), cubens('ComponentProperty')));
        gds.add(new rdf.Triple(dt[column.id], rdf.rdfsns('label'), new rdf.Literal(column.title?.toString() ?? '')));
    });
    // data
    properties
        .filter((property) => property.active && data[property.id])
        .map((property, index) => {
            const bno = new rdf.BlankNode();
            gds.add(new rdf.Triple(bno, rdf.rdfns('type'), cubens('Observation')));
            gds.add(new rdf.Triple(bno, rdf.rdfsns('label'), new rdf.Literal(`Observation #{${index + 1}}`)));
            gds.add(new rdf.Triple(bno, cubens('dataSet'), ds));
            gds.add(new rdf.Triple(bno, dt.Properties.toString(), new rdf.Literal(property.label.toString())));
            contributions.map((contribution, index2) => {
                if (contribution.active) {
                    const cell = data[property.id][index2];
                    if (cell.length > 0) {
                        cell.map((v) => {
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
    // Create the RDF file
    const file = new Blob(
        [
            gds
                .toArray()
                .map((t) => t.toString())
                .join('\n'),
        ],
        { type: 'text/n3' },
    );
    element.href = URL.createObjectURL(file);
    element.download = 'ComparisonRDF.n3';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
};
