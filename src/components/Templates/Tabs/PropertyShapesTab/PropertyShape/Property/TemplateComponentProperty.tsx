import { faCheck, faGripVertical, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { RootStore } from '@/slices/types';

type TemplateComponentPropertyProps = {
    id: number;
    onDragHandleRef: (element: HTMLElement | null) => void;
    handleDeletePropertyShape: (_index: number) => void;
    handlePropertiesSelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
};

const TemplateComponentProperty: FC<TemplateComponentPropertyProps> = ({
    id,
    onDragHandleRef,
    handleDeletePropertyShape,
    handlePropertiesSelect,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const property = useSelector((state: RootStore) => state.templateEditor.properties[id].path);
    const { isEditMode } = useIsEditMode();

    return (
        <div className="basis-full md:basis-5/12 max-md:rounded-t-sm md:rounded-l-sm bg-surface-secondary p-3 flex items-start gap-2 break-words">
            {isEditMode && (
                <div
                    ref={onDragHandleRef}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to reorder property"
                    className="text-muted cursor-move px-1 pt-1"
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </div>
            )}
            <div className="grow min-w-0">
                {!isEditing ? (
                    <div className="flex items-start gap-2 flex-wrap">
                        <div className="font-medium break-words">
                            {property?.id ? (
                                <Link href={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank" className="text-foreground">
                                    <DescriptionTooltip id={property.id} _class={ENTITIES.PREDICATE}>
                                        {property.label}
                                    </DescriptionTooltip>
                                </Link>
                            ) : (
                                property?.label
                            )}
                        </div>
                        {isEditMode && (
                            <div className="inline-flex items-center gap-1 ml-auto shrink-0">
                                <ActionButton title="Edit property" icon={faPen} action={() => setIsEditing(true)} />
                                <ActionButton
                                    title="Delete property"
                                    icon={faTrash}
                                    action={() => handleDeletePropertyShape(id)}
                                    requireConfirmation
                                    confirmationMessage="Are you sure to delete?"
                                    confirmationButtons={[
                                        {
                                            title: 'Delete',
                                            color: 'danger',
                                            icon: faCheck,
                                            action: () => handleDeletePropertyShape(id),
                                        },
                                        {
                                            title: 'Cancel',
                                            color: 'secondary',
                                            icon: faTimes,
                                        },
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <Autocomplete
                        entityType={ENTITIES.PREDICATE}
                        placeholder="Select or type to enter a property"
                        onChange={(selected, action) => {
                            handlePropertiesSelect(selected, action, id);
                            setIsEditing(false);
                        }}
                        value={property}
                        openMenuOnFocus
                        allowCreate
                        size="sm"
                        onBlur={() => {
                            setIsEditing(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TemplateComponentProperty;
