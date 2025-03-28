import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { Button, InputGroup } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useClasses from '@/components/DataBrowser/hooks/useClasses';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { ENTITIES } from '@/constants/graphSettings';
import { updateResource } from '@/services/backend/resources';
import { Class } from '@/services/backend/types';

type ClassesInputProps = {
    setIsEditing: (isEditing: boolean) => void;
};

const ClassesInput: FC<ClassesInputProps> = ({ setIsEditing }) => {
    const { classes } = useClasses();
    const { entity, mutateEntity } = useEntity();
    const [localClasses, setLocalClasses] = useState(classes);
    const [isUpdating, setIsUpdating] = useState(false);

    const submitChanges = async () => {
        if (entity) {
            await updateResource(entity?.id, undefined, localClasses?.map((c) => c.id) ?? []);
            mutateEntity();
            setIsEditing(false);
        }
    };

    const handleUpdateClasses = async (selected: MultiValue<OptionType>, action: ActionMeta<OptionType>) => {
        setIsUpdating(true);
        if (action.action === 'select-option') {
            setLocalClasses(selected as Class[]);
        } else if (action.action === 'create-option' && selected) {
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                const _foundIndex = selected.findIndex((x) => x.__isNew__);
                // @ts-expect-error read only
                selected[_foundIndex] = newClass;
                setLocalClasses(selected as Class[]);
            }
        } else if (action.action === 'remove-value') {
            setLocalClasses(localClasses.filter((c) => c.id !== action.removedValue.id));
        } else if (action.action === 'clear') {
            setLocalClasses([]);
        }
        setIsUpdating(false);
    };

    return (
        <div className="flex-grow-1 ms-1 ">
            <InputGroup size="sm">
                <Autocomplete
                    entityType={ENTITIES.CLASS}
                    onChange={handleUpdateClasses}
                    placeholder="Specify the classes of the resource"
                    value={localClasses}
                    allowCreate
                    isMulti
                    enableExternalSources
                    size="sm"
                    inputId="classes-autocomplete"
                />
                <Button type="submit" color="secondary" onClick={() => setIsEditing(false)}>
                    <FontAwesomeIcon icon={faClose} />
                </Button>
                <Button disabled={isUpdating} title="Save" type="submit" color="primary" onClick={submitChanges}>
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
            </InputGroup>
        </div>
    );
};

export default ClassesInput;
