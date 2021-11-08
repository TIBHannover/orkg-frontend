import { useState, useCallback, useEffect, useRef } from 'react';
import { toggleEditValue } from 'actions/statementBrowser';
import { InputGroup, InputGroupAddon, Button, FormFeedback, Badge } from 'reactstrap';
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
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import { getConfigByType, getSuggestionByTypeAndValue } from 'constants/DataTypes';
import Tippy from '@tippyjs/react';
import { useDispatch, useSelector } from 'react-redux';
import { CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import ConfirmConversionTooltip from 'components/StatementBrowser/ConfirmConversionTooltip/ConfirmConversionTooltip';
import PropTypes from 'prop-types';
import Joi from 'joi';

export default function ValueItemTemplate(props) {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { resourcesAsLinks, openExistingResourcesInDialog } = statementBrowser;

    let valueClass = getValueClass(props.components);
    valueClass = valueClass ? valueClass : props.predicate?.range ? props.predicate.range : null;
    const isInlineResource = useSelector(state => isInlineResourceUtil(state, valueClass));

    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);

    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const { hasLabelFormat, labelFormat } = useSelector(state => {
        // get all template ids
        let templateIds = [];
        for (const c of props.value.classes) {
            if (state.statementBrowser.classes[c]) {
                templateIds = templateIds.concat(state.statementBrowser.classes[c].templateIds);
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
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);
    const [draftDataType, setDraftDataType] = useState(props.value.type === 'literal' ? props.value.datatype : 'object');
    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    const valueOptionClasses = classNames({
        valueOptions: true,
        disableHover: disableHover
    });

    const getSchema = () => {
        if (valueClass && ['Date', 'Number', 'String', 'Boolean', 'Integer', 'URI'].includes(valueClass.id)) {
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
            return schema;
        } else if (props.value.type === 'literal') {
            const config = getConfigByType(draftDataType);
            return config.schema;
        }
        return Joi.string();
    };

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = dt => {
        if (valueClass && props.value.type === ENTITIES.LITERAL) {
            switch (valueClass.id) {
                case 'String':
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Integer':
                    return 'xsd:integer';
                case 'Date':
                    return 'xsd:date';
                case 'Boolean':
                    return 'xsd:boolean';
                case 'URI':
                    return 'xsd:anyURI';
                default:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return getConfigByType(dt).type;
        }
    };

    const onSubmit = () => {
        const { error } = getSchema().validate(draftLabel);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            // setDraftLabel(value);
            setFormFeedback(null);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(draftDataType, draftLabel);
            if (suggestions.length > 0 && !valueClass) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                props.commitChangeLabel(draftLabel, getDataType(draftDataType));
                dispatch(toggleEditValue({ id: props.id }));
            }
        }
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        props.commitChangeLabel(draftLabel, suggestionType.type);
        setDraftDataType(suggestionType.type);
        dispatch(toggleEditValue({ id: props.id }));
    };

    const rejectSuggestion = () => {
        props.commitChangeLabel(draftLabel, getDataType(draftDataType));
        dispatch(toggleEditValue({ id: props.id }));
    };

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        if (draftDataType === 'xsd:boolean') {
            setDraftLabel(v => Boolean(v === 'true').toString());
        }
    }, [draftDataType]);

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
            if (existingResourceId && !resource.isFetched && !resource.isFetching && props.value.type !== 'literal') {
                return dispatch(
                    fetchStatementsForResource({
                        resourceId: props.value.resourceId,
                        existingResourceId
                    })
                ).then(() => {
                    return generatedFormattedLabel(labelFormat);
                });
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
                    {props.resource && !props.resource.isFetching && props.value.type === 'object' && !resourcesAsLinks && (
                        <Button className="p-0 text-left" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value.type === 'object' ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">{getLabel() !== '' ? getLabel().toString() : <i>No label</i>}</ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{getLabel() !== '' ? getLabel().toString() : <i>No label</i>}</ValuePlugins>
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
                        <Link to={reverse(ROUTES.RESOURCE, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {!props.resource && props.value.type === 'class' && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.CLASS, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {!props.resource && props.value.type === 'predicate' && resourcesAsLinks && (
                        <Link to={reverse(ROUTES.PROPERTY, { id: props.value.resourceId })}>{props.value.label || <i>No label</i>}</Link>
                    )}

                    {props.resource && props.resource.isFetching && props.value.type === 'object' && 'Loading...'}

                    {props.value.type === 'literal' && (
                        <div className="literalLabel">
                            <ValuePlugins type="literal">{props.value.label !== '' ? props.value.label.toString() : <i>No label</i>}</ValuePlugins>
                            {isCurationAllowed && (
                                <small>
                                    <Badge color="light" className="ml-2">
                                        {props.value.datatype}
                                    </Badge>
                                </small>
                            )}
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
                    <InputGroup size="sm " className="d-flex">
                        {!valueClass && props.value.type === ENTITIES.LITERAL && (
                            <DatatypeSelector entity={props.value.type} valueType={draftDataType} setValueType={setDraftDataType} />
                        )}
                        <InputField
                            valueClass={valueClass}
                            inputValue={draftLabel}
                            setInputValue={setDraftLabel}
                            inputDataType={draftDataType}
                            onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                            //onBlur={() => onSubmit()}
                            isValid={isValid}
                        />
                        <InputGroupAddon addonType="append">
                            <StyledButton outline onClick={() => onSubmit()}>
                                <Tippy
                                    onCreate={instance => (confirmConversion.current = instance)}
                                    content={
                                        <ConfirmConversionTooltip
                                            rejectSuggestion={rejectSuggestion}
                                            acceptSuggestion={acceptSuggestion}
                                            suggestionType={suggestionType}
                                        />
                                    }
                                    interactive={true}
                                    trigger="manual"
                                    placement="top"
                                >
                                    <span>Done</span>
                                </Tippy>
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
