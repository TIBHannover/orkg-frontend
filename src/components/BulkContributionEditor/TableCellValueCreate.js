import { faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StyledDropdownItem, StyledDropdownToggle } from 'components/StatementBrowser/styled';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { DropdownMenu, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import styled from 'styled-components';

const CreateButtonContainer = styled.div`
    position: absolute;
    bottom: -13px;
    left: 50%;
    margin-left: -15px;
    z-index: 1;
`;

const TableCellValueCreate = ({ isVisible }) => {
    const [value, setValue] = useState('');
    const [type, setType] = useState('resource');
    const [isAdding, setIsAdding] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const refContainer = useRef(null);

    useClickAway(refContainer, () => {
        if (isAdding) {
            setIsAdding(false);
        }
    });

    return (
        <>
            {!isAdding && isVisible && (
                <div className="position-relative">
                    <CreateButtonContainer>
                        <StatementOptionButton title="Add value" icon={faPlus} action={() => setIsAdding(true)} />
                    </CreateButtonContainer>
                </div>
            )}
            {isAdding && (
                <div ref={refContainer} style={{ height: 35 }}>
                    <InputGroup size="sm" style={{ position: 'absolute', width: 295 }}>
                        {type === 'resource' ? (
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                                //optionsClass={props.valueClass ? props.valueClass.id : undefined}
                                placeholder="Enter a resource"
                                onItemSelected={i => {
                                    //props.handleValueSelect(valueType, i);
                                    //setShowAddValue(false);
                                }}
                                onInput={(e, value) => setValue(e ? e.target.value : value)}
                                value={value}
                                //onBlur={() => setIsAdding(false)}
                                //additionalData={props.newResources}
                                //autoLoadOption={props.valueClass ? true : false}
                                openMenuOnFocus={true}
                                cssClasses="form-control-sm"
                                onKeyDown={e => {
                                    /*if (e.keyCode === 27) {
                                    // escape
                                    setShowAddValue(false);
                                } else if (e.keyCode === 13 && !isMenuOpen()) {
                                    props.handleAddValue(valueType, inputValue);
                                    setShowAddValue(false);
                                }*/
                                }}
                                //innerRef={ref => (resourceInputRef.current = ref)}
                                //handleCreateExistingLabel={handleCreateExistingLabel}
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                type="text"
                                bsSize="sm"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                //innerRef={this.literalInputRef}
                                //onKeyDown={e => e.keyCode === 13 && this.finishEditing()}
                                autoFocus
                            />
                        )}

                        <InputGroupButtonDropdown addonType="append" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(v => !v)}>
                            <StyledDropdownToggle disableBorderRadiusLeft={true}>
                                <small>{type.charAt(0).toUpperCase() + type.slice(1) + ' '}</small>
                                <Icon size="xs" icon={faBars} />
                            </StyledDropdownToggle>
                            <DropdownMenu>
                                <StyledDropdownItem onClick={() => setType('resource')}>Resource</StyledDropdownItem>
                                <StyledDropdownItem onClick={() => setType('literal')}>Literal</StyledDropdownItem>
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                    </InputGroup>
                </div>
            )}
        </>
    );
};

TableCellValueCreate.propTypes = {
    isVisible: PropTypes.bool
};

export default TableCellValueCreate;
