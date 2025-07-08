import { faCheck, faGripVertical, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';
import { InputGroup } from 'reactstrap';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { PropertyStyle } from '@/components/StatementBrowser/styled';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const DragHandler = styled.div`
    width: 30px;
    float: left;
    padding: 10px;
    cursor: move;
    color: #a5a5a5;
`;

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
    // @ts-expect-error
    const property = useSelector((state) => state.templateEditor.properties[id].path);
    const { isEditMode } = useIsEditMode();

    return (
        <PropertyStyle className="col-4">
            {isEditMode && (
                <DragHandler ref={onDragHandleRef} role="button" tabIndex={0} aria-label="Drag to reorder property">
                    <FontAwesomeIcon icon={faGripVertical} />
                </DragHandler>
            )}
            {!isEditing ? (
                <div className="propertyLabel">
                    {property?.id ? (
                        <Link href={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank" className="text-dark">
                            <DescriptionTooltip id={property.id} _class={ENTITIES.PREDICATE}>
                                {property.label}
                            </DescriptionTooltip>
                        </Link>
                    ) : (
                        property?.label
                    )}

                    {isEditMode && (
                        <div className="propertyOptions">
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
                <div>
                    <InputGroup size="sm">
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={isEditing ? 'Select or type to enter a property' : 'No properties'}
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
                    </InputGroup>
                </div>
            )}
        </PropertyStyle>
    );
};

export default TemplateComponentProperty;
