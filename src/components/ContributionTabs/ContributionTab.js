import { useState, useRef, useEffect } from 'react';
import { Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ActionButton } from './styled';

export const StyledInput = styled(Input)`
    background: #fff;
    color: ${props => props.theme.primary};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    min-width: 160px;
    margin-bottom: 1px;

    &:focus {
        background: #fff;
        color: ${props => props.theme.primary};
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

const ContributionTab = props => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.contribution.label);

    const refInput = useRef(null);

    const toggleEditLabelContribution = () => {
        setIsEditing(v => !v);
    };

    useEffect(() => {
        setDraftLabel(props.contribution.label);
    }, [props.contribution.label]);

    useEffect(() => {
        if (isEditing) {
            refInput.current?.focus();
        }
    }, [isEditing]);

    return (
        <div>
            {isEditing && (
                <StyledInput
                    bsSize="sm"
                    type="text"
                    innerRef={refInput}
                    value={draftLabel}
                    onChange={e => setDraftLabel(e.target.value)}
                    onKeyDown={e => {
                        e.stopPropagation();
                        e.keyCode === 13 && e.target.blur();
                    }} // Disable multiline Input
                    onBlur={e => {
                        e.stopPropagation();
                        toggleEditLabelContribution();
                        props.handleChangeContributionLabel(props.contribution.id, draftLabel);
                    }}
                    onFocus={() =>
                        setTimeout(() => {
                            document.execCommand('selectAll', false, null);
                        }, 0)
                    } // Highlights the entire label when edit
                />
            )}
            {!isEditing && <span>{props.contribution.label}</span>}
            {props.enableEdit && !isEditing && (
                <>
                    {props.canDelete && props.isSelected && (
                        <span className="d-inline-block ms-1 me-1">
                            <Tippy content="Delete contribution">
                                <span>
                                    <ActionButton
                                        color="link"
                                        disabled={props.contribution.isSaving || props.contribution.isDeleting}
                                        onClick={e => {
                                            e.stopPropagation();
                                            props.toggleDeleteContribution(props.contribution.id);
                                        }}
                                    >
                                        <Icon icon={!props.contribution.isDeleting ? faTrash : faSpinner} spin={props.contribution.isDeleting} />
                                    </ActionButton>
                                </span>
                            </Tippy>
                        </span>
                    )}
                    {props.isSelected && (
                        <span className="d-inline-block ms-1">
                            <Tippy content="Edit the contribution label">
                                <span>
                                    <ActionButton
                                        color="link"
                                        disabled={props.contribution.isSaving || props.contribution.isDeleting}
                                        onClick={e => {
                                            e.stopPropagation();
                                            toggleEditLabelContribution(props.contribution.id, e);
                                        }}
                                    >
                                        <Icon icon={!props.contribution.isSaving ? faPen : faSpinner} spin={props.contribution.isSaving} />
                                    </ActionButton>
                                </span>
                            </Tippy>
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

ContributionTab.propTypes = {
    contribution: PropTypes.object.isRequired,
    canDelete: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    handleChangeContributionLabel: PropTypes.func.isRequired,
    toggleDeleteContribution: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired
};

export default ContributionTab;
