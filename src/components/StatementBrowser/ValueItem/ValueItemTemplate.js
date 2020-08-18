import React, { useState } from 'react';
import { InputGroup, InputGroupAddon, Button, FormFeedback } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import classNames from 'classnames';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import validationSchema from 'components/StatementBrowser/AddValue/helpers/validationSchema';
import InputField from 'components/StatementBrowser/InputField/InputField';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { CLASSES } from 'constants/graphSettings';

export default function ValueItemTemplate(props) {
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    const valueOptionClasses = classNames({
        valueOptions: true,
        disableHover: disableHover
    });

    const validateValue = () => {
        if (props.valueClass && ['Date', 'Number', 'String'].includes(props.valueClass.id)) {
            const schema = validationSchema(props.components[0]);
            const { error, value } = schema.validate(draftLabel);
            if (error) {
                setFormFeedback(error.message);
                setIsValid(false);
                return false;
            } else {
                setDraftLabel(value);
                setFormFeedback(null);
                return value;
            }
        } else {
            setFormFeedback(null);
            return draftLabel;
        }
    };

    const onSubmit = () => {
        const validatedValue = validateValue();
        if (validatedValue !== false) {
            props.commitChangeLabel(draftLabel);
            props.toggleEditValue({ id: props.id });
        }
    };

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    {props.resource && !props.resource.isFetching && props.value.type === 'object' && !props.resourcesAsLinks && (
                        <Button className="p-0 text-left" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value.type === 'object' ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">{props.getLabel() || ''}</ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{props.getLabel() || ''}</ValuePlugins>
                            )}

                            {props.resource && props.resource.existingResourceId && props.openExistingResourcesInDialog ? (
                                <span>
                                    {' '}
                                    <Icon icon={faExternalLinkAlt} />
                                </span>
                            ) : (
                                ''
                            )}
                        </Button>
                    )}

                    {props.resource && props.value.type === 'object' && !props.resource.isFetching && props.resourcesAsLinks && (
                        <Link to={reverse(ROUTES.RESOURCE, { id: props.value.resourceId })}>{props.value.label}</Link>
                    )}

                    {!props.resource && props.value.type === 'class' && props.resourcesAsLinks && (
                        <Link to={reverse(ROUTES.CLASS, { id: props.value.resourceId })}>{props.value.label}</Link>
                    )}

                    {!props.resource && props.value.type === 'predicate' && props.resourcesAsLinks && (
                        <Link to={reverse(ROUTES.PREDICATE, { id: props.value.resourceId })}>{props.value.label}</Link>
                    )}

                    {props.resource && props.resource.isFetching && props.value.type === 'object' && 'Loading...'}

                    {props.value.type === 'literal' && (
                        <div className="literalLabel">
                            <ValuePlugins type="literal">{props.value.label}</ValuePlugins>
                        </div>
                    )}

                    <div className={valueOptionClasses}>
                        {!props.value.isEditing && props.value.classes && props.value.classes.includes(CLASSES.QB_DATASET_CLASS) && (
                            <StatementOptionButton title="Visualize data in tabular form" icon={faTable} action={props.handleDatasetClick} />
                        )}

                        {props.enableEdit && (
                            <>
                                {((props.resource && !props.resource.existingResourceId) || props.value.shared <= 1) && (
                                    <StatementOptionButton
                                        title="Edit value"
                                        icon={faPen}
                                        action={props.isInlineResource ? props.handleOnClick : () => props.toggleEditValue({ id: props.id })}
                                    />
                                )}

                                {props.resource && props.resource.existingResourceId && props.value.shared > 1 && (
                                    <StatementOptionButton
                                        title="A shared resource cannot be edited directly"
                                        icon={faPen}
                                        action={() => null}
                                        onVisibilityChange={disable => setDisableHover(disable)}
                                    />
                                )}

                                <StatementOptionButton
                                    requireConfirmation={true}
                                    title="Delete value"
                                    confirmationMessage="Are you sure to delete?"
                                    icon={faTrash}
                                    action={props.handleDeleteValue}
                                    onVisibilityChange={disable => setDisableHover(disable)}
                                />
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <InputGroup size="sm">
                        <InputField
                            components={props.components}
                            valueClass={props.valueClass}
                            inputValue={draftLabel}
                            setInputValue={setDraftLabel}
                            onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                            onBlur={() => onSubmit()}
                            isValid={isValid}
                        />
                        <InputGroupAddon addonType="append">
                            <StyledButton outline onClick={() => onSubmit()}>
                                Done
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {!isValid && <FormFeedback className="d-block">{formFeedback}</FormFeedback>}
                </div>
            )}
        </ValueItemStyle>
    );
}

ValueItemTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    isProperty: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    resource: PropTypes.object,
    handleOnClick: PropTypes.func,
    inline: PropTypes.bool.isRequired,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func.isRequired,
    getLabel: PropTypes.func.isRequired,
    predicate: PropTypes.object.isRequired,

    components: PropTypes.array.isRequired,
    valueClass: PropTypes.object,
    isInlineResource: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),

    handleChangeResource: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired,
    resourcesAsLinks: PropTypes.bool.isRequired
};
