import React, { useState } from 'react';
import { Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import { StyledButton, ValueItemStyle } from 'components/AddPaper/Contributions/styled';
import Pulse from 'components/Utils/Pulse';
import classNames from 'classnames';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import PropTypes from 'prop-types';

export default function ValueItemTemplate(props) {
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const valueOptionClasses = classNames({
        valueOptions: true,
        disableHover: disableHover
    });

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    <div className={`${props.value.type === 'literal' ? 'literalLabel' : 'objectLabel'}`} onClick={props.hundleOnClick}>
                        {props.showHelp && props.value.type === 'object' ? (
                            <Pulse content={'Click on the resource to browse it'}>
                                <ValuePlugins type={props.value.type === 'object' ? 'resource' : 'literal'}>{props.value.label}</ValuePlugins>
                            </Pulse>
                        ) : (
                            <ValuePlugins type={props.value.type === 'object' ? 'resource' : 'literal'}>{props.value.label}</ValuePlugins>
                        )}

                        {props.resource && props.resource.existingResourceId && props.openExistingResourcesInDialog ? (
                            <span>
                                {' '}
                                <Icon icon={faExternalLinkAlt} />
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className={valueOptionClasses}>
                        {!props.value.isEditing && props.value.classes && props.value.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                            <TemplateOptionButton title={'Visualize data in tabular form'} icon={faTable} action={props.handleDatasetClick} />
                        )}
                        {((props.resource && !props.resource.existingResourceId) || props.value.shared <= 1) && (
                            <TemplateOptionButton title={'Edit value'} icon={faPen} action={() => props.toggleEditValue({ id: props.id })} />
                        )}

                        {props.resource && props.resource.existingResourceId && props.value.shared > 1 && (
                            <TemplateOptionButton
                                title={'A shared resource cannot be edited directly'}
                                icon={faPen}
                                action={() => null}
                                onVisibilityChange={() => setDisableHover(!disableHover)}
                            />
                        )}

                        <TemplateOptionButton
                            requireConfirmation={true}
                            title={'Delete value'}
                            confirmationMessage={'Are you sure to delete?'}
                            icon={faTrash}
                            action={props.handleDeleteValue}
                            onVisibilityChange={() => setDisableHover(!disableHover)}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <InputGroup size="sm">
                        <Input
                            bsSize="sm"
                            value={draftLabel}
                            onChange={e => setDraftLabel(e.target.value)}
                            onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                            onBlur={e => {
                                props.commitChangeLabel(draftLabel);
                                props.toggleEditValue({ id: props.id });
                            }}
                            autoFocus
                        />
                        <InputGroupAddon addonType="append">
                            <StyledButton
                                outline
                                onClick={e => {
                                    props.commitChangeLabel(draftLabel);
                                    props.toggleEditValue({ id: props.id });
                                }}
                            >
                                Done
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            )}
        </ValueItemStyle>
    );
}

ValueItemTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    isProperty: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    hundleOnClick: PropTypes.func.isRequired,
    inline: PropTypes.bool.isRequired,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func.isRequired,

    handleChangeResource: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    commitChangeLiteral: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired,

    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired
};
