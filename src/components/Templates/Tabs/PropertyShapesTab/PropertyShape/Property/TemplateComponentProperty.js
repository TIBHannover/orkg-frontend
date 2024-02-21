import { faArrowsAlt, faCheck, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Link from 'components/NextJsMigration/Link';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { PropertyStyle } from 'components/StatementBrowser/styled';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { InputGroup } from 'reactstrap';
import styled from 'styled-components';

const DragHandler = styled.div`
    width: 30px;
    float: left;
    padding: 10px;
`;

function TemplateComponentProperty(props) {
    const [isEditing, setIsEditing] = useState(false);
    const property = useSelector(state => state.templateEditor.propertyShapes[props.id].property);
    const { isEditMode } = useIsEditMode();

    return (
        <PropertyStyle className="col-4" tabIndex="0">
            {isEditMode && (
                <DragHandler ref={props.dragRef}>
                    <Icon icon={faArrowsAlt} />
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
                            <StatementActionButton title="Edit property" icon={faPen} action={() => setIsEditing(true)} />
                            <StatementActionButton
                                title="Delete property"
                                icon={faTrash}
                                action={() => props.handleDeletePropertyShape(props.id)}
                                requireConfirmation={true}
                                confirmationMessage="Are you sure to delete?"
                                confirmationButtons={[
                                    {
                                        title: 'Delete',
                                        color: 'danger',
                                        icon: faCheck,
                                        action: () => props.handleDeletePropertyShape(props.id),
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
                            onChange={(selected, action) => {
                                props.handlePropertiesSelect(selected, action, props.id);
                                setIsEditing(false);
                            }}
                            value={property}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
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
}

TemplateComponentProperty.propTypes = {
    id: PropTypes.number.isRequired,
    handleDeletePropertyShape: PropTypes.func.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    dragRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default TemplateComponentProperty;
