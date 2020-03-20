import React, { useState, useRef, useEffect } from 'react';
import { resourcesUrl, predicatesUrl } from 'network';
import { Input, InputGroup, InputGroupAddon, Button, DropdownToggle, DropdownMenu, InputGroupButtonDropdown } from 'reactstrap';
import { StyledValueItem, StyledDropdownItem } from 'components/AddPaper/Contributions/styled';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import Tooltip from 'components/Utils/Tooltip';
import useTogggle from './helpers/useToggle';
import PropTypes from 'prop-types';

export default function AddValueSB(props) {
    const literalInputRef = useRef(null);
    const resourceInputRef = useRef(null);

    const [valueType, setValueType] = useState(!props.isProperty ? 'object' : 'property');
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
        <StyledValueItem>
            {showAddValue ? (
                <InputGroup>
                    {!props.isProperty && (
                        <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownValueTypeOpen} toggle={setDropdownValueTypeOpen}>
                            <DropdownToggle caret color="primary" className={'valueTypeDropdown'}>
                                {valueType.charAt(0).toUpperCase() + valueType.slice(1)}
                            </DropdownToggle>
                            <DropdownMenu>
                                <StyledDropdownItem onClick={() => setValueType('object')}>
                                    <Tooltip message="Choose object to link this to an object, which can contain values on its own">Object</Tooltip>
                                </StyledDropdownItem>
                                <StyledDropdownItem onClick={() => setValueType('literal')}>
                                    <Tooltip message="Choose literal for values like numbers or plain text">Literal</Tooltip>
                                </StyledDropdownItem>
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                    )}

                    {valueType === 'object' ? (
                        <AutoComplete
                            requestUrl={!props.isProperty ? resourcesUrl : predicatesUrl}
                            excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
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
                        <Button color="light" className={'valueActionButton'} onClick={() => setShowAddValue(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="light"
                            className={'valueActionButton'}
                            onClick={() => {
                                setShowAddValue(false);
                                props.handleAddValue(valueType, inputValue);
                            }}
                        >
                            Create
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            ) : (
                <span className="btn btn-link p-0" onClick={() => setShowAddValue(true)}>
                    + Add value
                </span>
            )}
        </StyledValueItem>
    );
}

AddValueSB.propTypes = {
    isProperty: PropTypes.bool.isRequired,
    handleValueSelect: PropTypes.func.isRequired,
    newResources: PropTypes.array.isRequired,
    handleAddValue: PropTypes.func.isRequired
};
