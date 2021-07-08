import { useState, useCallback } from 'react';
import { toggleEditValue } from 'actions/statementBrowser';
import { InputGroup, InputGroupAddon, Button, FormFeedback } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { fetchStatementsForResource } from 'actions/statementBrowser';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import classNames from 'classnames';
import { uniq } from 'lodash';
import format from 'string-format';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import validationSchema from 'components/StatementBrowser/AddValue/helpers/validationSchema';
import InputField from 'components/StatementBrowser/InputField/InputField';
import { getValueClass, isInlineResource as isInlineResourceUtil } from 'components/StatementBrowser/AddValue/helpers/utils';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { useDispatch, useSelector } from 'react-redux';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

export default function ValueItemTemplate(props) {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { resourcesAsLinks, openExistingResourcesInDialog } = statementBrowser;

    let valueClass = getValueClass(props.components);
    valueClass = valueClass ? valueClass : props.predicate?.range ? props.predicate.range : null;
    const isInlineResource = useSelector(state => isInlineResourceUtil(state, valueClass));

    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const { hasLabelFormat, labelFormat } = useSelector(state => {
        // get all template ids
        let templateIds = [];
        const filter_classes = props.value?.classes?.filter(c => c) ?? [];
        for (const c of filter_classes) {
            if (state.statementBrowser?.classes?.[c]) {
                templateIds = templateIds.concat(state.statementBrowser?.classes[c]?.templateIds);
            }
        }
        templateIds = uniq(templateIds);
        // check if it formatted label
        let hasLabelFormat = false;
        let labelFormat = '';
        for (const templateId of templateIds) {
            const template = state.statementBrowser.templates[templateId];
            if (template && template.hasLabelFormat) {
                hasLabelFormat = true;
                labelFormat = template.labelFormat;
            }
        }
        return { hasLabelFormat, labelFormat };
    });

    const resource = useSelector(state => state.statementBrowser.resources.byId[props.value.resourceId]);

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

    const generatedFormattedLabel = labelFormat => {
        const valueObject = {};
        for (const propertyId of resource.propertyIds) {
            const property = properties.byId[propertyId];
            valueObject[property.existingPredicateId] =
                property?.valueIds && property.valueIds.length > 0 ? values.byId[property.valueIds[0]].label : property.label;
        }
        if (Object.keys(valueObject).length > 0) {
            return format(labelFormat, valueObject);
        } else {
            return props.value.label;
        }
    };

    const getLabel = useCallback(() => {
        const existingResourceId = resource ? resource.existingResourceId : false;
        if (props.value.classes) {
            if (!hasLabelFormat) {
                return props.value.label;
            }
            if (existingResourceId && !resource.isFetched && !resource.isFetching && props.value?._class !== ENTITIES.LITERAL) {
                /*
                dispatch(
                    fetchStatementsForResource({
                        resourceId: props.value.resourceId,
                        existingResourceId
                    })
                ).then(() => {
                    return generatedFormattedLabel(labelFormat);
                });
                */
                return generatedFormattedLabel(labelFormat);
            } else {
                return generatedFormattedLabel(labelFormat);
            }
        } else {
            return props.value.label;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource, hasLabelFormat, labelFormat]);

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    {props.resource && !props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && !resourcesAsLinks && (
                        <Button className="p-0 text-left" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value._class === ENTITIES.RESOURCE ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">{getLabel() || <i>No label</i>}</ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{getLabel() || <i>No label</i>}</ValuePlugins>
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

                    {props.resource && props.value._class === ENTITIES.RESOURCE && !props.resource.isFetching && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.RESOURCE, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {!props.resource && props.value._class === ENTITIES.CLASS && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.CLASS, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {!props.resource && props.value._class === ENTITIES.PREDICATE && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.PROPERTY, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {props.resource && props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && 'Loading...'}

                    {props.value._class === ENTITIES.LITERAL && (
                        <div className="literalLabel">
                            <ValuePlugins type={ENTITIES.LITERAL}>{props.value.label || <i>No label</i>}</ValuePlugins>
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
    predicate: PropTypes.object,
    components: PropTypes.array.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired
};
