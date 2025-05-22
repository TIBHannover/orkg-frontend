import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

const useSmartFilters = (setResults, results) => {
    const [selectedSmartFilterLabels, setSelectedSmartFilterLabels] = useState([]);
    const [selectedSmartFilterIds, setSelectedSmartFilterIds] = useState([]);
    const [memoizedFacets, setMemoizedFacets] = useState([]);
    const [initialResults, setInitialResults] = useState(results); // Stores the unfiltered results

    const toggleSmartFilter = (facetValue, isChecked, memoizedFacets) => {
        setMemoizedFacets(memoizedFacets);
        setSelectedSmartFilterLabels((prevLabels) => {
            if (isChecked) {
                return [...prevLabels, facetValue];
            }
            return prevLabels.filter((label) => label !== facetValue);
        });
    };

    useEffect(() => {
        if (memoizedFacets) {
            let newPaperIds = [];
            selectedSmartFilterLabels.forEach((label) => {
                memoizedFacets.forEach((facet) => {
                    facet.facet_values.forEach((value) => {
                        if (value.facet_value === label) {
                            newPaperIds = [...newPaperIds, ...value.paper_Ids];
                        }
                    });
                });
            });
            // remove duplicates
            newPaperIds = [...new Set(newPaperIds)];
            setSelectedSmartFilterIds(newPaperIds);
        }
    }, [selectedSmartFilterLabels, memoizedFacets]);

    useEffect(() => {
        // When results are first set, save a copy in `initialResults`
        if (!isEmpty(results) && selectedSmartFilterIds.length === 0) {
            setInitialResults(results);
        }
    }, [results]);

    useEffect(() => {
        if (!initialResults) return; // Ensure initial results exist

        if (selectedSmartFilterIds.length > 0) {
            const filteredResults = {};
            for (const key in initialResults) {
                if (Array.isArray(initialResults[key])) {
                    filteredResults[key] = initialResults[key].filter((item) => selectedSmartFilterIds.includes(item.id));
                } else {
                    filteredResults[key] = initialResults[key];
                }
            }
            setResults(filteredResults);
        } else {
            // If no filters are applied, reset to the original results
            setResults(initialResults);
        }
    }, [selectedSmartFilterIds]);

    return {
        selectedSmartFilterLabels,
        selectedSmartFilterIds,
        setSelectedSmartFilterIds,
        toggleSmartFilter,
        initialResults,
    };
};

export default useSmartFilters;
