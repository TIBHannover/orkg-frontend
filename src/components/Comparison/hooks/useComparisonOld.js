import { generateFilterControlData } from 'components/Comparison/hooks/helpers';
import useComparisonNew from 'components/Comparison/hooks/useComparison';
import useParams from 'components/useParams/useParams';
import THING_TYPES from 'constants/thingTypes';
import { isEmpty, uniq, without } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getComparison, getThing } from 'services/simcomp/index';
import {
    extendAndSortProperties,
    setComparisonId,
    setConfiguration,
    setConfigurationAttribute,
    setContributions,
    setData,
    setErrors,
    setFilterControlData,
    setHiddenGroups,
    setIsEmbeddedMode,
    setIsFailedLoadingResult,
    setIsLoadingResult,
    setProperties,
} from 'slices/comparisonSlice';
import { asyncLocalStorage, getErrorMessage } from 'utils';

const DEFAULT_COMPARISON_METHOD = 'PATH';

function useComparisonOld({ id, isPublished, contributionIds, isEmbeddedMode = false }) {
    const searchParams = useSearchParams();
    const params = useParams();
    const comparisonId = id || params.comparisonId;
    const { comparison } = useComparisonNew(comparisonId);
    const hiddenGroupsStorageName = comparisonId ? `comparison-${comparisonId}-hidden-rows` : null;

    const dispatch = useDispatch();
    const contributionsList = useSelector((state) => state.comparison.configuration.contributionsList);
    const transpose = !!comparison?.config?.transpose;
    const predicatesList = comparison?.config?.predicates ?? [];
    const comparisonType = comparison?.config?.type ?? null;
    const contributions = useSelector((state) => state.comparison.contributions);
    const isLoadingResult = useSelector((state) => state.comparison.isLoadingResult);
    const data = useSelector((state) => state.comparison.data);
    const properties = useSelector((state) => state.comparison.properties);

    /**
     * Call the comparison service to get the comparison result
     */
    const getComparisonResult = useCallback(
        (contributionsIDs) => {
            dispatch(setIsLoadingResult(true));
            let simCompCall = null;
            if (isPublished && comparisonId) {
                simCompCall = getThing({ thingType: THING_TYPES.COMPARISON, thingKey: comparisonId });
            } else {
                simCompCall = getComparison({
                    contributionIds: contributionsIDs,
                    type: comparisonType,
                });
            }

            simCompCall
                .then(async (_comparisonData) => {
                    let comparisonData;
                    if (isPublished && comparisonId) {
                        comparisonData = _comparisonData.data;
                        dispatch(
                            setConfiguration({
                                ..._comparisonData.config,
                                comparisonType: _comparisonData.config.type,
                                predicatesList: _comparisonData.config.predicates ?? [],
                                contributionsList: _comparisonData.config.contributions,
                            }),
                        );
                    } else {
                        comparisonData = _comparisonData;
                    }
                    comparisonData.properties = comparisonData.predicates;

                    comparisonData.contributions.forEach((contribution, index) => {
                        comparisonData.contributions[index].active = true;
                    });

                    comparisonData.properties = await dispatch(extendAndSortProperties(comparisonData, comparisonType));

                    dispatch(setContributions(comparisonData.contributions));
                    dispatch(setProperties(comparisonData.properties));
                    dispatch(setData(comparisonData.data));
                    dispatch(
                        setFilterControlData(generateFilterControlData(comparisonData.contributions, comparisonData.properties, comparisonData.data)),
                    );
                    dispatch(setIsLoadingResult(false));
                    dispatch(setIsFailedLoadingResult(false));
                    dispatch(setComparisonId(comparisonId));
                })
                .catch((error) => {
                    console.error(error);
                    dispatch(setErrors(getErrorMessage(error)));
                    dispatch(setIsLoadingResult(false));
                    dispatch(setIsFailedLoadingResult(true));
                });
        },
        [comparisonId, comparisonType, contributionsList, dispatch, isPublished],
    );

    useEffect(() => {
        const getHiddenGroup = async () => {
            if (comparisonId && hiddenGroupsStorageName) {
                const _data = await asyncLocalStorage.getItem(hiddenGroupsStorageName);
                try {
                    const parsedData = JSON.parse(_data);
                    if (_data && Array.isArray(parsedData)) {
                        dispatch(setHiddenGroups(parsedData));
                    }
                } catch (e) {}
            }
        };
        getHiddenGroup();
    }, [comparisonId, dispatch, hiddenGroupsStorageName]);

    /**
     * parse query params and set the configuration
     */
    useEffect(() => {
        if (isPublished && comparisonId !== undefined && !searchParams.has('noResource')) {
            getComparisonResult();
        } else if (contributionIds && contributionIds.length > 0) {
            // Update browser title
            document.title = 'Comparison - ORKG';

            dispatch(
                setConfigurationAttribute({
                    attribute: 'comparisonType',
                    value: comparisonType ?? DEFAULT_COMPARISON_METHOD,
                }),
            );
            dispatch(setConfigurationAttribute({ attribute: 'transpose', value: transpose ?? false }));
            const parsedContributions = contributionIds;
            const contributionsIDs = without(uniq(!isEmpty(parsedContributions) ? parsedContributions : []), undefined, null, '') ?? [];
            dispatch(setConfigurationAttribute({ attribute: 'contributionsList', value: contributionsIDs }));
            dispatch(setConfigurationAttribute({ attribute: 'predicatesList', value: predicatesList }));
            getComparisonResult(contributionsIDs);
        }
    }, [
        comparisonId,
        dispatch,
        searchParams,
        isPublished,
        JSON.stringify(contributionIds),
        comparisonType,
        transpose,
        JSON.stringify(predicatesList),
    ]);

    useEffect(() => {
        dispatch(setIsEmbeddedMode(isEmbeddedMode));
    }, [isEmbeddedMode, dispatch]);

    return {
        isLoadingResult,
        data,
        contributions,
        properties,
    };
}
export default useComparisonOld;
