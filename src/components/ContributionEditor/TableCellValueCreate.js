import { faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createLiteralValue, createResourceValue } from 'actions/contributionEditor';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StyledDropdownItem, StyledDropdownToggle } from 'components/StatementBrowser/styled';
import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';
import { upperFirst } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useClickAway } from 'react-use';
import { DropdownMenu, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import styled from 'styled-components';

const CreateButtonContainer = styled.div`
    position: absolute;
    bottom: -13px;
    left: 50%;
    margin-left: -15px;
    z-index: 1;
    display: none;
`;

const TableCellValueCreate = ({ isVisible, contributionId, propertyId, isEmptyCell }) => {
    const [value, setValue] = useState('');
    const [type, setType] = useState(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'resource' : 'literal');
    const [isCreating, setIsCreating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const refContainer = useRef(null);
    const dispatch = useDispatch();

    useClickAway(refContainer, () => {
        setIsCreating(false);
        createValue();
    });

    const createValue = () => {
        if (type === 'literal' && value.trim()) {
            handleCreateLiteral();
        }
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action !== 'create-option' && action !== 'select-option') {
            return;
        }

        dispatch(
            createResourceValue({
                contributionId,
                propertyId,
                resourceId: selected.id ?? null,
                resourceLabel: value,
                action,
                classes: propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? [CLASSES.PROBLEM] : []
            })
        );
        closeCreate();
    };

    const handleCreateLiteral = () => {
        dispatch(
            createLiteralValue({
                contributionId,
                propertyId,
                label: value
            })
        );
        closeCreate();
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            createValue();
        }
    };

    const closeCreate = () => {
        setIsCreating(false);
        setType(propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'resource' : 'literal');
        setValue('');
    };

    return (
        <>
            {!isCreating && isVisible && (
                <div className={isEmptyCell ? 'h-100' : ''} role="button" tabIndex="0" onDoubleClick={() => setIsCreating(true)}>
                    <CreateButtonContainer className="create-button">
                        <StatementOptionButton title="Add value" icon={faPlus} action={() => setIsCreating(true)} />
                    </CreateButtonContainer>
                </div>
            )}
            {isCreating && (
                <div ref={refContainer} style={{ height: 35 }}>
                    <InputGroup size="sm" style={{ width: 295 }}>
                        {type === 'resource' ? (
                            <Autocomplete
                                optionsClass={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? CLASSES.PROBLEM : undefined}
                                entityType={ENTITIES.RESOURCE}
                                excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                                placeholder={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'Enter a research problem' : 'Enter a resource'}
                                onChange={handleChangeAutocomplete}
                                menuPortalTarget={document.body}
                                onInput={(e, value) => setValue(e ? e.target.value : value)}
                                value={value}
                                openMenuOnFocus
                                allowCreate
                                cssClasses="form-control-sm"
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                type="text"
                                bsSize="sm"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                            />
                        )}
                        {propertyId !== PREDICATES.HAS_RESEARCH_PROBLEM && (
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
                        )}
                    </InputGroup>
                </div>
            )}
        </>
    );
};

TableCellValueCreate.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    isEmptyCell: PropTypes.bool.isRequired
};

export default memo(TableCellValueCreate);
