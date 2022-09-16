import queryString from 'query-string';
import { getArrayParamFromQueryString, getParamFromQueryString, stringComparePosition } from 'utils';
import { uniq, without, flattenDepth, groupBy, flatten, last, find } from 'lodash';
import { DEFAULT_COMPARISON_METHOD } from 'constants/misc';

/**
 * Parse comparison configuration from url
 * @param {String} id
 * @param {String } label
 * @param {Array} comparisonStatements
 */
export const getComparisonConfiguration = url => {
    const response_hash = getParamFromQueryString(url.substring(url.indexOf('?')), 'response_hash') ?? null;
    const type = getParamFromQueryString(url.substring(url.indexOf('?')), 'type') ?? DEFAULT_COMPARISON_METHOD;
    const transpose = getParamFromQueryString(url.substring(url.indexOf('?')), 'transpose', true);
    const predicatesList = getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'properties');
    const contributionsList =
        without(uniq(getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'contributions')), undefined, null, '') ?? [];

    return {
        responseHash: response_hash,
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
    if (_comparisonType === 'merge') {
        return propertyIds.every(element => !element.includes('/'));
    }
    if (_comparisonType === 'path') {
        return propertyIds.some(element => element.includes('/') || !element.match(/^P([0-9])+$/));
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
            const allV = flattenDepth(values, 2).filter(value => {
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
        if (value.pathLabels && value.pathLabels.length > 0 && value.pathLabels[value.pathLabels.length - 1] !== propertyLabel) {
            result.push(value.pathLabels[value.pathLabels.length - 1]);
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
        ...properties.map(property => ({
            property,
            rules: [],
            values: groupBy(
                flatten(contributions.map((_, index) => data[property.id][index]).filter(([first]) => Object.keys(first).length !== 0)),
                'label',
            ),
        })),
    ];
    controlData.forEach(item => {
        Object.keys(item.values).forEach(key => {
            item.values[key] = item.values[key].map(({ path }) => path[0]);
        });
    });
    return controlData;
};

/**
 * Get ordered list of selected properties
 */
export const activatedPropertiesToList = propertiesData => {
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
export const activatedContributionsToList = contributionsData => {
    const activeContributions = [];
    contributionsData.forEach((contribution, index) => {
        if (contribution.active) {
            activeContributions.push(contribution.id);
        }
    });
    return activeContributions;
};

export function getComparisonURLConfig(comparisonState) {
    const params = queryString.stringify(
        {
            contributions: comparisonState.configuration.contributionsList.join(','),
            properties: comparisonState.configuration.predicatesList.map(predicate => encodeURIComponent(predicate)).join(','),
            type: comparisonState.configuration.comparisonType,
            transpose: comparisonState.configuration.transpose,
            response_hash: comparisonState.configuration.responseHash,
        },
        {
            skipNull: true,
            skipEmptyString: true,
            encode: false,
        },
    );
    return `?${params}`;
}

// returns the part of the string preceding (but not including) the
// final directory delimiter, or empty if none are found
export const truncateToLastDir = str => str.substr(0, str.lastIndexOf('/')).toString();

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
    const notEmptyCell = find(flatten(data[value.id]), v => v?.path?.length > 0);
    return notEmptyCell && notEmptyCell.path?.length && notEmptyCell.pathLabels?.length
        ? { id: last(notEmptyCell.path), label: last(notEmptyCell.pathLabels) }
        : value;
};
