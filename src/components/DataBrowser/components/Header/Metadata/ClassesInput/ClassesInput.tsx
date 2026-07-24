import { faCheck, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, toast } from '@heroui/react';
import { FC, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useClasses from '@/components/DataBrowser/hooks/useClasses';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useAuthentication from '@/components/hooks/useAuthentication';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA } from '@/constants/contentTypes';
import { ENTITIES, ENTITY_CLASSES } from '@/constants/graphSettings';
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
    const { user } = useAuthentication();
    const isCurationAllowed = user?.isCurationAllowed ?? false;

    const submitChanges = async () => {
        if (entity) {
            await updateResource(entity.id, { classes: localClasses?.map((c) => c.id) ?? [] });
            mutateEntity();
            setIsEditing(false);
        }
    };

    const handleUpdateClasses = async (selected: MultiValue<OptionType>, action: ActionMeta<OptionType>) => {
        setIsUpdating(true);
        if (action.action === 'select-option') {
            if (action.option && ENTITY_CLASSES.includes(action.option.id)) {
                toast.danger(`The selected option ${action.option.label} cannot be set manually; it is reserved for managing entities in the system`);
            } else if (!isCurationAllowed && action.option && CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(action.option.id)) {
                toast.danger(
                    `The selected option ${action.option.label} cannot be set manually; it is reserved for managing content types in the system`,
                );
            } else {
                setLocalClasses(selected as Class[]);
            }
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
            if (!isCurationAllowed && action.removedValue.id && CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(action.removedValue.id)) {
                toast.danger(
                    `The selected option ${action.removedValue.label} cannot be removed; it is reserved for managing content types in the system`,
                );
            } else {
                setLocalClasses(localClasses.filter((c) => c.id !== action.removedValue.id));
            }
        } else if (action.action === 'clear') {
            setLocalClasses([]);
        }
        setIsUpdating(false);
    };

    return (
        <div className="grow ml-1 flex items-stretch">
            <div className="min-w-0 flex-1">
                <Autocomplete
                    entityType={ENTITIES.CLASS}
                    onChange={handleUpdateClasses}
                    placeholder="Specify the classes of the resource"
                    value={localClasses}
                    allowCreate
                    isMulti
                    enableExternalSources
                    size="sm"
                    groupPosition="start"
                    inputId="classes-autocomplete"
                />
            </div>
            <Button
                variant="secondary"
                size="sm"
                isIconOnly
                aria-label="Cancel"
                className="!h-auto !rounded-none -ms-px"
                onPress={() => setIsEditing(false)}
            >
                <FontAwesomeIcon icon={faClose} />
            </Button>
            <Button
                variant="primary"
                size="sm"
                isIconOnly
                isDisabled={isUpdating}
                aria-label="Save"
                className="!h-auto !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                onPress={submitChanges}
            >
                <FontAwesomeIcon icon={faCheck} />
            </Button>
        </div>
    );
};

export default ClassesInput;
