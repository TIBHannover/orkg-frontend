import React, { useState } from 'react';
import { Input, InputGroup, InputGroupAddon, Button, FormFeedback } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import classNames from 'classnames';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import validationSchema from 'components/StatementBrowser/AddValue/helpers/validationSchema';
import PropTypes from 'prop-types';

export default function ValueItemTemplate(props) {
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    const valueOptionClasses = classNames({
        valueOptions: true,
        disableHover: disableHover
    });

    //const isLiteral = props.predicate.templateClass && defaultDatatypes.map(t => t.id).includes(props.predicate.templateClass.id) ? true : false;
    const isTyped =
        props.typeComponents && props.typeComponents.length > 0 && props.typeComponents[0].value && props.typeComponents[0].value.id ? true : false;
    // get value type (valueClassType == templateClass)

    const valueClassType =
        props.typeComponents && props.typeComponents.length > 0 && props.typeComponents[0].value && props.typeComponents[0].value.id
            ? props.typeComponents[0].value
            : null;

    let inputFormType = 'text';
    if (isTyped) {
        switch (valueClassType.id) {
            case 'Date':
                inputFormType = 'date';
                break;
            default:
                inputFormType = 'text';
                break;
        }
    }

    const validateValue = () => {
        if (valueClassType && ['Date', 'Number', 'String'].includes(valueClassType.id)) {
            const schema = validationSchema(props.typeComponents[0]);
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
                    {props.resource && !props.resource.isFetching && props.value.type === 'object' && (
                        <Button className="p-0 text-left" color="link" onClick={props.handleOnClick}>
                            {props.showHelp && props.value.type === 'object' ? (
                                <Pulse content={'Click on the resource to browse it'}>
                                    <ValuePlugins type={'resource'}>{props.value.label}</ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type={'resource'}>{props.getLabel()}</ValuePlugins>
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
                    {props.resource && props.resource.isFetching && props.value.type === 'object' && 'Loading...'}
                    {props.value.type === 'literal' && (
                        <div className={'literalLabel'}>
                            <ValuePlugins type={'literal'}>{props.value.label}</ValuePlugins>
                        </div>
                    )}

                    <div className={valueOptionClasses}>
                        {!props.value.isEditing && props.value.classes && props.value.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                            <StatementOptionButton title={'Visualize data in tabular form'} icon={faTable} action={props.handleDatasetClick} />
                        )}

                        {props.enableEdit && (
                            <>
                                {((props.resource && !props.resource.existingResourceId) || props.value.shared <= 1) && (
                                    <StatementOptionButton title={'Edit value'} icon={faPen} action={() => props.toggleEditValue({ id: props.id })} />
                                )}

                                {props.resource && props.resource.existingResourceId && props.value.shared > 1 && (
                                    <StatementOptionButton
                                        title={'A shared resource cannot be edited directly'}
                                        icon={faPen}
                                        action={() => null}
                                        onVisibilityChange={disable => setDisableHover(disable)}
                                    />
                                )}

                                <StatementOptionButton
                                    requireConfirmation={true}
                                    title={'Delete value'}
                                    confirmationMessage={'Are you sure to delete?'}
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
                        <Input
                            bsSize="sm"
                            type={inputFormType}
                            value={draftLabel}
                            invalid={!isValid}
                            onChange={e => setDraftLabel(e.target.value)}
                            onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                            onBlur={() => onSubmit()}
                            autoFocus
                        />
                        <InputGroupAddon addonType="append">
                            <StyledButton outline onClick={() => onSubmit()}>
                                Done
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                    {!isValid && <FormFeedback className={'d-block'}>{formFeedback}</FormFeedback>}
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

    typeComponents: PropTypes.array.isRequired,

    handleChangeResource: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired
};
