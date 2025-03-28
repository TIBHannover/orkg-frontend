import { faCheck, faPen, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { InputGroup } from 'reactstrap';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import { StyledButton } from '@/components/StatementBrowser/styled';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const ItemContainer = styled.div`
    line-height: 27px;
    &:hover .item-buttons {
        display: inline-block;
    }
`;

const ButtonsContainer = styled.div`
    display: ${(props) => (props.displayButtonOnHover ? 'none' : 'inline-block')};
`;

const ClassInlineItem = ({
    classObject,
    editMode,
    noValueMessage = 'Not defined',
    displayButtonOnHover = true,
    showParentFieldForCreate = true,
    onDelete,
    onChange,
}) => {
    const classAutocompleteRef = useRef(null);
    const { isCurationAllowed } = useAuthentication();
    const [isChangingValue, setIsChangingValue] = useState(null);
    const [isSavingChange, setIsSavingChange] = useState(false);
    const [isSavingDelete, setIsSavingDelete] = useState(false);
    const [value, setValue] = useState(classObject);

    useEffect(() => {
        setValue(classObject);
    }, [classObject]);

    const handleClassSelect = async (selected, { action }) => {
        const _selected = selected;
        setIsChangingValue(false);
        setIsSavingChange(true);
        if (action === 'select-option') {
            setValue(selected);
            await onChange(selected);
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label,
                showParentField: showParentFieldForCreate,
            });
            if (newClass) {
                _selected.id = newClass.id;
                setValue(_selected);
                await onChange(_selected);
            }
            // blur the field allows to focus and open the menu again
            if (classAutocompleteRef.current) {
                classAutocompleteRef.current.blur();
            }
        } else if (action === 'clear') {
            setValue(selected);
            await onChange(selected);
        }
        setIsSavingChange(false);
        setValue(classObject);
    };

    return (
        <ItemContainer className="pb-1 ">
            {!isChangingValue && (
                <>
                    {isSavingChange && 'Saving...'}
                    {!isSavingChange && classObject && (
                        <Link href={reverse(ROUTES.CLASS, { id: classObject.id })}>
                            <DescriptionTooltip id={classObject.id} _class={ENTITIES.CLASS}>
                                {classObject.label}
                            </DescriptionTooltip>
                        </Link>
                    )}
                    {!isSavingChange && !classObject && noValueMessage}
                    <ButtonsContainer className="item-buttons" displayButtonOnHover={displayButtonOnHover}>
                        {editMode && !isCurationAllowed && (
                            <span className="ms-2">
                                <ActionButton title="Editing requires a curator role" icon={faPen} action={null} isDisabled />
                            </span>
                        )}
                        {classObject && editMode && isCurationAllowed && (
                            <span className="ms-2">
                                {onChange && (
                                    <ActionButton
                                        title="Change class"
                                        icon={faPen}
                                        action={() => {
                                            setIsChangingValue(true);
                                        }}
                                        isDisabled={isSavingChange}
                                    />
                                )}
                                {onDelete && (
                                    <ActionButton
                                        title="Remove class"
                                        icon={faTrash}
                                        requireConfirmation
                                        confirmationMessage="Are you sure?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: async () => {
                                                    setIsSavingDelete(true);
                                                    await onDelete();
                                                    setIsSavingDelete(false);
                                                },
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                        isDisabled={isSavingDelete}
                                    />
                                )}
                            </span>
                        )}
                        {!classObject && editMode && isCurationAllowed && (
                            <span className={noValueMessage ? 'ms-2' : ''}>
                                <ActionButton
                                    title="Add class"
                                    icon={faPlus}
                                    action={() => {
                                        setIsChangingValue(true);
                                    }}
                                    isDisabled={isSavingChange}
                                />
                            </span>
                        )}
                    </ButtonsContainer>
                </>
            )}
            {isCurationAllowed && isChangingValue && (
                <InputGroup size="sm">
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        placeholder="Select or create class"
                        onChange={handleClassSelect}
                        value={value}
                        openMenuOnFocus
                        allowCreate
                        isClearable={false}
                        innerRef={classAutocompleteRef}
                        inputId="target-class"
                        size="sm"
                    />
                    <CopyIdButton value={value} />
                    <StyledButton size="sm" outline onClick={() => setIsChangingValue(false)}>
                        Cancel
                    </StyledButton>
                </InputGroup>
            )}
        </ItemContainer>
    );
};

ClassInlineItem.propTypes = {
    classObject: PropTypes.object,
    editMode: PropTypes.bool,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    noValueMessage: PropTypes.string,
    displayButtonOnHover: PropTypes.bool,
    showParentFieldForCreate: PropTypes.bool,
};

export default ClassInlineItem;
