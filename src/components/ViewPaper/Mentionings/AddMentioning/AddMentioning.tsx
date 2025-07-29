import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import type { ActionMeta, SingleValue } from 'react-select';
import { InputGroup } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { StyledButton } from '@/components/StatementBrowser/styled';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
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

    return (
        <div>
            {!isVisibleAutocomplete ? (
                <ButtonGroup>
                    <ButtonWithLoading color="secondary" onClick={() => setIsVisibleAutocomplete(true)}>
                        <FontAwesomeIcon className="icon" icon={faPlus} /> Add item
                    </ButtonWithLoading>
                </ButtonGroup>
            ) : (
                <InputGroup>
                    <span className="input-group-text">
                        <FontAwesomeIcon className="icon" icon={faPlus} />
                    </span>

                    <SelectGlobalStyle />
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        placeholder="Select a resource"
                        onChange={onChange}
                        enableExternalSources
                        allowCreate
                        autoFocus
                        openMenuOnFocus
                    />
                    <StyledButton className="w-auto" outline onClick={() => setIsVisibleAutocomplete(false)}>
                        Cancel
                    </StyledButton>
                </InputGroup>
            )}
        </div>
    );
};

export default AddMentioning;
