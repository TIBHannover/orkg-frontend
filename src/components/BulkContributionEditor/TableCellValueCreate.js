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
import { upperFirst } from 'lodash';

const CreateButtonContainer = styled.div`
    position: absolute;
    bottom: -13px;
    left: 50%;
    margin-left: -15px;
    z-index: 1;
`;

const TableCellValueCreate = ({ isVisible }) => {
    const [value, setValue] = useState('');
    const [type, setType] = useState('literal');
    const [isCreating, setIsCreating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const refContainer = useRef(null);

    useClickAway(refContainer, () => {
        if (isCreating) {
            setIsCreating(false);
        }
    });

    return (
        <>
            {!isCreating && isVisible && (
                <div className="h-100" onDoubleClick={() => setIsCreating(true)}>
                    <CreateButtonContainer>
                        <StatementOptionButton title="Add value" icon={faPlus} action={() => setIsCreating(true)} />
                    </CreateButtonContainer>
                </div>
            )}
            {isCreating && (
                <div ref={refContainer} style={{ height: 35 }}>
                    <InputGroup size="sm" style={{ width: 295 }}>
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
                                menuPortalTarget={document.body}
                                onInput={(e, value) => setValue(e ? e.target.value : value)}
                                value={value}
                                //onBlur={() => setIsCreating(false)}
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
                                autoFocus
                            />
                        )}

                        <InputGroupButtonDropdown addonType="append" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(v => !v)}>
                            <StyledDropdownToggle disableBorderRadiusLeft={true}>
                                <small>{upperFirst(type)} </small>
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
