import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isString } from 'lodash';
import { Button, FormGroup, Input, InputGroup, Label } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useFilters from '@/components/Search/hooks/useFilters';
import OrkgAskBanner from '@/components/Search/OrkgAskBanner/OrkgAskBanner';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import DEFAULT_FILTERS from '@/constants/searchDefaultFilters';

const Filters = () => {
    const { user, value, selectedFilters, createdBy, isLoadingFilterClasses, setValue, setCreatedBy, toggleFilter, submitSearch } = useFilters();

    let decodedValue;
    try {
        decodedValue = decodeURIComponent(value);
    } catch (e) {
        decodedValue = value;
    }

    const handleSubmitSearch = (_value) => {
        if (isString(_value) && _value) {
            submitSearch(_value);
        }
    };

    return (
        <FormGroup>
            <Label for="searchQuery">Search query</Label>
            <InputGroup>
                <Input
                    type="text"
                    value={decodedValue}
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
            {((!!user && user.id) || createdBy) && (
                <>
                    <hr className="mt-3 mb-3" />
                    <FormGroup check className="mb-0">
                        <Input type="checkbox" id="createdBy" onChange={(e) => setCreatedBy(createdBy ? null : user.id)} checked={!!createdBy} />
                        <Label check for="createdBy" className="mb-0">
                            <span>
                                Content created by <UserAvatar userId={createdBy || user.id} showDisplayName />
                            </span>
                        </Label>
                    </FormGroup>
                </>
            )}

            <hr className="mt-3 mb-3" />
            <OrkgAskBanner />
            <hr className="mt-3 mb-3" />

            <Label>Filter by type</Label>

            {DEFAULT_FILTERS.map((filter) => (
                <FormGroup key={`filter-${filter.id}`} check className="mb-0">
                    <Tooltip
                        disabled={!(createdBy && !filter.isCreatedByActive)}
                        content="This filter is not available for content created by a user."
                    >
                        <span>
                            <Input
                                disabled={createdBy && !filter.isCreatedByActive}
                                type="checkbox"
                                id={`filter${filter.id}`}
                                onChange={() => toggleFilter(filter)}
                                checked={selectedFilters.map((sf) => sf.id).includes(filter.id) && (filter.isCreatedByActive || !createdBy)}
                            />
                            <Label check for={`filter${filter.id}`} className="mb-0">
                                <span>{filter.label}</span>
                            </Label>
                        </span>
                    </Tooltip>
                </FormGroup>
            ))}
            <br />
            <Label for="other-filters">Other filters</Label>
            <Autocomplete
                entityType={ENTITIES.CLASS}
                onChange={(_, action) => {
                    if (action.action === 'select-option') {
                        toggleFilter(action.option);
                    } else if (action.action === 'remove-value') {
                        toggleFilter(action.removedValue);
                    } else if (action.action === 'clear') {
                        toggleFilter(null);
                    }
                }}
                placeholder="Select a filter"
                value={selectedFilters.filter((sf) => !DEFAULT_FILTERS.map((df) => df.id).includes(sf.id))}
                openMenuOnFocus
                enableExternalSources={false}
                isClearable
                isMulti
                isLoading={isLoadingFilterClasses}
                inputId="other-filters"
            />
        </FormGroup>
    );
};

export default Filters;
