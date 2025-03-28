import PropTypes from 'prop-types';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';

const PublishedInInput = ({ value = '', onChange, inputId = null, isDisabled = false }) => (
    <Autocomplete
        inputId={inputId}
        allowCreate
        entityType={ENTITIES.RESOURCE}
        includeClasses={[CLASSES.VENUE]}
        enableExternalSources={false}
        onChange={async (selected, action) => {
            if (action.action === 'select-option') {
                onChange(selected);
            } else if (action.action === 'create-option') {
                const newVenue = await createResource(selected.label, [CLASSES.VENUE]);
                onChange({
                    ...selected,
                    id: newVenue.id,
                });
            } else if (action.action === 'clear') {
                onChange({
                    ...selected,
                    id: null,
                    label: null,
                });
            }
        }}
        cacheOptions
        value={value}
        isClearable
        isDisabled={isDisabled}
    />
);

PublishedInInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func.isRequired,
    inputId: PropTypes.string,
    isDisabled: PropTypes.bool,
};

export default PublishedInInput;
