import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import { CLASS_PARSERS } from '@/app/search/components/hooks/helpers';
import { Thing } from '@/services/backend/things';
import { PaginatedResponse } from '@/services/backend/types';
import { getSmartFilters, smartFiltersUrl } from '@/services/smartFilters/index';

const useSmartFilters = (searchTerm: string, results: PaginatedResponse<Thing> | undefined) => {
    'use memo';

    const [itemsIds, setItemsIds] = useState<string[]>([]);
    const [itemsAbstracts, setItemsAbstracts] = useState<string[]>([]);
    const [smartFiltersVisible, setSmartFiltersVisible] = useState(false);
    const [selectedSmartFilter, setSelectedSmartFilter] = useState<string[]>([]);
    const [isGeneratingSmartFilters, setIsGeneratingSmartFilters] = useState(false);
    const { trackEvent } = useMatomo();

    // Function to extract IDs and Abstracts from the results
    const generateSmartFilters = async () => {
        trackEvent({ category: 'smart filters', action: 'generate button clicked', name: 'true' });

        setIsGeneratingSmartFilters(true);
        try {
            const abstracts: string[] = await Promise.all(
                results?.content.map(async (item) => {
                    const matchedClass =
                        'classes' in item && item.classes && item.classes.length > 0 ? item.classes.find((cls) => cls in CLASS_PARSERS) : null;
                    const parser = matchedClass ? CLASS_PARSERS[matchedClass] : null;
                    if (parser) {
                        return parser(item);
                    }
                    return item.label || '';
                }) || [],
            );
            setItemsIds(results?.content.map((item) => item.id) || []);
            setItemsAbstracts(abstracts);
            setSmartFiltersVisible(true);
        } catch (error) {
            console.error('Error generating smart filters:', error);
            toast.error('Failed to generate smart filters');
        } finally {
            setIsGeneratingSmartFilters(false);
        }
    };

    useEffect(() => {
        setSmartFiltersVisible(false);
        setSelectedSmartFilter([]);
    }, [searchTerm, results]);

    const {
        data: facets,
        error,
        isLoading,
    } = useSWR(
        searchTerm && itemsIds.length > 0 && smartFiltersVisible
            ? [{ question: searchTerm, items_ids: itemsIds, items_abstracts: itemsAbstracts }, `getSmartFilters`, smartFiltersUrl]
            : null,
        ([params]) => getSmartFilters(params).then((response) => response?.payload?.facet_value_pairs),
    );

    let filteredItemsIds: string[] = [];
    if (!facets || !selectedSmartFilter || selectedSmartFilter.length === 0) {
        filteredItemsIds = [];
    } else {
        const ids = selectedSmartFilter.flatMap((label) =>
            facets.flatMap((facet) =>
                (facet?.facet_values || []).filter((value) => value.facet_value === label).flatMap((value) => value.paper_Ids || []),
            ),
        );
        filteredItemsIds = [...new Set(ids)];
    }

    return {
        generateSmartFilters,
        itemsIds,
        itemsAbstracts,
        isLoading: isLoading || isGeneratingSmartFilters,
        error,
        facets,
        setSmartFiltersVisible,
        filteredItemsIds,
        selectedSmartFilter,
        setSelectedSmartFilter,
    };
};

export default useSmartFilters;
