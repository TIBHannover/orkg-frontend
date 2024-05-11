import { faArrowsAlt, faCheck, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Link from 'components/NextJsMigration/Link';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { PropertyStyle } from 'components/StatementBrowser/styled';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { useSelector } from 'react-redux';
import { ActionMeta } from 'react-select';
import { InputGroup } from 'reactstrap';
import { Predicate } from 'services/backend/types';
import styled from 'styled-components';

const DragHandler = styled.div`
    width: 30px;
    float: left;
    padding: 10px;
`;

type TemplateComponentPropertyProps = {
    id: number;
    dragRef: ConnectDragSource;
    handleDeletePropertyShape: (_index: number) => void;
    handlePropertiesSelect: (_selected: Predicate, _action: ActionMeta<Predicate>, _index: number) => void;
};

const TemplateComponentProperty: FC<TemplateComponentPropertyProps> = ({ id, dragRef, handleDeletePropertyShape, handlePropertiesSelect }) => {
    const [isEditing, setIsEditing] = useState(false);
    // @ts-expect-error
    const property = useSelector((state) => state.templateEditor.properties[id].path);
    const { isEditMode } = useIsEditMode();

    return (
        <PropertyStyle className="col-4">
            {isEditMode && (
                <DragHandler ref={dragRef}>
                    <Icon icon={faArrowsAlt} />
                </DragHandler>
            )}
            {!isEditing ? (
                <div className="propertyLabel">
                    {property?.id ? (
                        // @ts-expect-error
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
                            <StatementActionButton title="Edit property" icon={faPen} action={() => setIsEditing(true)} />
                            <StatementActionButton
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
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={isEditing ? 'Select or type to enter a property' : 'No properties'}
                            onChange={(selected: Predicate, action: ActionMeta<Predicate>) => {
                                handlePropertiesSelect(selected, action, id);
                                setIsEditing(false);
                            }}
                            value={property}
                            autoLoadOption
                            openMenuOnFocus
                            allowCreate
                            cssClasses="form-control-sm"
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
