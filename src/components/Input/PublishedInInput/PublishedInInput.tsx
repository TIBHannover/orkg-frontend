import { ActionMeta } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { PublishedIn } from '@/components/PaperForm/types';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';

type PublishedInInputProps = {
    value?: PublishedIn | string;
    onChange: (value: PublishedIn) => void;
    inputId?: string;
    isDisabled?: boolean;
};

const toOption = (value: PublishedInInputProps['value']): OptionType | null => {
    if (!value) return null;
    if (typeof value === 'string') return { id: '', label: value } as OptionType;
    return { id: value.id ?? '', label: value.label } as OptionType;
};

const PublishedInInput = ({ value, onChange, inputId, isDisabled = false }: PublishedInInputProps) => {
    const normalizedValue = toOption(value);

    return (
        <Autocomplete
            inputId={inputId}
            allowCreate
            entityType={ENTITIES.RESOURCE}
            includeClasses={[CLASSES.VENUE]}
            enableExternalSources={false}
            onChange={async (selected: OptionType | null, action: ActionMeta<OptionType>) => {
                if (!selected) {
                    onChange(null);
                    return;
                }
                if (action.action === 'select-option') {
                    onChange({ id: selected.id, label: selected.label });
                } else if (action.action === 'create-option') {
                    const newVenueId = await createResource({ label: selected.label, classes: [CLASSES.VENUE] });
                    onChange({ id: newVenueId, label: selected.label });
                } else if (action.action === 'clear') {
                    onChange(null);
                }
            }}
            value={normalizedValue}
            isClearable
            isDisabled={isDisabled}
        />
    );
};

export default PublishedInInput;
