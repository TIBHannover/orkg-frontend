import { faCaretDown, faCaretUp, faCircleInfo, faCircleXmark, faMagic, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { startCase, toLower } from 'lodash';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import useFilters from '@/app/search/components/hooks/useFilters';
import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import AutocompleteContributor from '@/components/AutocompleteContributor/AutocompleteContributor';
import AutocompleteObservatory from '@/components/AutocompleteObservatory/AutocompleteObservatory2';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import Badge from '@/components/Ui/Badge/Badge';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
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

    // Track the open/close state of each facet
    const [openFacets, setOpenFacets] = useState<Record<number, boolean>>({});

    const toggleFacet = (index: number) => {
        setOpenFacets((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleSmartFilterChange = (facetValue: string, checked: boolean) => {
        if (setSelectedSmartFilter) {
            setSelectedSmartFilter((prevLabels) => {
                if (checked) {
                    return [...prevLabels, facetValue];
                }
                return prevLabels.filter((label) => label !== facetValue);
            });
        }
    };

    return (
        <FormGroup>
            <Label for="searchQuery">Search query</Label>
            <InputGroup className="tw:relative">
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
                <Button onClick={() => handleSubmitSearch('')} color="light-darker" className="ps-2 pe-2 tw:me-[2px]!" disabled={!value}>
                    <FontAwesomeIcon icon={faCircleXmark} />
                </Button>
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
                    {type && typeData && !defaultFilters.map((f) => f.id).includes(type) && (
                        <Button onClick={() => setType('')} size="sm" color="primary" className="rounded-pill me-2 mb-1 px-3">
                            {typeData.label}{' '}
                            <Badge size="sm" className="rounded-pill px-2">
                                {!isLoadingResults && results?.page?.total_elements}
                                {isLoadingResults && <FontAwesomeIcon icon={faSpinner} />}
                            </Badge>
                        </Button>
                    )}
                    {defaultFilters.map((filter) => (
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

            <hr className="mt-3 mb-3" />

            <div className="d-flex align-items-center justify-content-between">
                <Label>
                    Smart Filters{' '}
                    <Tooltip
                        content={
                            <>
                                Smart filters are created based on titles and descriptions for papers, comparisons, or reviews.{' '}
                                <a href="https://www.orkg.org/help-center/article/63/Smart_filters" target="_blank" rel="noreferrer">
                                    Learn more in the help center
                                </a>
                                .
                            </>
                        }
                    >
                        <FontAwesomeIcon icon={faCircleInfo} className="ml-5 me-2" />
                    </Tooltip>
                </Label>
                <ButtonWithLoading
                    isLoading={isLoadingSmartFilters}
                    isDisabled={!searchTerm}
                    loadingMessage="Generating..."
                    onClick={() => generateSmartFilters()}
                    color="smart"
                    size="sm"
                    className="d-flex align-items-center"
                >
                    <FontAwesomeIcon icon={faMagic} className="me-2" />
                    Generate
                </ButtonWithLoading>
            </div>

            <div className="mt-2 text-muted">
                {!isLoadingSmartFilters && (!facets || facets.length === 0) && (
                    <div className="mt-1 small text-muted">
                        {searchTerm && errorSmartFilters && (
                            <span className="text-danger">{errorSmartFilters.message || 'Failed to generate smart filters. Please try again.'}</span>
                        )}
                        {!searchTerm && !errorSmartFilters && 'Enter a search query to enable generating smart filters'}
                        {searchTerm && !errorSmartFilters && 'Click to generate smart filters'}
                    </div>
                )}

                {isLoadingSmartFilters ? (
                    <ContentLoader speed={2} width="100%" height={70}>
                        <rect x="0" y="0" width="100%" height="30" />
                        <rect x="0" y="40" width="100%" height="30" />
                    </ContentLoader>
                ) : (
                    <div className="mt-2 text-muted">
                        {facets && facets.length > 0 && (
                            <div className="mt-3">
                                <div className="border p-2 rounded bg-light">
                                    {facets.map((facet, index) => {
                                        const isFacetOpen = openFacets[index] || false; // Get facet state

                                        return (
                                            <div key={index} className="mb-2">
                                                {/* Facet Title */}
                                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                                                <div onClick={() => toggleFacet(index)} className=" tw:cursor-pointer tw:font-bold">
                                                    {startCase(toLower(facet.facet || ''))}
                                                    <FontAwesomeIcon icon={isFacetOpen ? faCaretUp : faCaretDown} className="ms-1" />
                                                </div>

                                                {/* Facet Values with Checkboxes */}
                                                <ul className={`mt-1 ps-1 ${isFacetOpen ? '' : 'd-none'}`} style={{ listStyleType: 'none' }}>
                                                    {facet.facet_values.map((fv, vIndex) => (
                                                        <li key={vIndex}>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        type="checkbox"
                                                                        onChange={(e) => handleSmartFilterChange(fv.facet_value, e.target.checked)}
                                                                        checked={selectedSmartFilter.includes(fv.facet_value)}
                                                                    />
                                                                    {fv.facet_value} <span className="text-muted">({fv.frequency})</span>
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
            </div>
        </FormGroup>
    );
};

export default Filters;
