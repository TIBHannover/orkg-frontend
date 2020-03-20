import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl } from 'network';
import { Input, InputGroup, InputGroupAddon, DropdownMenu, InputGroupButtonDropdown } from 'reactstrap';
import { StyledDropdownItem, StyledButton, StyledDropdownToggle, ValueItemStyle } from 'components/AddPaper/Contributions/styled';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import useTogggle from './helpers/useToggle';
import PropTypes from 'prop-types';

export default function AddvalueTemplate(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    const [valueType, setValueType] = useState('object');
    const [inputValue, setInputValue] = useState('');
    const [dropdownValueTypeOpen, setDropdownValueTypeOpen] = useTogggle(false);
    const [showAddValue, setShowAddValue] = useTogggle(false);

    useEffect(() => {
        if (valueType === 'literal') {
            literalInputRef.current.focus();
        } else if (resourceInputRef.current && (valueType === 'object' || valueType === 'property')) {
            resourceInputRef.current.focus();
        }
    }, [valueType]);

    useEffect(() => {
        setValueType('object');
        if (!showAddValue) {
            setInputValue('');
        }
    }, [showAddValue]);

    /* Select component reference can be used to check if menu is opened */
    const isMenuOpen = () => {
        return resourceInputRef.current.select.state.menuIsOpen && resourceInputRef.current.state.loadedOptions.length > 0;
    };

    return (
        <ValueItemStyle className={showAddValue ? 'editingLabel' : ''}>
            {!showAddValue ? (
                <TemplateOptionButton title={'Add value'} icon={faPlus} action={() => setShowAddValue(true)} />
            ) : (
                <div>
                    <InputGroup size="sm">
                        <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownValueTypeOpen} toggle={setDropdownValueTypeOpen}>
                            <StyledDropdownToggle>
                                <small>{valueType.charAt(0).toUpperCase() + valueType.slice(1) + ' '}</small>
                                <Icon size="xs" icon={faBars} />
                            </StyledDropdownToggle>
                            <DropdownMenu>
                                <StyledDropdownItem onClick={() => setValueType('object')}>
                                    <Tippy content="Choose object to link this to an object, which can contain values on its own">
                                        <span>Object</span>
                                    </Tippy>
                                </StyledDropdownItem>
                                <StyledDropdownItem onClick={() => setValueType('literal')}>
                                    <Tippy content="Choose literal for values like numbers or plain text">
                                        <span>Literal</span>
                                    </Tippy>
                                </StyledDropdownItem>
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                        {valueType === 'object' ? (
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                optionsClass={props.predicate.templateClass ? props.predicate.templateClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    props.handleValueSelect(valueType, i);
                                    setShowAddValue(false);
                                }}
                                onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                                value={inputValue}
                                additionalData={props.newResources}
                                disableBorderRadiusRight
                                disableBorderRadiusLeft
                                cssClasses={'form-control-sm'}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13 && !isMenuOpen()) {
                                        props.handleAddValue(valueType, inputValue);
                                        setShowAddValue(false);
                                    }
                                }}
                                innerRef={ref => (resourceInputRef.current = ref)}
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                bsSize="sm"
                                value={inputValue}
                                onChange={(e, value) => setInputValue(e ? e.target.value : value)}
                                innerRef={literalInputRef}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        setShowAddValue(false);
                                    } else if (e.keyCode === 13) {
                                        props.handleAddValue(valueType, inputValue);
                                        setShowAddValue(false);
                                    }
                                }}
                            />
                        )}

                        <InputGroupAddon addonType="append">
                            <StyledButton outline onClick={() => setShowAddValue(false)}>
                                Cancel
                            </StyledButton>
                            <StyledButton
                                outline
                                onClick={() => {
                                    setShowAddValue(false);
                                    props.handleAddValue(valueType, inputValue);
                                }}
                            >
                                Create
                            </StyledButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            )}
        </ValueItemStyle>
    );
}

AddvalueTemplate.propTypes = {
    predicate: PropTypes.object.isRequired,
    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired
};
