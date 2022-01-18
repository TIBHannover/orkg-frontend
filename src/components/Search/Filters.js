import { Input, InputGroup, Button, Label, FormGroup } from 'reactstrap';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';
import { ENTITIES } from 'constants/graphSettings';
import useFilters from 'components/Search/hooks/useFilters';
import Tippy from '@tippyjs/react';

const Filters = () => {
    const { user, value, selectedFilters, byMe, isLoadingFilterClasses, setValue, setByMe, toggleFilter, submitSearch } = useFilters();

    return (
        <FormGroup>
            <Label for="searchQuery">Search query</Label>
            <InputGroup>
                <Input
                    value={decodeURIComponent(value)}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Search..."
                    id="searchQuery"
                    name="value"
                />
            </InputGroup>
            {!!user && user.id && (
                <>
                    <hr className="mt-3 mb-3" />
                    <FormGroup check className="mb-0">
                        <Input type="checkbox" id="byMe" onChange={e => setByMe(e.target.checked)} checked={byMe} />
                        <Label check for="byMe" className="mb-0">
                            <span>Content created by me</span>
                        </Label>
                    </FormGroup>
                </>
            )}

            <hr className="mt-3 mb-3" />

            <Label>Filter by type</Label>

            {DEFAULT_FILTERS.map(filter => (
                <FormGroup key={`filter-${filter.id}`} check className="mb-0">
                    <Tippy disabled={!(byMe && !filter.isByMeActive)} content="This filter is not available for content created by you.">
                        <span>
                            <Input
                                disabled={byMe && !filter.isByMeActive}
                                type="checkbox"
                                id={'filter' + filter.id}
                                onChange={() => toggleFilter(filter)}
                                checked={selectedFilters.map(sf => sf.id).includes(filter.id) && (filter.isByMeActive || !byMe)}
                            />
                            <Label check for={'filter' + filter.id} className="mb-0">
                                <span>{filter.label}</span>
                            </Label>
                        </span>
                    </Tippy>
                </FormGroup>
            ))}
            <br />
            <Label for="other-filters">Other filters</Label>
            <AutoComplete
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
                value={selectedFilters.filter(sf => !DEFAULT_FILTERS.map(df => df.id).includes(sf.id))}
                autoLoadOption={true}
                openMenuOnFocus={true}
                allowCreate={false}
                isClearable
                isMulti={true}
                autoFocus={false}
                isLoading={isLoadingFilterClasses}
                inputId="other-filters"
            />
            <br />
            <div className="text-center">
                <Button onClick={submitSearch} color="secondary" className="ps-3 pe-3">
                    <FontAwesomeIcon icon={faSearch} /> Search
                </Button>
            </div>
        </FormGroup>
    );
};

export default Filters;
