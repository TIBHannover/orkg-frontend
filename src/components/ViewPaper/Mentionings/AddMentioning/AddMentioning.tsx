import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { FC, useState } from 'react';
import type { ActionMeta, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import { ENTITIES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';

type AddMentioningProps = {
    handleAddMentioning: (newMentioningId: string) => Promise<void>;
};

const AddMentioning: FC<AddMentioningProps> = ({ handleAddMentioning }) => {
    const [isVisibleAutocomplete, setIsVisibleAutocomplete] = useState(false);

    const onChange = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (!selected) {
            return;
        }

        let resource = selected.id;

        if (action === 'create-option') {
            resource = await createResource({ label: selected.label, classes: [] });
        }

        handleAddMentioning(resource);
        setIsVisibleAutocomplete(false);
    };

    if (!isVisibleAutocomplete) {
        return (
            <div className="flex h-[38px]">
                <Button size="sm" className="button--orkg-secondary !h-[38px]" onPress={() => setIsVisibleAutocomplete(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Add item
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-stretch w-full h-[38px]">
            <span className="inline-flex items-center px-3 border border-border border-e-0 rounded-s bg-surface-secondary text-muted">
                <FontAwesomeIcon icon={faPlus} />
            </span>
            <div className="flex-1 min-w-0 [&_.form-control]:rounded-none">
                <Autocomplete
                    entityType={ENTITIES.RESOURCE}
                    placeholder="Select a resource"
                    onChange={onChange}
                    enableExternalSources
                    allowCreate
                    autoFocus
                    openMenuOnFocus
                />
            </div>
            <Button size="sm" variant="secondary" className="rounded-s-none -ms-px !h-[38px]" onPress={() => setIsVisibleAutocomplete(false)}>
                Cancel
            </Button>
        </div>
    );
};

export default AddMentioning;
