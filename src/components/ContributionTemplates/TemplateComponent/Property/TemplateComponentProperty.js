import React, { useState } from 'react';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { PropertyStyle } from 'components/StatementBrowser/styled';
import { InputGroup } from 'reactstrap';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import TemplateEditorAutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import { predicatesUrl } from 'network';
import classNames from 'classnames';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
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
        <PropertyStyle className={`col-4`} tabIndex="0">
            {props.enableEdit && (
                <DragHandler>
                    <Icon icon={faArrowsAlt} />
                </DragHandler>
            )}
            {!isEditing ? (
                <div className={'propertyLabel'}>
                    {props.property.label}
                    {props.enableEdit && (
                        <div className={propertyOptionsClasses}>
                            <StatementOptionButton title={'Edit property'} icon={faPen} action={() => setIsEditing(true)} />
                            <StatementOptionButton
                                requireConfirmation={true}
                                confirmationMessage={'Are you sure to delete?'}
                                title={'Delete property'}
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
                        <TemplateEditorAutoComplete
                            requestUrl={predicatesUrl}
                            placeholder={isEditing ? 'Select or type to enter a property' : 'No properties'}
                            onItemSelected={(selected, action) => {
                                props.handlePropertiesSelect(selected, action, props.id);
                                setIsEditing(false);
                            }}
                            onKeyUp={() => {}}
                            allowCreate
                            autoFocus
                            value={props.property}
                            cssClasses={'form-control-sm'}
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
    handlePropertiesSelect: PropTypes.func.isRequired
};

export default TemplateComponentProperty;
