import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createProperty } from 'actions/bulkContributionEditor';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { predicatesUrl } from 'services/backend/predicates';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dispatch = useDispatch();

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action !== 'create-option' && action !== 'select-option') {
            return;
        }

        dispatch(
            createProperty({
                id: selected.id ?? null,
                label: inputValue,
                action
            })
        );
        setIsCreating(false);
        setInputValue('');
    };

    return !isCreating ? (
        <Button color="darkblue" onClick={() => setIsCreating(true)}>
            <Icon icon={faPlusCircle} /> Add property
        </Button>
    ) : (
        <div style={{ maxWidth: 300 }}>
            <Autocomplete
                requestUrl={predicatesUrl}
                placeholder="Enter a property"
                onChange={handleChangeAutocomplete}
                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                value={inputValue}
                onBlur={() => setIsCreating(false)}
                openMenuOnFocus={true}
                cssClasses="form-control-sm"
                menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                allowCreate
            />
        </div>
    );
};

export default CreateProperty;
