import { Input, InputGroup, InputGroupAddon, Button, Form, Label } from 'reactstrap';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { CustomInput } from 'reactstrap';
import { classesUrl } from 'services/backend/classes';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { isString } from 'lodash';

const Filters = props => {
    const PROPERTY_PATTERN = /^#P([0-9])+$/;
    const RESOURCE_PATTERN = /^#R([0-9])+$/;
    const MINIMUM_LENGTH_PATTERN = 3;

    const handleSubmit = e => {
        e.preventDefault();

        const value = decodeURIComponent(props.value);
        if (isString(value) && value.length >= MINIMUM_LENGTH_PATTERN && (value.match(RESOURCE_PATTERN) || value.match(PROPERTY_PATTERN))) {
            const id = value.substring(1);
            props.history.push(reverse(value.match(RESOURCE_PATTERN) ? ROUTES.RESOURCE : ROUTES.PROPERTY, { id }));
        } else {
            props.history.push(
                reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) }) + '?types=' + props.selectedFilters.map(sf => sf.id).join(',')
            );
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Label for="searchQuery">Search query</Label>
            <InputGroup>
                <Input
                    value={decodeURIComponent(props.value)}
                    onChange={props.handleInputChange}
                    aria-label="Search ORKG"
                    id="searchQuery"
                    name="value"
                />

                <InputGroupAddon addonType="append">
                    <Button type="submit" color="secondary" className="pl-2 pr-2">
                        <FontAwesomeIcon icon={faSearch} />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
            <hr className="mt-4 mb-3" />

            <Label>Filter by type</Label>

            {props.defaultsFilters.map(filter => (
                <CustomInput
                    type="checkbox"
                    id={'filter' + filter.id}
                    key={`filter-${filter.id}`}
                    label={<span>{filter.label}</span>}
                    onChange={() => props.toggleFilter(filter)}
                    checked={props.selectedFilters.map(sf => sf.id).includes(filter.id)}
                />
            ))}
            <br />
            <Label for="other-filters">Other filters</Label>
            <AutoComplete
                requestUrl={classesUrl}
                onChange={(_, action) => {
                    if (action.action === 'select-option') {
                        props.toggleFilter(action.option);
                    } else if (action.action === 'remove-value') {
                        props.toggleFilter(action.removedValue);
                    } else if (action.action === 'clear') {
                        props.toggleFilter(null);
                    }
                }}
                placeholder="Select a filter"
                value={props.selectedFilters.filter(sf => !props.defaultsFilters.map(df => df.id).includes(sf.id))}
                autoLoadOption={true}
                openMenuOnFocus={true}
                allowCreate={false}
                isClearable
                isMulti={true}
                autoFocus={false}
                inputId="other-filters"
            />
        </Form>
    );
};

Filters.propTypes = {
    value: PropTypes.string.isRequired,
    defaultsFilters: PropTypes.array.isRequired,
    selectedFilters: PropTypes.array.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
};

export default withRouter(Filters);
