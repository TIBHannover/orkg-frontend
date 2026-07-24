import { faCheck, faPen, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from '@heroui/react';
import Link from 'next/link';
import { FC, useEffect, useRef, useState } from 'react';
import type { ActionMeta, SingleValue } from 'react-select';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Class } from '@/services/backend/types';

type ClassInlineItemProps = {
    classObject?: Class | null;
    editMode?: boolean;
    onChange?: (value: Class) => void | Promise<void>;
    onDelete?: () => void | Promise<void>;
    noValueMessage?: string;
    $displayButtonOnHover?: boolean;
    showParentFieldForCreate?: boolean;
};

const ClassInlineItem: FC<ClassInlineItemProps> = ({
    classObject,
    editMode = false,
    noValueMessage = 'Not defined',
    $displayButtonOnHover = true,
    showParentFieldForCreate = true,
    onDelete,
    onChange,
}) => {
    const { isCurationAllowed } = useAuthentication();
    const classAutocompleteRef = useRef<{ blur: () => void } | null>(null);
    const [isChangingValue, setIsChangingValue] = useState(false);
    const [isSavingChange, setIsSavingChange] = useState(false);
    const [isSavingDelete, setIsSavingDelete] = useState(false);
    const [value, setValue] = useState<Class | OptionType | null | undefined>(classObject);

    useEffect(() => {
        setValue(classObject);
    }, [classObject]);

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        setIsChangingValue(false);
        setIsSavingChange(true);
        if (action === 'select-option' && selected) {
            setValue(selected);
            await onChange?.(selected as unknown as Class);
        } else if (action === 'create-option' && selected) {
            const newClass = (await ConfirmClass({
                label: selected.label,
                showParentField: showParentFieldForCreate,
            })) as { id: string } | null;
            if (newClass) {
                const updated = { ...selected, id: newClass.id };
                setValue(updated);
                await onChange?.(updated as unknown as Class);
            }
            classAutocompleteRef.current?.blur();
        } else if (action === 'clear') {
            setValue(null);
            await onChange?.(null as unknown as Class);
        }
        setIsSavingChange(false);
        setValue(classObject);
    };

    return (
        <div className="group min-h-9 flex items-center w-full">
            {!isChangingValue ? (
                <div className="flex items-center flex-wrap gap-x-2 w-full min-w-0">
                    {isSavingChange && <span className="text-muted">Saving...</span>}
                    {!isSavingChange && classObject && (
                        <Link href={reverse(ROUTES.CLASS, { id: classObject.id })} className="min-w-0 break-words">
                            <DescriptionTooltip id={classObject.id} _class={ENTITIES.CLASS}>
                                {classObject.label}
                            </DescriptionTooltip>
                        </Link>
                    )}
                    {!isSavingChange && !classObject && noValueMessage && <span className="italic text-muted">{noValueMessage}</span>}
                    <span
                        className={
                            $displayButtonOnHover
                                ? 'ml-auto hidden group-hover:inline-flex group-focus-within:inline-flex items-center gap-1'
                                : 'ml-auto inline-flex items-center gap-1'
                        }
                    >
                        {editMode && !isCurationAllowed && (
                            <ActionButton title="Editing requires a curator role" icon={faPen} action={() => {}} isDisabled />
                        )}
                        {classObject && editMode && isCurationAllowed && (
                            <>
                                {onChange && (
                                    <ActionButton
                                        title="Change class"
                                        icon={faPen}
                                        action={() => setIsChangingValue(true)}
                                        isDisabled={isSavingChange}
                                    />
                                )}
                                {onDelete && (
                                    <ActionButton
                                        title="Remove class"
                                        icon={faTrash}
                                        requireConfirmation
                                        confirmationMessage="Are you sure?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: async () => {
                                                    setIsSavingDelete(true);
                                                    await onDelete();
                                                    setIsSavingDelete(false);
                                                },
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                        isDisabled={isSavingDelete}
                                    />
                                )}
                            </>
                        )}
                        {!classObject && editMode && isCurationAllowed && (
                            <ActionButton title="Add class" icon={faPlus} action={() => setIsChangingValue(true)} isDisabled={isSavingChange} />
                        )}
                    </span>
                </div>
            ) : (
                isCurationAllowed && (
                    <div className="flex items-stretch w-full">
                        <div className="flex-1 min-w-0">
                            <Autocomplete
                                entityType={ENTITIES.CLASS}
                                placeholder="Select or create class"
                                onChange={handleClassSelect}
                                value={value as OptionType}
                                openMenuOnFocus
                                allowCreate
                                isClearable={false}
                                // @ts-expect-error innerRef is supported by underlying AsyncPaginate/Creatable
                                innerRef={classAutocompleteRef}
                                inputId="target-class"
                                groupPosition="start"
                            />
                        </div>
                        <ButtonGroup
                            size="md"
                            aria-label="Class edit actions"
                            className="shrink-0 [&>[data-slot='button']:first-child]:rounded-l-none"
                        >
                            <CopyIdButton value={value as SingleValue<OptionType>} />
                            <Button className="button--orkg-secondary" onPress={() => setIsChangingValue(false)}>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </div>
                )
            )}
        </div>
    );
};

export default ClassInlineItem;
