import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Badge, Button, FormGroup, Input, InputGroup, Label } from 'reactstrap';

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

type FiltersProps = {
    results: PaginatedResponse<Thing>;
    /*
    initialResults: PaginatedResponse<Thing>;
    selectedSmartFilterLabels: string[];
    toggleSmartFilter: (facetValue: string, checked: boolean, memoizedFacets: any[]) => void;
    setSelectedSmartFilterIds: (ids: string[]) => void;
    selectedSmartFilterIds: string[];
    */
    countResults: Record<string, PaginatedResponse<Thing>>;
    typeData: { label: string; id: string } | undefined;
    isLoading: boolean;
};

const Filters: FC<FiltersProps> = ({
    results,
    /*
    initialResults,
    selectedSmartFilterLabels,
    toggleSmartFilter,
    setSelectedSmartFilterIds,
    selectedSmartFilterIds,
    */
    countResults,
    typeData,
    isLoading: isLoadingResults,
}) => {
    const { user } = useAuthentication();
    const {
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
    /*
    const { extractIdsAndAbstracts, isLoading, error, memoizedFacets } = useSmartFilters(
        searchTerm,
        results,
        initialResults,
        setSelectedSmartFilterIds,
        selectedSmartFilterIds,
    );
    // Track the open/close state of each facet
    const [openFacets, setOpenFacets] = useState({});

    const toggleFacet = (index: number) => {
        setOpenFacets((prev) => ({
            ...prev,
            // @ts-expect-error
            [index]: !prev[index], // Toggle the specific facet state
        }));
    };

    const handleSmartFilterChange = (facetValue: string, checked: boolean) => {
        // Ensure only the selected facet value is toggled
        // @ts-expect-error
        toggleSmartFilter(facetValue, checked, memoizedFacets);
    };
    */
    return (
        <FormGroup>
            <Label for="searchQuery">Search query</Label>
            <InputGroup>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search..."
                    id="searchQuery"
                    name="value"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitSearch(value)}
                    maxLength={MAX_LENGTH_INPUT}
                />
                <Button onClick={() => handleSubmitSearch(value)} color="secondary" className="ps-2 pe-2">
                    <FontAwesomeIcon icon={faSearch} />
                </Button>
            </InputGroup>

            <hr className="mt-3 mb-3" />
            <div className="d-flex justify-content-between">
                <h5>Filters </h5>
                {isFilterApplied && (
                    <Button outline size="xs" className="px-2 py-1 m-0" onClick={clearFilter}>
                        Clear
                    </Button>
                )}
            </div>
            {((!!user && user.id) || createdBy) && (
                <FormGroup className="mb-0 mt-2 ">
                    <Label for="createdBy" className="mb-0">
                        Contributor
                    </Label>
                    <AutocompleteContributor
                        onChange={(contributor) => {
                            setCreatedBy(contributor?.id || '');
                        }}
                        contributor={createdByData}
                    />
                </FormGroup>
            )}

            <FormGroup className="mb-0 mt-2 ">
                <Label for="createdBy" className="mb-0">
                    Observatory
                </Label>
                <AutocompleteObservatory
                    onChange={(observatory) => {
                        setObservatoryId(observatory?.id || '');
                    }}
                    observatory={observatoryData}
                    showLink
                />
            </FormGroup>

            <FormGroup className="mb-0 mt-2 ">
                <Label for="type-filters">Type</Label>

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

                <div className="mt-2">
                    {type && typeData && !DEFAULT_FILTERS.map((f) => f.id).includes(type) && (
                        <Button onClick={() => setType('')} size="sm" color="primary" className="rounded-pill me-2 mb-1 px-3">
                            {typeData.label}{' '}
                            <Badge size="sm" className="rounded-pill px-2">
                                {!isLoadingResults && results?.page?.total_elements}
                                {isLoadingResults && <FontAwesomeIcon icon={faSpinner} />}
                            </Badge>
                        </Button>
                    )}
                    {DEFAULT_FILTERS.map((filter) => (
                        <Button
                            onClick={() => (type !== filter.id ? setType(filter.id) : setType(''))}
                            key={filter.id}
                            size="sm"
                            color="primary"
                            outline={type !== filter.id}
                            className="rounded-pill me-2 mb-1 px-3"
                        >
                            {filter.label}{' '}
                            <Badge size="sm" className="rounded-pill px-2">
                                {!isLoadingResults && countResults[filter.id]?.page?.total_elements}
                                {isLoadingResults && <FontAwesomeIcon icon={faSpinner} />}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </FormGroup>

            {/* Smart Filters 
            <hr className="mt-3 mb-3" />
           
            <div className="d-flex align-items-center justify-content-between">
                <Label>
                    Smart Filters &nbsp;
                    <FontAwesomeIcon icon={faCircleInfo} className="ml-5 me-2" title="Smart filters are generated based on titles and descriptions" />
                </Label>
                <Button onClick={() => extractIdsAndAbstracts()} color="smart" size="sm" className="d-flex align-items-center" title="">
                    <FontAwesomeIcon icon={faMagic} className="me-2" />
                    Generate
                </Button>
            </div>

            <div className="mt-2 text-muted">
                {!isLoading && (!memoizedFacets || memoizedFacets.length === 0) && (
                    <div className="mt-1 small text-muted">
                        {error ? (
                            <span className="text-danger">{error.message || 'Failed to generate smart filters. Please try again.'}</span>
                        ) : (
                            'Click to generate smart filters'
                        )}
                    </div>
                )}

                {isLoading ? (
                    <ContentLoader speed={2} width="100%" height={60}>
                        <rect x="0" y="15" width="100%" height="30" />
                    </ContentLoader>
                ) : (
                    <div className="mt-2 text-muted">
                        {memoizedFacets && memoizedFacets.length > 0 && (
                            <div className="mt-3">
                                <div className="border p-2 rounded bg-light">
                                    {memoizedFacets.map((facet, index) => {
                                        const isFacetOpen = openFacets[index] || false; // Get facet state

                                        return (
                                            <div key={index} className="mb-2">
                                                {/* Facet Title
                                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions 
                                                <div
                                                    onClick={() => toggleFacet(index)} // Toggle facet open/close state
                                                    className="fw-bold"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {facet.facet}
                                                    <FontAwesomeIcon
                                                        icon={isFacetOpen ? faCaretUp : faCaretDown} // Toggle icon
                                                        className="ms-1"
                                                    />
                                                </div>

                                                {/* Facet Values with Checkboxes 
                                                <ul
                                                    className={`mt-1 ps-1 ${isFacetOpen ? '' : 'd-none'}`} // Show facet values when open
                                                    id={`facet-values-${index}`}
                                                    style={{ listStyleType: 'none' }}
                                                >
                                                    {facet.facet_values.map((value, vIndex) => (
                                                        <li key={vIndex}>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        type="checkbox"
                                                                        onChange={(e) => handleSmartFilterChange(value.facet_value, e.target.checked)}
                                                                        checked={selectedSmartFilterLabels.includes(value.facet_value)}
                                                                    />
                                                                    {value.facet_value} <span className="text-muted">({value.frequency})</span>
                                                                </Label>
                                                            </FormGroup>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div> */}
        </FormGroup>
    );
};

export default Filters;
