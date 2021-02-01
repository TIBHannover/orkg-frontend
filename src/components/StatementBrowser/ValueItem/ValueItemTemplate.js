import { useState } from 'react';
import { toggleEditValue } from 'actions/statementBrowser';
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
import { getValueClass, isInlineResource as isInlineResourceUtil } from 'components/StatementBrowser/AddValue/helpers/utils';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { useDispatch, useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

export default function ValueItemTemplate(props) {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { resourcesAsLinks, openExistingResourcesInDialog } = statementBrowser;

    let valueClass = getValueClass(props.components);
    valueClass = valueClass ? valueClass : props.predicate.range ? props.predicate.range : null;
    const isInlineResource = useSelector(state => isInlineResourceUtil(state, valueClass));

    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    const valueOptionClasses = classNames({
        valueOptions: true,
        disableHover: disableHover
    });

    const validateValue = () => {
        if (valueClass && ['Date', 'Number', 'String'].includes(valueClass.id)) {
            let component;
            if (props.components && props.components.length > 0) {
                component = props.components[0];
            }
            if (!component) {
                component = {
                    value: valueClass,
                    property: { id: props.predicate.id, label: props.predicate.label },
                    validationRules: props.predicate.validationRules
                };
            }
            const schema = validationSchema(component);
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
            dispatch(toggleEditValue({ id: props.id }));
        }
    };

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    {props.resource && !props.resource.isFetching && props.value.type === 'object' && !resourcesAsLinks && (
                        <Button className="p-0 text-left" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value.type === 'object' ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">{props.getLabel() || ''}</ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{props.getLabel() || ''}</ValuePlugins>
                            )}

                            {props.resource && props.resource.existingResourceId && openExistingResourcesInDialog ? (
                                <span>
                                    {' '}
                                    <Icon icon={faExternalLinkAlt} />
                                </span>
                            ) : (
                                ''
                            )}
                        </Button>
                    )}

                    {props.resource && props.value.type === 'object' && !props.resource.isFetching && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.RESOURCE, { id: props.value.resourceId })}>{props.value.label}</Link>
                    )}

                    {!props.resource && props.value.type === 'class' && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.CLASS, { id: props.value.resourceId })}>{props.value.label}</Link>
                    )}

                    {!props.resource && props.value.type === 'predicate' && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.PROPERTY, { id: props.value.resourceId })}>{props.value.label}</Link>
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
                                        action={isInlineResource ? props.handleOnClick : () => dispatch(toggleEditValue({ id: props.id }))}
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
                            valueClass={valueClass}
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
    value: PropTypes.object.isRequired,
    resource: PropTypes.object,
    handleOnClick: PropTypes.func,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    getLabel: PropTypes.func.isRequired,
    predicate: PropTypes.object.isRequired,
    components: PropTypes.array.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired
};
