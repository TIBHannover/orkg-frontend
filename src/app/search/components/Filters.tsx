import { faCaretDown, faCaretUp, faCircleInfo, faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Chip, Label, SearchField, Separator, Skeleton, Tooltip } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { startCase, toLower } from 'lodash';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import useFilters from '@/app/search/components/hooks/useFilters';
import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import AutocompleteContributor from '@/components/AutocompleteContributor/AutocompleteContributor';
import AutocompleteObservatory from '@/components/AutocompleteObservatory/AutocompleteObservatory2';
import useAuthentication from '@/components/hooks/useAuthentication';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { Thing } from '@/services/backend/things';
import { PaginatedResponse } from '@/services/backend/types';
import { FacetValuePair } from '@/services/smartFilters';

type FiltersProps = {
    results: PaginatedResponse<Thing>;
    defaultFilters?: { id: string; label: string }[];
    countResults: Record<string, PaginatedResponse<Thing>>;
    typeData: { label: string; id: string } | undefined;
    isLoading: boolean;
    selectedSmartFilter?: string[];
    setSelectedSmartFilter?: Dispatch<SetStateAction<string[]>>;
    generateSmartFilters: () => void;
    isLoadingSmartFilters: boolean;
    errorSmartFilters: Error | undefined;
    facets: FacetValuePair[];
};

const Filters: FC<FiltersProps> = ({
    results,
    defaultFilters = DEFAULT_FILTERS,
    countResults,
    typeData,
    isLoading: isLoadingResults,
    selectedSmartFilter = [],
    setSelectedSmartFilter = () => {},
    generateSmartFilters,
    isLoadingSmartFilters,
    errorSmartFilters,
    facets,
}) => {
    const { user } = useAuthentication();

    const {
        searchTerm,
        value,
        createdBy,
        setCreatedBy,
        setValue,
        handleSubmitSearch,
        type,
        setType,
        setObservatoryId,
        observatoryData,
        createdByData,
        clearFilter,
        isFilterApplied,
    } = useFilters();

    const [openFacets, setOpenFacets] = useState<Record<number, boolean>>({});

    const toggleFacet = (index: number) => {
        setOpenFacets((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleSmartFilterChange = (facetValue: string, checked: boolean) => {
        if (setSelectedSmartFilter) {
            sendEvent({ category: 'smart filters', action: 'facet value toggled', name: checked.toString() });

            setSelectedSmartFilter((prevLabels) => {
                if (checked) {
                    return [...prevLabels, facetValue];
                }
                return prevLabels.filter((label) => label !== facetValue);
            });
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Label htmlFor="searchQuery">Search query</Label>
                <SearchField
                    aria-label="Search query"
                    value={value}
                    onChange={setValue}
                    onSubmit={(v) => handleSubmitSearch(v)}
                    onClear={() => handleSubmitSearch('')}
                    maxLength={MAX_LENGTH_INPUT}
                    variant="secondary"
                >
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input placeholder="Search..." id="searchQuery" />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold m-0">Filters</h3>
                    {isFilterApplied && (
                        <Button variant="outline" size="sm" onPress={clearFilter}>
                            Clear
                        </Button>
                    )}
                </div>

                {((!!user && user.id) || createdBy) && (
                    <div className="flex flex-col gap-2 w-full">
                        <Label>Contributor</Label>
                        <div className="w-full">
                            <AutocompleteContributor
                                onChange={(contributor) => {
                                    setCreatedBy(contributor?.id || '');
                                }}
                                contributor={createdByData}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <Label>Observatory</Label>
                    <div className="w-full">
                        <AutocompleteObservatory
                            onChange={(observatory) => {
                                setObservatoryId(observatory?.id || '');
                            }}
                            observatory={observatoryData}
                            showLink
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="type-filters">Type</Label>
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        onChange={(selected, { action }) => {
                            if (selected && action === 'select-option') {
                                setType(selected.id);
                            } else if (action === 'clear') {
                                setType('');
                            }
                        }}
                        placeholder="Select a class"
                        openMenuOnFocus
                        enableExternalSources={false}
                        isClearable
                        allowCreate={false}
                        inputId="type-filters"
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                        {type && typeData && !defaultFilters.map((f) => f.id).includes(type) && (
                            <Button onPress={() => setType('')} size="sm" variant="primary" className="rounded-full px-4">
                                {typeData.label}{' '}
                                <Chip size="sm" className="rounded-full px-2">
                                    {!isLoadingResults && results?.page?.total_elements}
                                    {isLoadingResults && <FontAwesomeIcon icon={faSpinner} spin />}
                                </Chip>
                            </Button>
                        )}
                        {defaultFilters.map((filter) => (
                            <Button
                                onPress={() => (type !== filter.id ? setType(filter.id) : setType(''))}
                                key={filter.id}
                                size="sm"
                                variant={type !== filter.id ? 'outline' : 'primary'}
                                className="rounded-full px-4"
                            >
                                {filter.label}{' '}
                                <Chip size="sm" className="rounded-full px-2">
                                    {!isLoadingResults && countResults[filter.id]?.page?.total_elements}
                                    {isLoadingResults && <FontAwesomeIcon icon={faSpinner} spin />}
                                </Chip>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Label className="flex items-center gap-2">
                        Smart Filters
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <FontAwesomeIcon icon={faCircleInfo} className="text-muted" />
                            </Tooltip.Trigger>
                            <Tooltip.Content showArrow>
                                <Tooltip.Arrow />
                                Smart filters are created based on titles and descriptions for papers, comparisons, or reviews.{' '}
                                <a href="https://www.orkg.org/help-center/article/63/Smart_filters" target="_blank" rel="noreferrer">
                                    Learn more in the help center
                                </a>
                                .
                            </Tooltip.Content>
                        </Tooltip>
                    </Label>
                    <Button isDisabled={isLoadingSmartFilters || !searchTerm} onPress={() => generateSmartFilters()} variant="secondary" size="sm">
                        {isLoadingSmartFilters ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                                Generate
                            </>
                        )}
                    </Button>
                </div>

                {!isLoadingSmartFilters && (!facets || facets.length === 0) && (
                    <div className="text-sm text-gray-500">
                        {searchTerm && errorSmartFilters && (
                            <span className="text-red-600">{errorSmartFilters.message || 'Failed to generate smart filters. Please try again.'}</span>
                        )}
                        {!searchTerm && !errorSmartFilters && 'Enter a search query to enable generating smart filters'}
                        {searchTerm && !errorSmartFilters && 'Click to generate smart filters'}
                    </div>
                )}

                {isLoadingSmartFilters && (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-7 w-full rounded" />
                        <Skeleton className="h-7 w-full rounded" />
                    </div>
                )}

                {!isLoadingSmartFilters && facets && facets.length > 0 && (
                    <div className="rounded border bg-background p-3 flex flex-col gap-3">
                        {facets.map((facet, index) => {
                            const isFacetOpen = openFacets[index] || false;
                            return (
                                <div key={index} className="flex flex-col gap-1">
                                    <button type="button" onClick={() => toggleFacet(index)} className="cursor-pointer font-bold text-left">
                                        {startCase(toLower(facet.facet || ''))}
                                        <FontAwesomeIcon icon={isFacetOpen ? faCaretUp : faCaretDown} className="ml-2" />
                                    </button>
                                    <ul className={`list-none pl-1 flex flex-col gap-1 ${isFacetOpen ? '' : 'hidden'}`}>
                                        {facet.facet_values.map((fv, vIndex) => (
                                            <li key={vIndex}>
                                                <Checkbox
                                                    isSelected={selectedSmartFilter.includes(fv.facet_value)}
                                                    onChange={(checked) => handleSmartFilterChange(fv.facet_value, checked)}
                                                >
                                                    <Checkbox.Content>
                                                        <Checkbox.Control>
                                                            <Checkbox.Indicator />
                                                        </Checkbox.Control>
                                                        <span>
                                                            {fv.facet_value} <span className="text-gray-500">({fv.frequency})</span>
                                                        </span>
                                                    </Checkbox.Content>
                                                </Checkbox>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Filters;
