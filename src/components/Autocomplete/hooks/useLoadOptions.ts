import { useAutocompleteState } from 'components/Autocomplete/AutocompleteContext';
import { IdMatch, addAdditionalData, getExternalData, orkgLookup } from 'components/Autocomplete/hooks/helpers';
import { AdditionalType, OptionType, OptionsSettings } from 'components/Autocomplete/types';
import { CLASSES } from 'constants/graphSettings';
import type { GroupBase, OptionsOrGroups } from 'react-select';

const useLoadOptions = ({
    entityType,
    baseClass = '',
    includeClasses = [],
    excludeClasses = [],
    enableExternalSources = false,
    additionalOptions = [],
}: OptionsSettings) => {
    const { selectedOntologies } = useAutocompleteState();

    const PAGE_SIZE = enableExternalSources ? 3 : 12;

    const defaultAdditional = {
        page: 0,
    } as AdditionalType;

    const loadOptions = async (search: string, prevOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>, additional?: AdditionalType) => {
        const page = additional?.page ?? 1;
        let responseItems: OptionType[] = [];
        let hasMore = false;

        try {
            if (selectedOntologies.find((ontology) => ontology.id === 'orkg') || !enableExternalSources) {
                const orkgResponseItems = await orkgLookup({
                    value: search,
                    page,
                    entityType,
                    baseClass,
                    includeClasses,
                    excludeClasses,
                    pageSize: PAGE_SIZE,
                });

                if ('content' in orkgResponseItems) {
                    responseItems.push(...(orkgResponseItems?.content ?? []));
                    hasMore = orkgResponseItems.page.number < orkgResponseItems.page.total_pages - 1;
                }
            }

            if (page === 0 && search.startsWith('#')) {
                const searchById = await IdMatch(search.trim());
                responseItems = searchById.length ? [...searchById, ...responseItems] : responseItems;
            }

            if (additionalOptions.length) {
                responseItems = addAdditionalData(additionalOptions, search, responseItems, page);
            }

            // Add resources from third party registries
            // Also, if the target is a location class, load suggestions from Geonames
            if (enableExternalSources || includeClasses.includes(CLASSES.LOCATION)) {
                try {
                    const promises = await Promise.all(
                        getExternalData({
                            value: search,
                            page,
                            pageSize: PAGE_SIZE,
                            includeClasses,
                            entityType,
                            selectedOntologies,
                        }),
                    );
                    for (const data of promises) {
                        responseItems = [...responseItems, ...(data.options as OptionType[])];
                        hasMore = hasMore || data.hasMore;
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            return {
                options: responseItems,
                hasMore,
                additional: {
                    page: page + 1,
                },
            };
        } catch (err) {
            console.error(err);
            return {
                options: prevOptions,
                hasMore: false,
                additional: {
                    page: 0,
                },
            };
        }
    };

    return { loadOptions, defaultAdditional };
};

export default useLoadOptions;
