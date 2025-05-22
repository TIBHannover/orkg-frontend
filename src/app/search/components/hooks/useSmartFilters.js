import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { getComparison } from '@/services/backend/comparisons';
import { getReview } from '@/services/backend/reviews';
import { getSmartFilters } from '@/services/smartFilters/index';

// Helper function to format facet labels
const formatFacetLabel = (label) => {
    if (!label) return '';

    // Replace special characters with spaces
    const cleanLabel = label.replace(/[^a-zA-Z0-9\s]/g, ' ');

    return cleanLabel
        .split(' ')
        .map((word) => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
        .trim();
};

export const SmartFilters = (searchTerm, results, initialResults, setSelectedSmartFilterIds, selectedSmartFilterIds) => {
    const [itemsIds, setItemsIds] = useState([]);
    const [itemsAbstracts, setItemsAbstracts] = useState([]);
    const [smartFiltersVisible, setSmartFiltersVisible] = useState(false); // Default value: false

    // Convert loopThroughResults into an async function to handle async calls
    // Function to extract IDs and Abstracts from the results
    const extractIdsAndAbstracts = async () => {
        const ids = [];
        const abstracts = [];

        const loopThroughResults = async (obj) => {
            for (const value of Object.values(obj)) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item && typeof item === 'object') {
                            if (item.id) ids.push(item.id);

                            let abstractText = item.label || ''; // Default label

                            // Handle Comparison
                            if (item.classes && item.classes.includes('Comparison')) {
                                try {
                                    const comparisonDetails = await getCompData(item.id);
                                    if (comparisonDetails) {
                                        const { description, data } = comparisonDetails;
                                        let paperTitles = [];

                                        if (data?.contributions) {
                                            paperTitles = data.contributions.map((contribution) => contribution.paper_label).filter(Boolean);
                                        }

                                        abstractText = [item.label, description, ...paperTitles].filter(Boolean).join(' - ');
                                    }
                                } catch (error) {
                                    console.error(`Error fetching comparison data for ${item.id}:`, error);
                                }
                            }

                            // Handle Smart Review
                            if (item.classes && item.classes.includes('SmartReviewPublished')) {
                                try {
                                    const reviewDetails = await getReviewData(item.id);
                                    if (reviewDetails) {
                                        const { title, sections } = reviewDetails;
                                        let introductionText = '';
                                        const comparisonAbstracts = [];

                                        // Extract Introduction Text
                                        const introSection = sections.find((section) => section.heading === 'Introduction');
                                        if (introSection) {
                                            introductionText = introSection.text || '';
                                        }

                                        // Extract Comparisons and Fetch Their Data
                                        const comparisonSections = sections.filter((section) => section.type === 'comparison');
                                        for (const section of comparisonSections) {
                                            const compId = section.comparison.id;
                                            try {
                                                const compData = await getCompData(compId);
                                                if (compData) {
                                                    const { description, data } = compData;
                                                    let paperTitles = [];

                                                    if (data?.contributions) {
                                                        paperTitles = data.contributions
                                                            .map((contribution) => contribution.paper_label)
                                                            .filter(Boolean);
                                                    }

                                                    const compText = [section.comparison.label, description, ...paperTitles]
                                                        .filter(Boolean)
                                                        .join(' - ');

                                                    comparisonAbstracts.push(compText);
                                                }
                                            } catch (error) {
                                                console.error(`Error fetching comparison data for ${compId}:`, error);
                                            }
                                        }

                                        // Final Review Abstract
                                        abstractText = [title, introductionText, ...comparisonAbstracts].filter(Boolean).join(' - ');
                                    }
                                } catch (error) {
                                    console.error(`Error fetching review data for ${item.id}:`, error);
                                }
                            }

                            abstracts.push(abstractText);
                        }
                    }
                } else if (typeof value === 'object') {
                    await loopThroughResults(value);
                }
            }
        };

        await loopThroughResults(results);
        setItemsIds(ids);
        setItemsAbstracts(abstracts);
        setSmartFiltersVisible(true);
    };

    // Function to fetch comparison details asynchronously
    const getCompData = async (compId) => {
        try {
            return await getComparison(compId);
        } catch (error) {
            console.error(`Error fetching comparison data: ${error}`);
            return null;
        }
    };

    // Function to fetch review details asynchronously
    const getReviewData = async (reviewId) => {
        try {
            return await getReview(reviewId);
        } catch (error) {
            console.error(`Error fetching review data: ${error}`);
            return null;
        }
    };

    const extractIdsFromObject = (obj) => {
        const ids = [];
        const extractIds = (data) => {
            if (Array.isArray(data)) {
                data.forEach((item) => extractIds(item));
            } else if (typeof data === 'object' && data !== null) {
                if (data.id) {
                    ids.push(data.id);
                }
                Object.values(data).forEach((value) => extractIds(value));
            }
        };

        extractIds(obj);
        return ids; // Return extracted IDs
    };

    useEffect(() => {
        setSmartFiltersVisible(false);
    }, [searchTerm, initialResults]);

    useEffect(() => {
        const uniqueMergedIds = [...new Set(extractIdsFromObject(results).concat(extractIdsFromObject(initialResults)))];
        if (uniqueMergedIds.length > extractIdsFromObject(initialResults).length) {
            setSmartFiltersVisible(false);
            if (selectedSmartFilterIds.length > 0) {
                setSelectedSmartFilterIds(() => []);
            }
        }
    }, [results]);

    const {
        data: facets,
        error,
        isLoading,
        mutate,
    } = useSWR(
        () => (searchTerm && itemsIds.length > 0 && smartFiltersVisible ? [`/smart-filters`, itemsIds] : null),
        async () => {
            if (!searchTerm || itemsIds.length === 0) return [];

            const response = await getSmartFilters({
                question: searchTerm,
                items_ids: itemsIds,
                items_abstracts: itemsAbstracts,
            });

            if (response?.payload?.facet_value_pairs) {
                return response.payload.facet_value_pairs.map((facet) => ({
                    ...facet,
                    facet: formatFacetLabel(facet.facet),
                    facet_values: facet.facet_values.map((value) => ({
                        ...value,
                        selected: false,
                    })),
                }));
            }

            throw new Error('Invalid response from the server.');
        },
        { revalidateOnFocus: false },
    );

    const memoizedFacets = useMemo(() => facets, [facets]);

    return {
        extractIdsAndAbstracts,
        itemsIds,
        itemsAbstracts,
        isLoading,
        error,
        memoizedFacets,
        setSmartFiltersVisible,
    };
};

export default SmartFilters;
