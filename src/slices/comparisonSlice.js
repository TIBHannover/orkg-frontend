import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE, asyncLocalStorage } from 'utils';
import { match } from 'path-to-regexp';
import ROUTES from 'constants/routes';
import {
    isPredicatesListCorrect,
    extendPropertyIds,
    similarPropertiesByLabel,
    generateFilterControlData,
    activatedContributionsToList,
} from 'components/Comparison/hooks/helpers';
import { applyRule, getRuleByProperty } from 'components/Comparison/Filters/helpers';
import { flatten, findIndex, cloneDeep, isEmpty, intersection } from 'lodash';
import { DEFAULT_COMPARISON_METHOD } from 'constants/misc';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

const initialState = {
    comparisonResource: {
        id: '',
        label: '',
        created_at: null,
        classes: [],
        shared: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
        observatory_id: '00000000-0000-0000-0000-000000000000',
        extraction_method: 'UNKNOWN',
        organization_id: '00000000-0000-0000-0000-000000000000',
        authors: [],
        references: [],
        resources: [],
        figures: [],
        visualizations: [],
        contributions: [],
        researchField: null,
        hasPreviousVersion: null,
        doi: null,
        description: '',
        properties: '',
    },
    configuration: {
        transpose: false,
        comparisonType: DEFAULT_COMPARISON_METHOD,
        responseHash: null,
        contributionsList: [],
        predicatesList: [],
        fullWidth: cookies.get('useFullWidthForComparisonTable') === 'true' ? cookies.get('useFullWidthForComparisonTable') : false,
        viewDensity: cookies.get('viewDensityComparisonTable') ? cookies.get('viewDensityComparisonTable') : 'spacious',
    },
    properties: [],
    contributions: [],
    data: {},
    filterControlData: [],
    errors: [],
    createdBy: null,
    observatory: null,
    shortLink: '',
    researchField: null,
    isLoadingMetadata: false,
    isFailedLoadingMetadata: false,
    isLoadingResult: true,
    isFailedLoadingResult: false,
    isOpenVisualizationModal: false,
    useReconstructedDataInVisualization: false,
    hiddenGroups: [],
};

export const comparisonSlice = createSlice({
    name: 'comparison',
    initialState,
    reducers: {
        setComparisonResource: (state, { payload }) => {
            state.comparisonResource = payload;
        },
        setData: (state, { payload }) => {
            state.data = payload;
        },
        setProperties: (state, { payload }) => {
            state.properties = payload;
        },
        setContributions: (state, { payload }) => {
            state.contributions = payload;
        },
        setFilterControlData: (state, { payload }) => {
            state.filterControlData = payload;
        },
        setShortLink: (state, { payload }) => {
            state.shortLink = payload;
        },
        setIsLoadingMetadata: (state, { payload }) => {
            state.isLoadingMetadata = payload;
        },
        setIsFailedLoadingMetadata: (state, { payload }) => {
            state.isFailedLoadingMetadata = payload;
        },
        setErrors: (state, { payload }) => {
            state.errors = payload;
        },
        setIsLoadingResult: (state, { payload }) => {
            state.isLoadingResult = payload;
        },
        setIsFailedLoadingResult: (state, { payload }) => {
            state.isFailedLoadingResult = payload;
        },
        setProvenance: (state, { payload }) => {
            state.observatory = payload;
        },
        setObservatoryId: (state, { payload }) => {
            state.comparisonResource.observatory_id = payload;
        },
        setOrganizationId: (state, { payload }) => {
            state.comparisonResource.organization_id = payload;
        },
        setCreatedBy: (state, { payload }) => {
            state.createdBy = payload;
        },
        setVisualizations: (state, { payload }) => {
            state.comparisonResource.visualizations = payload;
        },
        setDoi: (state, { payload }) => {
            state.comparisonResource.doi = payload;
        },
        setHasPreviousVersion: (state, { payload }) => {
            state.comparisonResource.hasPreviousVersion = payload;
        },
        setConfigurationAttribute: (state, { payload }) => {
            state.configuration[payload.attribute] = payload.value;
        },
        setResearchField: (state, { payload }) => {
            state.comparisonResource.researchField = payload.value;
        },
        setConfiguration: (state, { payload }) => {
            state.configuration = { ...state.configuration, ...payload };
        },
        setIsOpenVisualizationModal: (state, { payload }) => {
            state.isOpenVisualizationModal = payload;
        },
        setUseReconstructedDataInVisualization: (state, { payload }) => {
            state.useReconstructedDataInVisualization = payload;
        },
        setHiddenGroups: (state, { payload }) => {
            state.hiddenGroups = payload;
        },
    },
    extraReducers: {
        [LOCATION_CHANGE]: (state, { payload }) => {
            const matchComparison = match(ROUTES.COMPARISON);
            const parsedPayload = matchComparison(payload.location.pathname);
            if (parsedPayload && parsedPayload.params?.comparisonId === state.comparisonResource.id) {
                // when it's the same comparison  (just the hash changed) do not init
                return state;
            }
            return initialState;
        },
    },
});

export const {
    setComparisonResource,
    setData,
    setProperties,
    setContributions,
    setFilterControlData,
    setShortLink,
    setIsLoadingMetadata,
    setIsFailedLoadingMetadata,
    setErrors,
    setIsLoadingResult,
    setIsFailedLoadingResult,
    setProvenance,
    setObservatoryId,
    setOrganizationId,
    setCreatedBy,
    setVisualizations,
    setDoi,
    setHasPreviousVersion,
    setConfigurationAttribute,
    setResearchField,
    setConfiguration,
    setIsOpenVisualizationModal,
    setUseReconstructedDataInVisualization,
    setHiddenGroups,
} = comparisonSlice.actions;

/**
 * Get a matrix of comparison data
 * @param {Object} state Current state of the Store
 * @return {Array} data matrix
 */
export function getMatrixOfComparison(comparison) {
    const header = ['Title'];

    for (const property of comparison.properties) {
        if (property.active) {
            header.push(property.label);
        }
    }

    const rows = [];

    for (let i = 0; i < comparison.contributions.length; i++) {
        const contribution = comparison.contributions[i];
        if (contribution.active) {
            const row = [contribution.title];

            for (const property of comparison.properties) {
                if (property.active) {
                    let value = '';
                    if (comparison.data[property.id]) {
                        // separate labels with comma
                        value = comparison.data[property.id][i].map(entry => entry.label).join(', ');
                        row.push(value);
                    }
                }
            }
            rows.push(row);
        }
    }
    return [header, ...rows];
}

/**
 * Extend and sort properties
 *
 * @param {Object} comparisonData Comparison Data result
 * @return {Array} list of properties extended and sorted
 */
export const extendAndSortProperties = (comparisonData, _comparisonType) => (dispatch, getState) => {
    // if there are properties in the query string
    const { predicatesList } = getState().comparison.configuration;
    if (predicatesList.length > 0) {
        // Create an extended version of propertyIds (ADD the IDs of similar properties)
        // Only use this on the 'merge' method because the if it's used in 'path' method, it will show properties that are not activated
        let extendedPropertyIds = predicatesList;
        if (!isPredicatesListCorrect(predicatesList, _comparisonType) || _comparisonType === 'merge') {
            extendedPropertyIds = extendPropertyIds(predicatesList, comparisonData.data);
        } else {
            extendedPropertyIds = predicatesList;
        }
        // sort properties based on query string (is not presented in query string, sort at the bottom)
        // TODO: sort by label when is not active
        comparisonData.properties.sort((a, b) => {
            const index1 = extendedPropertyIds.indexOf(a.id) !== -1 ? extendedPropertyIds.indexOf(a.id) : 1000;
            const index2 = extendedPropertyIds.indexOf(b.id) !== -1 ? extendedPropertyIds.indexOf(b.id) : 1000;
            return index1 - index2;
        });
        // hide properties based on query string
        comparisonData.properties.forEach((property, index) => {
            if (!extendedPropertyIds.includes(property.id)) {
                comparisonData.properties[index].active = false;
            } else {
                comparisonData.properties[index].active = true;
            }
        });
    } else {
        // no properties ids in the url, but the ones from the api still need to be sorted
        comparisonData.properties.sort((a, b) => {
            if (a.active === b.active) {
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            }
            return !a.active ? 1 : -1;
        });
    }

    // Get Similar properties by Label
    comparisonData.properties.forEach((property, index) => {
        comparisonData.properties[index].similar = similarPropertiesByLabel(property.label, comparisonData.data[property.id]);
    });

    return comparisonData.properties;
};

/**
 * Remove contribution
 *
 * @param {String} contributionId Contribution id to remove
 */
export const removeContribution = contributionId => async (dispatch, getState) => {
    const cIndex = findIndex(getState().comparison.contributions, c => c.id === contributionId);
    const newContributions = getState()
        .comparison.contributions.filter(c => c.id !== contributionId)
        .map(contribution => ({ ...contribution, active: contribution.active }));
    const newData = cloneDeep(getState().comparison.data);
    let newProperties = cloneDeep(getState().comparison.properties);
    for (const property in newData) {
        // remove the contribution from data
        if (flatten(newData[property][cIndex]).filter(v => !isEmpty(v)).length !== 0) {
            // decrement the contribution amount from properties if it has some values
            const pIndex = newProperties.findIndex(p => p.id === property);
            newProperties[pIndex].contributionAmount = newProperties[pIndex].contributionAmount - 1;
        }
        newData[property].splice(cIndex, 1);
    }

    newProperties = await dispatch(
        extendAndSortProperties({ data: newData, properties: newProperties }, getState().comparison.configuration.comparisonType),
    );
    dispatch(setConfigurationAttribute({ attribute: 'contributionsList', value: activatedContributionsToList(newContributions) }));
    dispatch(setContributions(newContributions));
    dispatch(setData(newData));
    dispatch(setProperties(newProperties));
    // keep existing filter rules
    const newFilterControlData = generateFilterControlData(newContributions, newProperties, newData).map(filter => {
        filter.rules = getRuleByProperty(getState().comparison.filterControlData, filter.property.id);
        return filter;
    });
    dispatch(setFilterControlData(newFilterControlData));
};

/**
 * display certain contributionIds
 *
 * @param {array} contributionIds Contribution ids to display
 */
export const displayContributions = contributionIds => (dispatch, getState) => {
    const newContributions = getState().comparison.contributions.map(contribution => {
        if (contributionIds.includes(contribution.id)) {
            return { ...contribution, active: true };
        }
        return { ...contribution, active: false };
    });
    dispatch(setContributions(newContributions));
};

/**
 * Apply filter control data rules
 *
 * @param {Array} newState Filter Control Data
 */
export const applyAllRules = newState => (dispatch, getState) => {
    const AllContributionsID = getState().comparison.contributions.map(contribution => contribution.id);
    const contributionIds = []
        .concat(...newState.map(item => item.rules))
        .map(c => applyRule({ filterControlData: getState().comparison.filterControlData, ...c }))
        .reduce((prev, acc) => intersection(prev, acc), AllContributionsID);
    dispatch(displayContributions(contributionIds));
};

/**
 * Update filter control data of a property
 *
 * @param {Array} rules Array of rules
 * @param {Array} propertyId property ID
 */
export const updateRulesOfProperty = (newRules, propertyId) => (dispatch, getState) => {
    const newState = [...getState().comparison.filterControlData];
    const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
    const toChange = { ...newState[toChangeIndex] };
    toChange.rules = newRules;
    newState[toChangeIndex] = toChange;
    dispatch(applyAllRules(newState));
    dispatch(setFilterControlData(newState));
};

/**
 * Remove a rule from filter control data of a property
 *
 * @param {Array} propertyId property ID
 * @param {String} type Filter type
 * @param {String} value Filter value
 */
export const removeRule =
    ({ propertyId, type, value }) =>
    (dispatch, getState) => {
        const newState = [...getState().comparison.filterControlData];
        const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
        const toChange = { ...newState[toChangeIndex] };
        toChange.rules = toChange.rules.filter(item => !(item.propertyId === propertyId && item.type === type && item.value === value));
        newState[toChangeIndex] = toChange;
        dispatch(applyAllRules(newState));
        dispatch(setFilterControlData(newState));
    };

/**
 * Function to toggle group visibility. If the comparison is published, the configuration is stored in local storage
 */
export const handleToggleGroupVisibility = property => (dispatch, getState) => {
    const comparisonId = getState().comparison?.comparisonResource?.id;
    const hiddenGroupsStorageName = comparisonId ? `comparison-${comparisonId}-hidden-rows` : null;
    const _hiddenGroups = getState().comparison.hiddenGroups.includes(property)
        ? getState().comparison.hiddenGroups.filter(_id => _id !== property)
        : [...getState().comparison.hiddenGroups, property];

    dispatch(setHiddenGroups(_hiddenGroups));
    if (hiddenGroupsStorageName) {
        if (_hiddenGroups.length > 0) {
            asyncLocalStorage.setItem(hiddenGroupsStorageName, JSON.stringify(_hiddenGroups));
        } else {
            asyncLocalStorage.removeItem(hiddenGroupsStorageName);
        }
    }
};

export default comparisonSlice.reducer;
