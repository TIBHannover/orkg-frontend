import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { getResource } from 'services/backend/resources';
import { getComparison, getResourceData } from 'services/similarity/index';
import {
    extendPropertyIds,
    similarPropertiesByLabel,
    filterObjectOfStatementsByPredicateAndClass,
    getArrayParamFromQueryString,
    getParamFromQueryString,
    get_error_message,
    applyRule,
    getRuleByProperty,
    getComparisonData,
    isPredicatesListCorrect
} from 'utils';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PREDICATES, CLASSES, MISC } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { flatten, groupBy, intersection, findIndex, cloneDeep, isEmpty, uniq, without } from 'lodash';
import arrayMove from 'array-move';
import ROUTES from 'constants/routes.js';
import queryString from 'query-string';
import { usePrevious } from 'react-use';
import Confirm from 'components/Confirmation/Confirmation';
import { getOrganization } from 'services/backend/organizations';
import { asyncLocalStorage } from 'utils';

const DEFAULT_COMPARISON_METHOD = 'path';

function useComparison({ id }) {
    const location = useLocation();
    const history = useHistory();
    const params = useParams();
    const comparisonId = id || params.comparisonId;
    const hiddenGroupsStorageName = comparisonId ? `comparison-${comparisonId}-hidden-rows` : null;

    /**
     * @typedef {Object} MetaData
     * @property {String} id comparison ID
     * @property {String} title comparison title
     * @property {String} description comparison description
     * @property {Array[String]} references comparison data sources
     * @property {String} createdAt Comparison Creation Time
     * @property {String|Object} createdBy Comparison resource creator
     * @property {Array[Object]} resources Comparison related resources
     * @property {Array[Object]} figures Comparison related figures
     * @property {Array[Object]} visualizations Comparison visualizations
     * @property {Array[Object]} authors Comparison authors
     */
    /**
     * @typedef {Function} MetaDataSetter Set Metadata
     */
    /**
     * @type {[MetaData, MetaDataSetter]} Loading
     */
    const [metaData, setMetaData] = useState({});
    const [properties, setProperties] = useState([]);

    const [contributions, setContributions] = useState([]);
    const [data, setData] = useState({});
    const [filterControlData, setFilterControlData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [matrixData, setMatrixData] = useState([]);

    const [createdBy, setCreatedBy] = useState(null);
    const [provenance, setProvenance] = useState(null);

    // research fields (only the research field of the first contribution)
    const [researchField, setResearchField] = useState(null);

    // urls
    const [urlNeedsToUpdate, setUrlNeedsToUpdate] = useState(false);
    const [publicURL, setPublicURL] = useState(window.location.href);
    const [comparisonURLConfig, setComparisonURLConfig] = useState(window.location.search);
    const [shortLink, setShortLink] = useState('');

    // comparison config
    const [transpose, setTranspose] = useState(false);
    const [comparisonType, setComparisonType] = useState(DEFAULT_COMPARISON_METHOD);
    const [responseHash, setResponseHash] = useState(null);
    const [contributionsList, setContributionsList] = useState([]);
    const [predicatesList, setPredicatesList] = useState([]);
    const [shouldFetchLiveComparison, setShouldFetchLiveComparison] = useState(false);
    const [hiddenGroups, setHiddenGroups] = useState([]);

    // reference to previous comparison type
    const prevComparisonType = usePrevious(comparisonType);
    // reference to previous comparison id
    const prevComparisonId = usePrevious(comparisonId);

    // loading indicators
    const [isLoadingMetaData, setIsLoadingMetaData] = useState(false);
    const [isFailedLoadingMetaData, setIsFailedLoadingMetaData] = useState(false);
    const [isLoadingComparisonResult, setIsLoadingComparisonResult] = useState(true);
    const [isFailedLoadingComparisonResult, setIsFailedLoadingComparisonResult] = useState(false);

    /**
     * set comparison Public URL
     *
     * This function get the public url of ORKG without any route
     *
     * if the app runs under orkg.org/orkg it will set orkg.org/orkg as public URL
     */
    const updateComparisonPublicURL = () => {
        const newURL = `${window.location.protocol}//${window.location.host}${window.location.pathname
            .replace(reverse(ROUTES.COMPARISON, { comparisonId: comparisonId }), '')
            .replace(/\/$/, '')}`;
        setPublicURL(newURL);
    };

    const loadVisualizations = comparisonID => {
        getStatementsBySubjectAndPredicate({ subjectId: comparisonID, predicateId: PREDICATES.HAS_VISUALIZATION }).then(statements => {
            const visualizations = filterObjectOfStatementsByPredicateAndClass(
                statements,
                PREDICATES.HAS_VISUALIZATION,
                false,
                CLASSES.VISUALIZATION
            );
            setMetaData({ ...metaData, visualizations: visualizations });
        });
    };
    /**
     * Load comparison meta data and comparison config
     *
     * @param {String} cId comparison ID
     */
    const loadComparisonMetaData = useCallback(cId => {
        if (cId) {
            setIsLoadingMetaData(true);
            // Get the comparison resource and comparison config
            Promise.all([getResource(cId), getResourceData(cId)])
                .then(([comparisonResource, configurationData]) => {
                    // Make sure that this resource is a comparison
                    if (!comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                        throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                    }
                    return [comparisonResource, configurationData];
                })
                .then(([comparisonResource, configurationData]) => {
                    // Get meta data and config of a comparison
                    getStatementsBySubject({ id: cId }).then(statements => {
                        const comparisonObject = getComparisonData(comparisonResource, statements);
                        setMetaData({
                            ...comparisonObject,
                            title: comparisonObject.label,
                            createdAt: comparisonObject.created_at,
                            createdBy: comparisonObject.created_by
                        });

                        const url = configurationData.data.url;
                        if (url) {
                            setResponseHash(getParamFromQueryString(url.substring(url.indexOf('?')), 'response_hash'));
                            setComparisonType(getParamFromQueryString(url.substring(url.indexOf('?')), 'type') ?? DEFAULT_COMPARISON_METHOD);
                            setTranspose(getParamFromQueryString(url.substring(url.indexOf('?')), 'transpose', true));
                            setPredicatesList(getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'properties'));
                            const contributionsIDs =
                                without(uniq(getArrayParamFromQueryString(url.substring(url.indexOf('?')), 'contributions')), undefined, null, '') ??
                                [];
                            setContributionsList(contributionsIDs);
                        } else {
                            setPredicatesList(
                                filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_PROPERTY, false)?.map(p => p.id)
                            );
                            const contributionsIDs =
                                without(
                                    uniq(
                                        filterObjectOfStatementsByPredicateAndClass(
                                            statements,
                                            PREDICATES.COMPARE_CONTRIBUTION,
                                            false,
                                            CLASSES.CONTRIBUTION
                                        )?.map(c => c.id) ?? []
                                    ),
                                    undefined,
                                    null,
                                    ''
                                ) ?? [];
                            setContributionsList(contributionsIDs);
                        }
                        if (
                            !filterObjectOfStatementsByPredicateAndClass(
                                statements,
                                PREDICATES.COMPARE_CONTRIBUTION,
                                false,
                                CLASSES.CONTRIBUTION
                            )?.map(c => c.id)
                        ) {
                            setIsLoadingComparisonResult(false);
                        }
                        setIsLoadingMetaData(false);
                        setIsFailedLoadingMetaData(false);
                    });

                    // Get Provenance data
                    loadCreatedBy(comparisonResource.created_by);
                    loadProvenanceInfos(comparisonResource.observatory_id, comparisonResource.organization_id);
                })
                .catch(error => {
                    let errorMessage = null;
                    if (error.statusCode && error.statusCode === 404) {
                        errorMessage = 'The requested resource is not found';
                    } else {
                        errorMessage = get_error_message(error);
                    }
                    setErrors(errorMessage);
                    setIsLoadingMetaData(false);
                    setIsFailedLoadingMetaData(true);
                });
        } else {
            setIsLoadingMetaData(false);
            setIsFailedLoadingMetaData(true);
        }
    }, []);

    /**
     * Load creator user
     *
     * @param {String} created_by user ID
     */
    const loadCreatedBy = created_by => {
        // Get Provenance data
        if (created_by && created_by !== MISC.UNKNOWN_ID) {
            getContributorInformationById(created_by)
                .then(creator => {
                    setCreatedBy(creator);
                })
                .catch(() => {
                    setCreatedBy(null);
                });
        } else {
            setCreatedBy(null);
        }
    };

    /**
     * Load Provenance data
     *
     * @param {String} observatory_id observatory ID
     * @param {String} organization_id organization ID
     */
    const loadProvenanceInfos = (observatory_id, organization_id) => {
        if (observatory_id && observatory_id !== MISC.UNKNOWN_ID) {
            getObservatoryAndOrganizationInformation(observatory_id, organization_id)
                .then(observatory => {
                    setProvenance(observatory);
                })
                .catch(() => {
                    setProvenance(null);
                });
        } else if (organization_id && organization_id !== MISC.UNKNOWN_ID) {
            getOrganization(organization_id)
                .then(organization => {
                    setProvenance({ organization: organization });
                })
                .catch(() => {
                    setProvenance(null);
                });
        } else {
            setProvenance(null);
        }
    };

    /**
     * Extend and sort properties
     *
     * @param {Object} comparisonData Comparison Data result
     * @return {Array} list of properties extended and sorted
     */
    const extendAndSortProperties = useCallback(
        (comparisonData, _comparisonType) => {
            // if there are properties in the query string
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
                //no properties ids in the url, but the ones from the api still need to be sorted
                comparisonData.properties.sort((a, b) => {
                    if (a.active === b.active) {
                        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
                    } else {
                        return !a.active ? 1 : -1;
                    }
                });
            }

            // Get Similar properties by Label
            comparisonData.properties.forEach((property, index) => {
                comparisonData.properties[index].similar = similarPropertiesByLabel(property.label, comparisonData.data[property.id]);
            });

            return comparisonData.properties;
        },
        [predicatesList]
    );

    /**
     * Generate Filter Control Data
     *
     * @param {Array} contributions Array of contributions
     * @param {Array} properties Array of properties
     * @param {Object} data Comparison Data object
     * @return {Array} Filter Control Data
     */
    const generateFilterControlData = (contributions, properties, data) => {
        const controlData = [
            ...properties.map(property => {
                return {
                    property,
                    rules: [],
                    values: groupBy(
                        flatten(contributions.map((_, index) => data[property.id][index]).filter(([first]) => Object.keys(first).length !== 0)),
                        'label'
                    )
                };
            })
        ];
        controlData.forEach(item => {
            Object.keys(item.values).forEach(key => {
                item.values[key] = item.values[key].map(({ path }) => path[0]);
            });
        });
        return controlData;
    };

    /**
     * Update filter control data of a property
     *
     * @param {Array} rules Array of rules
     * @param {Array} propertyId property ID
     */
    const updateRulesOfProperty = (newRules, propertyId) => {
        setFilterControlData(pervState => {
            const newState = [...pervState];
            const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
            const toChange = { ...newState[toChangeIndex] };
            toChange.rules = newRules;
            newState[toChangeIndex] = toChange;
            applyAllRules(newState);
            return newState;
        });
    };

    /**
     * Remove a rule from filter control data of a property
     *
     * @param {Array} propertyId property ID
     * @param {String} type Filter type
     * @param {String} value Filter value
     */
    const removeRule = ({ propertyId, type, value }) => {
        setFilterControlData(pervState => {
            const newState = [...pervState];
            const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
            const toChange = { ...newState[toChangeIndex] };
            toChange.rules = toChange.rules.filter(item => !(item.propertyId === propertyId && item.type === type && item.value === value));
            newState[toChangeIndex] = toChange;
            applyAllRules(newState);
            return newState;
        });
    };

    /**
     * Apply filter control data rules
     *
     * @param {Array} newState Filter Control Data
     */
    const applyAllRules = newState => {
        const AllContributionsID = contributions.map(contribution => contribution.id);
        const contributionIds = []
            .concat(...newState.map(item => item.rules))
            .map(c => applyRule({ filterControlData, ...c }))
            .reduce((prev, acc) => intersection(prev, acc), AllContributionsID);
        displayContributions(contributionIds);
    };

    /**
     * Call the comparison service to get the comparison result
     */
    const getComparisonResult = useCallback(() => {
        setIsLoadingComparisonResult(true);
        getComparison({ contributionIds: contributionsList, type: comparisonType, response_hash: responseHash, save_response: false })
            .then(comparisonData => {
                // get Research field of the first contributions
                return getStatementsBySubjectAndPredicate({
                    subjectId: comparisonData.contributions[0].paperId,
                    predicateId: PREDICATES.HAS_RESEARCH_FIELD
                }).then(s => {
                    if (s.length && !metaData?.subject) {
                        setResearchField(s[0].object);
                    }
                    return Promise.resolve(comparisonData);
                });
            })
            .then(comparisonData => {
                // mocking function to allow for deletion of contributions via the url
                comparisonData.contributions.forEach((contribution, index) => {
                    if (!contributionsList.includes(contribution.id)) {
                        comparisonData.contributions[index].active = false;
                    } else {
                        comparisonData.contributions[index].active = true;
                    }
                });

                comparisonData.properties = extendAndSortProperties(comparisonData, comparisonType);

                setContributions(comparisonData.contributions);
                setProperties(comparisonData.properties);
                setData(comparisonData.data);
                setFilterControlData(generateFilterControlData(comparisonData.contributions, comparisonData.properties, comparisonData.data));
                setIsLoadingComparisonResult(false);
                setIsFailedLoadingComparisonResult(false);

                if (comparisonData.response_hash) {
                    setResponseHash(comparisonData.response_hash);
                } else {
                    setResponseHash(responseHash);
                }
            })
            .then(() => {
                if (!comparisonId && queryString.parse(location.search)?.hasPreviousVersion) {
                    getResource(queryString.parse(location.search).hasPreviousVersion).then(prevVersion =>
                        setMetaData({ ...metaData, hasPreviousVersion: prevVersion })
                    );
                }
            })
            .catch(error => {
                console.log(error);
                setErrors(get_error_message(error));
                setIsLoadingComparisonResult(false);
                setIsFailedLoadingComparisonResult(true);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonType, contributionsList, extendAndSortProperties, responseHash]);

    /**
     * Toggle a property from the table
     *
     * @param {String} id Property id to toggle
     */
    const toggleProperty = id => {
        const newProperties = properties.map(property => (property.id === id ? { ...property, active: !property.active } : property));
        setProperties(newProperties);
        setPredicatesList(activatedPropertiesToList(newProperties));
        setUrlNeedsToUpdate(true);
    };

    /**
     * Update the order of properties
     */
    const onSortPropertiesEnd = ({ oldIndex, newIndex }) => {
        const newProperties = arrayMove(properties, oldIndex, newIndex);
        setProperties(newProperties);
        setPredicatesList(activatedPropertiesToList(newProperties));
        setUrlNeedsToUpdate(true);
    };

    /**
     * Remove contribution
     *
     * @param {String} contributionId Contribution id to remove
     */
    const removeContribution = contributionId => {
        const cIndex = findIndex(contributions, c => c.id === contributionId);
        const newContributions = contributions
            .filter(c => c.id !== contributionId)
            .map(contribution => {
                return { ...contribution, active: contribution.active };
            });
        const newData = cloneDeep(data);
        let newProperties = cloneDeep(properties);
        for (const property in newData) {
            // remove the contribution from data
            if (flatten(newData[property][cIndex]).filter(v => !isEmpty(v)).length !== 0) {
                // decrement the contribution amount from properties if it has some values
                const pIndex = newProperties.findIndex(p => p.id === property);
                newProperties[pIndex].contributionAmount = newProperties[pIndex].contributionAmount - 1;
            }
            newData[property].splice(cIndex, 1);
        }
        newProperties = extendAndSortProperties({ data: newData, properties: newProperties }, comparisonType);
        setContributionsList(activatedContributionsToList(newContributions));
        setContributions(newContributions);
        setData(newData);
        setProperties(newProperties);
        setFilterControlData(prevFilterControlData => {
            // keep existing filter rules
            const newFilterControlData = generateFilterControlData(newContributions, newProperties, newData).map(filter => {
                filter.rules = getRuleByProperty(prevFilterControlData, filter.property.id);
                return filter;
            });
            return newFilterControlData;
        });
        setUrlNeedsToUpdate(true);
    };

    /**
     * display certain contributionIds
     *
     * @param {array} contributionIds Contribution ids to display
     */
    const displayContributions = contributionIds => {
        const newContributions = contributions.map(contribution => {
            return contributionIds.includes(contribution.id) ? { ...contribution, active: true } : { ...contribution, active: false };
        });
        setContributionsList(activatedContributionsToList(newContributions));
        setContributions(newContributions);
        setUrlNeedsToUpdate(true);
    };

    /**
     * Add contributions
     *
     * @param {Array[String]} newContributionIds Contribution ids to add
     */
    const addContributions = newContributionIds => {
        setUrlNeedsToUpdate(true);
        setResponseHash(null);
        const contributionsIDs = without(uniq(contributionsList.concat(newContributionIds)), undefined, null, '') ?? [];
        setContributionsList(contributionsIDs);
    };

    /**
     * Toggle transpose option
     *
     */
    const toggleTranspose = () => {
        setUrlNeedsToUpdate(true);
        setTranspose(transpose => !transpose);
    };

    /**
     * Get ordered list of selected properties
     */
    const activatedPropertiesToList = useCallback(propertiesData => {
        const activeProperties = [];
        propertiesData.forEach((property, index) => {
            if (property.active) {
                activeProperties.push(property.id);
            }
        });
        return activeProperties;
    }, []);

    /**
     * Get ordered list of selected contributions
     */
    const activatedContributionsToList = useCallback(contributionsData => {
        const activeContributions = [];
        contributionsData.forEach((contribution, index) => {
            if (contribution.active) {
                activeContributions.push(contribution.id);
            }
        });
        return activeContributions;
    }, []);

    /**
     * Update the URL
     */
    const generateUrl = () => {
        const params = queryString.stringify(
            {
                contributions: contributionsList.join(','),
                properties: predicatesList.map(predicate => encodeURIComponent(predicate)).join(','),
                type: comparisonType,
                transpose: transpose
            },
            {
                skipNull: true,
                skipEmptyString: true,
                encode: false
            }
        );
        setComparisonURLConfig(`?${params}`);
        setShortLink('');
        history.push(reverse(ROUTES.COMPARISON) + `?${params}`);
    };

    /**
     * Create a tabular data of the comparison
     */
    const generateMatrixOfComparison = () => {
        const header = ['Title'];

        for (const property of properties) {
            if (property.active) {
                header.push(property.label);
            }
        }

        const rows = [];

        for (let i = 0; i < contributions.length; i++) {
            const contribution = contributions[i];
            if (contribution.active) {
                const row = [contribution.title];

                for (const property of properties) {
                    if (property.active) {
                        let value = '';
                        if (data[property.id]) {
                            // separate labels with comma
                            value = data[property.id][i].map(entry => entry.label).join(', ');
                            row.push(value);
                        }
                    }
                }
                rows.push(row);
            }
        }
        setMatrixData([header, ...rows]);
    };

    const handleEditContributions = async () => {
        const isConfirmed = await Confirm({
            title: 'Edit contribution data',
            message: `You are about the edit the contributions displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG`,
            proceedLabel: 'Continue'
        });

        if (isConfirmed) {
            history.push(
                reverse(ROUTES.CONTRIBUTION_EDITOR) +
                    `?contributions=${contributionsList.join(',')}${
                        metaData?.hasPreviousVersion ? `&hasPreviousVersion=${metaData?.hasPreviousVersion.id}` : ''
                    }`
            );
        }
    };

    const fetchLiveData = () => {
        setUrlNeedsToUpdate(true);
        setResponseHash(null);
        setShouldFetchLiveComparison(true);
    };

    /**
     * Function to toggle group visibility. If the comparison is published, the configuration is stored in local storage
     */
    const handleToggleGroupVisibility = property => {
        const _hiddenGroups = hiddenGroups.includes(property) ? hiddenGroups.filter(id => id !== property) : [...hiddenGroups, property];
        setHiddenGroups(_hiddenGroups);
        if (hiddenGroupsStorageName) {
            if (_hiddenGroups.length > 0) {
                asyncLocalStorage.setItem(hiddenGroupsStorageName, JSON.stringify(_hiddenGroups));
            } else {
                asyncLocalStorage.removeItem(hiddenGroupsStorageName);
            }
        }
    };

    useEffect(() => {
        const getHiddenGroup = async () => {
            if (comparisonId && hiddenGroupsStorageName) {
                const data = await asyncLocalStorage.getItem(hiddenGroupsStorageName);
                try {
                    const parsedData = JSON.parse(data);
                    if (data && Array.isArray(parsedData)) {
                        setHiddenGroups(parsedData);
                    }
                } catch (e) {}
            }
        };
        getHiddenGroup();
    }, [comparisonId, hiddenGroupsStorageName]);

    useEffect(() => {
        // only is there is no hash, live comparison data can be fetched
        if (shouldFetchLiveComparison && !responseHash) {
            setShouldFetchLiveComparison(false);
            getComparisonResult();
        }
    }, [getComparisonResult, responseHash, shouldFetchLiveComparison]);

    useEffect(() => {
        if (comparisonId !== undefined) {
            loadComparisonMetaData(comparisonId);
        } else {
            // Update browser title
            document.title = 'Comparison - ORKG';
            setResponseHash(
                metaData?.hasPreviousVersion?.id && responseHash ? responseHash : getParamFromQueryString(location.search, 'response_hash')
            );
            setComparisonType(getParamFromQueryString(location.search, 'type') ?? DEFAULT_COMPARISON_METHOD);
            setTranspose(getParamFromQueryString(location.search, 'transpose', true));
            const contributionsIDs = without(uniq(getArrayParamFromQueryString(location.search, 'contributions')), undefined, null, '') ?? [];
            setContributionsList(contributionsIDs);
            setPredicatesList(getArrayParamFromQueryString(location.search, 'properties'));
        }
        updateComparisonPublicURL();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonId, loadComparisonMetaData]);

    /**
     * Update comparison if:
     *  1/ Contribution list changed
     *  2/ Comparison type changed
     *  3/ Comparison id changed and is not undefined
     */
    useEffect(() => {
        if (
            contributionsList.length > 0 &&
            ((prevComparisonId !== comparisonId && comparisonId) ||
                prevComparisonType !== comparisonType ||
                !contributionsList.every(id => contributions.map(c => c.id).includes(id)))
        ) {
            getComparisonResult();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonId, comparisonType, contributionsList.length]);

    /**
     * Update URL if
     *  1/ Property list change
     *  2/ Contribution list change
     *  3/ Comparison type change
     */
    useEffect(() => {
        if (urlNeedsToUpdate) {
            generateUrl();
            if (metaData.id) {
                setMetaData({
                    ...metaData,
                    doi: '',
                    hasPreviousVersion: { id: metaData.id, created_at: metaData.createdAt, created_by: metaData.created_by },
                    id: null,
                    visualizations: []
                });
            }
            setUrlNeedsToUpdate(false);
            generateMatrixOfComparison();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transpose, responseHash, comparisonType, urlNeedsToUpdate]);

    /**
     * Update Matrix of comparison
     *  1/ isLoadingComparisonResult is false (finished loading)
     */
    useEffect(() => {
        if (!isLoadingComparisonResult) {
            generateMatrixOfComparison();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingComparisonResult]);
    return {
        metaData,
        contributions,
        properties,
        data,
        filterControlData,
        matrixData,
        errors,
        transpose,
        comparisonType,
        responseHash,
        contributionsList,
        predicatesList,
        publicURL,
        comparisonURLConfig,
        shortLink,
        isLoadingMetaData,
        isFailedLoadingMetaData,
        isLoadingComparisonResult,
        isFailedLoadingComparisonResult,
        createdBy,
        provenance,
        researchField,
        setMetaData,
        hiddenGroups,
        setComparisonType,
        setPredicatesList,
        toggleProperty,
        onSortPropertiesEnd,
        toggleTranspose,
        removeContribution,
        addContributions,
        applyAllRules,
        updateRulesOfProperty,
        removeRule,
        generateUrl,
        setResponseHash,
        setUrlNeedsToUpdate,
        setShortLink,
        loadCreatedBy,
        loadProvenanceInfos,
        loadVisualizations,
        handleEditContributions,
        fetchLiveData,
        handleToggleGroupVisibility
    };
}
export default useComparison;
