import React, { useState } from 'react';
import { InputGroup } from 'reactstrap';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { PropertyStyle } from 'components/StatementBrowser/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled from 'styled-components';

const DragHandler = styled.div`
    width: 30px;
    float: left;
    padding: 10px;
`;

function TemplateComponentProperty(props) {
    const [disableHover, setDisableHover] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const propertyOptionsClasses = classNames({
        propertyOptions: true,
        disableHover: disableHover
    });

    return (
        <PropertyStyle className="col-4" tabIndex="0">
            {props.enableEdit && (
                <DragHandler ref={props.dragRef}>
                    <Icon icon={faArrowsAlt} />
                </DragHandler>
            )}
            {!isEditing ? (
                <div className="propertyLabel">
                    {props.property.label.charAt(0).toUpperCase() + props.property.label.slice(1)}
                    {props.enableEdit && (
                        <div className={propertyOptionsClasses}>
                            <StatementOptionButton title="Edit property" icon={faPen} action={() => setIsEditing(true)} />
                            <StatementOptionButton
                                requireConfirmation={true}
                                confirmationMessage="Are you sure to delete?"
                                title="Delete property"
                                icon={faTrash}
                                action={() => props.handleDeleteTemplateComponent(props.id)}
                                onVisibilityChange={disable => setDisableHover(disable)}
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
                            value={props.property}
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
    property: PropTypes.object.isRequired,
    handleDeleteTemplateComponent: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    dragRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};

export default TemplateComponentProperty;
