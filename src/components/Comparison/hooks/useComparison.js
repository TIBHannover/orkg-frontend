import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject, getStatementsBySubjectAndPredicate, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getUserInformationById } from 'services/backend/users';
import { getObservatoryAndOrganizationInformation } from 'services/backend/observatories';
import { getResource } from 'services/backend/resources';
import { getComparison } from 'services/similarity/index';
import {
    extendPropertyIds,
    similarPropertiesByLabel,
    filterObjectOfStatementsByPredicate,
    filterSubjectOfStatementsByPredicate,
    getArrayParamFromQueryString,
    getParamFromQueryString,
    get_error_message
} from 'utils';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PREDICATES, CLASSES, MISC } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { flattenDepth } from 'lodash';
import arrayMove from 'array-move';
import ROUTES from 'constants/routes.js';
import queryString from 'query-string';
import { usePrevious } from 'react-use';
import Confirm from 'reactstrap-confirm';

function useComparison() {
    const location = useLocation();
    const history = useHistory();
    const { comparisonId } = useParams();

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
     */
    /**
     * @typedef {Function} MetaDataSetter Set Metadata
     */
    /**
     * @type {[MetaData, MetaDataSetter]} Loading
     */
    const [metaData, setMetaData] = useState({});
    const [properties, setProperties] = useState([]);
    /**
     * @typedef {Object} Author
     * @property {String} id Author ID
     * @property {String} label Author name
     * @property {String} orcid Author ORCID
     */
    /**
     * @typedef {Function} AuthorSetter Set Authors
     */
    /**
     * @type {[[Author], AuthorSetter]} Loading
     */
    const [authors, setAuthors] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [data, setData] = useState({});
    const [errors, setErrors] = useState([]);
    const [matrixData, setMatrixData] = useState([]);

    const [hasNextVersions, setHasNextVersions] = useState([]);
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
    const [comparisonType, setComparisonType] = useState('merge');
    const [responseHash, setResponseHash] = useState(null);
    const [contributionsList, setContributionsList] = useState([]);
    const [predicatesList, setPredicatesList] = useState([]);
    const [shouldFetchLiveComparison, setShouldFetchLiveComparison] = useState(false);

    //
    const prevComparisonType = usePrevious(comparisonType);

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
            const visualizations = filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_VISUALIZATION, false);
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
            // Get the comparison resource
            getResource(cId)
                .then(comparisonResource => {
                    // Make sure that this resource is a comparison
                    if (!comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                        throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                    }
                    // Update browser title
                    document.title = `${comparisonResource.label} - Comparison - ORKG`;
                    return comparisonResource;
                })
                .then(comparisonResource => {
                    // Get meta data and config of a comparison
                    getStatementsBySubject({ id: cId }).then(statements => {
                        const description = filterObjectOfStatementsByPredicate(statements, PREDICATES.DESCRIPTION, true);
                        const doi = filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_DOI, true);
                        const references = filterObjectOfStatementsByPredicate(statements, PREDICATES.REFERENCE, false);
                        const hasPreviousVersion = filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_PREVIOUS_VERSION, true);
                        const resources = filterObjectOfStatementsByPredicate(statements, PREDICATES.RELATED_RESOURCES, false);
                        const figures = filterObjectOfStatementsByPredicate(statements, PREDICATES.RELATED_FIGURE, false);
                        const visualizations = filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_VISUALIZATION, false);
                        // Load authors
                        let creators = filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_AUTHOR, false);
                        if (creators) {
                            creators = creators.reverse(); // statements are ordered desc, so first author is last => thus reverse
                            loadAuthorsORCID(creators);
                        }

                        setMetaData({
                            id: cId,
                            title: comparisonResource.label,
                            createdAt: comparisonResource.created_at ?? '',
                            createdBy: comparisonResource.created_by ?? '',
                            description: description?.label,
                            doi: doi?.label,
                            references: references ? references.map(r => r.label) : [],
                            hasPreviousVersion: hasPreviousVersion,
                            resources: resources ? resources : [],
                            figures: figures ? figures : [],
                            visualizations: visualizations ? visualizations : []
                        });
                        // TODO: replace this with ordered feature
                        // Load comparison config
                        const url = filterObjectOfStatementsByPredicate(statements, PREDICATES.URL, true);
                        if (url) {
                            setResponseHash(getParamFromQueryString(url?.label.substring(url?.label.indexOf('?')), 'response_hash'));
                            setComparisonType(getParamFromQueryString(url?.label.substring(url?.label.indexOf('?')), 'type') ?? 'merge');
                            setTranspose(getParamFromQueryString(url?.label.substring(url?.label.indexOf('?')), 'transpose', true));
                            setPredicatesList(getArrayParamFromQueryString(url?.label.substring(url?.label.indexOf('?')), 'properties'));
                            setContributionsList(getArrayParamFromQueryString(url?.label.substring(url?.label.indexOf('?')), 'contributions'));
                        } else {
                            setPredicatesList(filterObjectOfStatementsByPredicate(statements, PREDICATES.HAS_PROPERTY, false)?.map(p => p.id));
                            setContributionsList(
                                filterObjectOfStatementsByPredicate(statements, PREDICATES.COMPARE_CONTRIBUTION, false)?.map(c => c.id)
                            );
                        }
                        setIsLoadingMetaData(false);
                        setIsFailedLoadingMetaData(false);
                    });

                    // Get the next versions
                    getStatementsByObjectAndPredicate({ objectId: cId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION }).then(statements => {
                        const hasNextVersion = filterSubjectOfStatementsByPredicate(statements, PREDICATES.HAS_PREVIOUS_VERSION, false);
                        setHasNextVersions(hasNextVersion);
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
     * Loading comparison Authors ORCIDs
     * Set the authors of the comparison
     * @param {Array[Object]} creators Creators
     */
    const loadAuthorsORCID = async creators => {
        return Promise.all(
            creators.map(author => getStatementsBySubjectAndPredicate({ subjectId: author.id, predicateId: PREDICATES.HAS_ORCID }))
        ).then(authorsORCID => {
            const authorsArray = [];
            for (const author of creators) {
                const orcid = flattenDepth(authorsORCID, 2).find(a => a !== undefined && a.subject.id === author.id);
                if (orcid) {
                    authorsArray.push({ orcid: orcid.object.label, label: author.label, id: author.id });
                } else {
                    authorsArray.push({ orcid: '', label: author.label, id: author.id });
                }
            }
            setAuthors(authorsArray);
        });
    };

    /**
     * Load creator user
     *
     * @param {String} created_by user ID
     */
    const loadCreatedBy = created_by => {
        // Get Provenance data
        if (created_by && created_by !== MISC.UNKNOWN_ID) {
            getUserInformationById(created_by)
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
            getObservatoryAndOrganizationInformation(observatory_id, organization_id).then(observatory => {
                setProvenance(observatory);
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
        comparisonData => {
            // if there are properties in the query string
            if (predicatesList.length > 0) {
                // Create an extended version of propertyIds (ADD the IDs of similar properties)
                const extendedPropertyIds = extendPropertyIds(predicatesList, comparisonData.data);
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
                    if (s.length) {
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

                comparisonData.properties = extendAndSortProperties(comparisonData);

                setContributions(comparisonData.contributions);
                setProperties(comparisonData.properties);
                setData(comparisonData.data);
                setIsLoadingComparisonResult(false);
                setIsFailedLoadingComparisonResult(false);
                if (comparisonData.response_hash) {
                    setResponseHash(comparisonData.response_hash);
                } else {
                    setResponseHash(responseHash);
                }
            })
            .catch(error => {
                console.log(error);
                setErrors(get_error_message(error));
                setIsLoadingComparisonResult(false);
                setIsFailedLoadingComparisonResult(true);
            });
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
        const newContributions = contributions.map(contribution => {
            return contribution.id === contributionId ? { ...contribution, active: !contribution.active } : contribution;
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
        setContributionsList(contributionsList.concat(newContributionIds));
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
                properties: predicatesList.join(','),
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

    const handleBulkEdit = async () => {
        if (metaData?.id) {
            const isConfirmed = await Confirm({
                title: 'This is a published comparison',
                message: `The comparison you are viewing is published, which means it cannot be modified. To make changes, fetch the live comparison data and try this action again`,
                cancelColor: 'light',
                confirmText: 'Fetch live data'
            });

            if (isConfirmed) {
                setUrlNeedsToUpdate(true);
                setResponseHash(null);
                setShouldFetchLiveComparison(true);
            }
        } else {
            const isConfirmed = await Confirm({
                title: 'Bulk edit contribution data',
                message: `You are about the edit the contributions displayed in the comparison. Changing this data does not only affect this comparison, but also other parts of the ORKG`,
                cancelColor: 'light',
                confirmText: 'Continue'
            });

            if (isConfirmed) {
                history.push(reverse(ROUTES.BULK_CONTRIBUTION_EDITOR) + `?contributions=${contributionsList.join(',')}`);
            }
        }
    };

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
            setResponseHash(getParamFromQueryString(location.search, 'response_hash'));
            setComparisonType(getParamFromQueryString(location.search, 'type') ?? 'merge');
            setTranspose(getParamFromQueryString(location.search, 'transpose', true));
            setContributionsList(getArrayParamFromQueryString(location.search, 'contributions'));
            setPredicatesList(getArrayParamFromQueryString(location.search, 'properties'));
        }
        updateComparisonPublicURL();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonId, loadComparisonMetaData]);

    /**
     * Update comparison if:
     *  1/ Contribution list changed
     *  2/ Comparison type changed
     */
    useEffect(() => {
        if (
            contributionsList.length > 0 &&
            (prevComparisonType !== comparisonType || !contributionsList.every(id => contributions.map(c => c.id).includes(id)))
        ) {
            getComparisonResult();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comparisonType, contributionsList.length]);

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
                    hasPreviousVersion: { id: metaData.id, created_at: metaData.createdAt, createdBy: metaData.createdBy },
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
        matrixData,
        authors,
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
        hasNextVersions,
        createdBy,
        provenance,
        researchField,
        setMetaData,
        setComparisonType,
        toggleProperty,
        onSortPropertiesEnd,
        toggleTranspose,
        removeContribution,
        addContributions,
        generateUrl,
        setResponseHash,
        setUrlNeedsToUpdate,
        setShortLink,
        setAuthors,
        loadCreatedBy,
        loadProvenanceInfos,
        loadVisualizations,
        handleBulkEdit
    };
}
export default useComparison;
