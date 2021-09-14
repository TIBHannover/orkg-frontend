import { useState, useEffect, useRef } from 'react';
import { toggleEditValue } from 'actions/statementBrowser';
import { InputGroup, InputGroupAddon, Button, FormFeedback, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { StyledButton, ValueItemStyle } from 'components/StatementBrowser/styled';
import Pulse from 'components/Utils/Pulse';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import InputField from 'components/StatementBrowser/InputField/InputField';
import { Link } from 'react-router-dom';
import DatatypeSelector from 'components/StatementBrowser/DatatypeSelector/DatatypeSelector';
import { getSuggestionByTypeAndValue } from 'constants/DataTypes';
import Tippy from '@tippyjs/react';
import { useDispatch, useSelector } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';
import ConfirmConversionTooltip from 'components/StatementBrowser/ConfirmConversionTooltip/ConfirmConversionTooltip';
import PropTypes from 'prop-types';
import { getResourceLink } from 'utils';
import ValueItemOptions from './ValueItemOptions/ValueItemOptions';

export default function ValueItemView(props) {
    const dispatch = useDispatch();
    const resourcesAsLinks = useSelector(state => state.statementBrowser.resourcesAsLinks);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);

    const confirmConversion = useRef(null);
    const [suggestionType, setSuggestionType] = useState(null);

    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const [isValid, setIsValid] = useState(true);
    const [formFeedback, setFormFeedback] = useState(null);

    const onSubmit = () => {
        const { error } = props.schema.validate(props.draftLabel);
        if (error) {
            setFormFeedback(error.message);
            setIsValid(false);
        } else {
            // setDraftLabel(value);
            setFormFeedback(null);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(props.draftDataType, props.draftLabel);
            if (suggestions.length > 0 && !props.valueClass) {
                setSuggestionType(suggestions[0]);
                confirmConversion.current.show();
            } else {
                props.commitChangeLabel(props.draftLabel, props.getDataType(props.draftDataType));
                dispatch(toggleEditValue({ id: props.id }));
            }
        }
    };

    const acceptSuggestion = () => {
        confirmConversion.current.hide();
        props.commitChangeLabel(props.draftLabel, suggestionType.type);
        props.setDraftDataType(suggestionType.type);
        dispatch(toggleEditValue({ id: props.id }));
    };

    const rejectSuggestion = () => {
        props.commitChangeLabel(props.draftLabel, props.getDataType(props.draftDataType));
        dispatch(toggleEditValue({ id: props.id }));
    };

    useEffect(() => {
        setFormFeedback(null);
        setIsValid(true);
        if (props.draftDataType === 'xsd:boolean') {
            props.setDraftLabel(v => Boolean(v).toString());
        }
    }, [props, props.draftDataType]);

    return (
        <ValueItemStyle>
            {!props.value.isEditing ? (
                <div>
                    {props.resource && !props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && !resourcesAsLinks && (
                        <Button className="p-0 text-left objectLabel" color="link" onClick={props.handleOnClick} style={{ userSelect: 'text' }}>
                            {props.showHelp && props.value._class === ENTITIES.RESOURCE ? (
                                <Pulse content="Click on the resource to browse it">
                                    <ValuePlugins type="resource">
                                        {props.getLabel() !== '' ? props.getLabel().toString() : <i>No label</i>}
                                    </ValuePlugins>
                                </Pulse>
                            ) : (
                                <ValuePlugins type="resource">{props.getLabel() !== '' ? props.getLabel().toString() : <i>No label</i>}</ValuePlugins>
                            )}
                            {props.resource && props.resource.existingResourceId && openExistingResourcesInDialog && (
                                <span>
                                    {' '}
                                    <Icon icon={faExternalLinkAlt} />
                                </span>
                            )}
                        </Button>
                    )}

                    {props.resource && props.value._class !== ENTITIES.LITERAL && resourcesAsLinks && (
                        <Link className="objectLabel" to={getResourceLink(props.value._class, props.value.resourceId)}>
                            {props.value.label || <i>No label</i>}
                        </Link>
                    )}

                    {props.resource && props.resource.isFetching && props.value._class === ENTITIES.RESOURCE && 'Loading...'}

                    {props.value._class === ENTITIES.LITERAL && (
                        <div className="literalLabel">
                            <ValuePlugins type={ENTITIES.LITERAL}>
                                {props.value.label !== '' ? props.value.label.toString() : <i>No label</i>}
                            </ValuePlugins>
                            {isCurationAllowed && (
                                <small>
                                    <Badge color="light" className="ml-2">
                                        {props.value.datatype}
                                    </Badge>
                                </small>
                            )}
                        </div>
                    )}

                    <ValueItemOptions
                        id={props.id}
                        enableEdit={props.enableEdit}
                        syncBackend={props.syncBackend}
                        handleOnClick={props.handleOnClick}
                    />
                </div>
            ) : (
                <div>
                    <InputGroup size="sm " className="d-flex">
                        {!props.valueClass && props.value.type === ENTITIES.LITERAL && (
                            <DatatypeSelector entity={props.value.type} valueType={props.draftDataType} setValueType={props.setDraftDataType} />
                        )}
                        <InputField
                            valueClass={props.valueClass}
                            inputValue={props.draftLabel}
                            setInputValue={props.setDraftLabel}
                            inputDataType={props.draftDataType}
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

ValueItemView.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    resource: PropTypes.object,
    handleOnClick: PropTypes.func,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    predicate: PropTypes.object,
    commitChangeLabel: PropTypes.func.isRequired,
    getLabel: PropTypes.func.isRequired,
    schema: PropTypes.object,
    getDataType: PropTypes.func,
    draftLabel: PropTypes.string.isRequired,
    draftDataType: PropTypes.string.isRequired,
    setDraftLabel: PropTypes.func,
    setDraftDataType: PropTypes.func,
    valueClass: PropTypes.object,
    isInlineResource: PropTypes.bool
};
