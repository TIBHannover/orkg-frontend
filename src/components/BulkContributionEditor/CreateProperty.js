import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { useState } from 'react';
import { Button } from 'reactstrap';
import { predicatesUrl } from 'services/backend/predicates';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return !isCreating ? (
        <Button color="darkblue" onClick={() => setIsCreating(true)}>
            <Icon icon={faPlusCircle} /> Add property
        </Button>
    ) : (
        <div style={{ maxWidth: 300 }}>
            <Autocomplete
                requestUrl={predicatesUrl}
                placeholder="Enter a property"
                onItemSelected={i => {
                    //props.handleValueSelect(valueType, i);
                    //setShowAddValue(false);
                }}
                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                value={inputValue}
                onBlur={() => setIsCreating(false)}
                //additionalData={props.newResources}
                //autoLoadOption={props.valueClass ? true : false}
                openMenuOnFocus={true}
                cssClasses="form-control-sm"
                menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                onKeyDown={e => {
                    /*if (e.keyCode === 27) {
                // escape
                setShowAddValue(false);
            } else if (e.keyCode === 13 && !isMenuOpen()) {
                props.handleAddValue(valueType, inputValue);
                setShowAddValue(false);
            }*/
                }}
                //innerRef={ref => (resourceInputRef.current = ref)}
                //handleCreateExistingLabel={handleCreateExistingLabel}
            />
        </div>
    );
};

export default CreateProperty;
