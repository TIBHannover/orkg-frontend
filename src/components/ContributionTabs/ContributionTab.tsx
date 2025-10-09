import { faCheck, faClose, faPen, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeEvent, FC, KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ActionButton } from '@/components/ContributionTabs/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import MathJax from '@/components/ValuePlugins/MathJax/MathJax';
import { Resource } from '@/services/backend/types';

export const StyledInput = styled(Input)`
    background: #fff;
    color: ${(props) => props.theme.primary};
    outline: 0;
    border: dotted 2px ${(props) => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: inline-block;
    min-width: 200px;
    margin-bottom: 0;
    width: 200px;
    flex: 0 0 auto;
    vertical-align: middle;

    /* Increase specificity to override Bootstrap's .input-group > .form-control */
    && {
        flex: 0 0 auto;
        width: 200px;
        padding-top: 0;
        padding-bottom: 0;
    }

    &:focus {
        background: #fff;
        color: ${(props) => props.theme.primary};
        outline: 0;
        border: dotted 2px ${(props) => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: inline-block;
    }
`;

type ContributionTabProps = {
    contribution: Resource & { statementId: string };
    canDelete: boolean;
    isSelected: boolean;
    handleChangeContributionLabel: (id: string, label: string) => void;
    toggleDeleteContribution: (id: string) => void;
    enableEdit: boolean;
};

const ContributionTab: FC<ContributionTabProps> = ({
    contribution,
    canDelete,
    isSelected,
    handleChangeContributionLabel,
    toggleDeleteContribution,
    enableEdit,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [draftLabel, setDraftLabel] = useState(contribution.label);
    const refInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDraftLabel(contribution.label);
    }, [contribution.label]);

    return (
        <div className="tw:flex tw:items-center">
            {isEditing && (
                <InputGroup className="tw:!inline-flex tw:items-center tw:!flex-nowrap">
                    <StyledInput
                        bsSize="sm"
                        type="text"
                        innerRef={refInput}
                        value={draftLabel}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftLabel(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                setIsEditing(false);
                                handleChangeContributionLabel(contribution.id, draftLabel);
                            }
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                            }
                        }}
                        autoFocus
                        onFocus={() =>
                            // Highlights the entire label when edit
                            setTimeout(() => {
                                refInput.current?.select();
                            }, 0)
                        }
                    />
                    <Button
                        size="sm"
                        type="submit"
                        color="secondary"
                        className="tw:!px-2"
                        onClick={() => {
                            setIsEditing(false);
                        }}
                        title="Cancel"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                    <Button
                        className="tw:!px-2"
                        size="sm"
                        type="submit"
                        color="primary"
                        onClick={async () => {
                            setIsSaving(true);
                            await handleChangeContributionLabel(contribution.id, draftLabel);
                            setIsSaving(false);
                            setIsEditing(false);
                        }}
                        title="Save"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                </InputGroup>
            )}
            {!isEditing && (
                <ConditionalWrapper
                    condition={contribution.label?.length > 40}
                    wrapper={(children: ReactNode) => <Tooltip content={contribution.label}>{children}</Tooltip>}
                >
                    <div className="tw:truncate tw:inline-block tw:py-1" style={{ maxWidth: 300 }}>
                        <MathJax text={contribution.label} />
                    </div>
                </ConditionalWrapper>
            )}
            {enableEdit && !isEditing && (
                <>
                    {canDelete && isSelected && (
                        <span className="tw:inline-block tw:ml-1 tw:mr-1">
                            <Tooltip content="Delete contribution">
                                <span>
                                    <ActionButton
                                        color="link"
                                        disabled={isSaving || isDeleting}
                                        onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                                            e.stopPropagation();
                                            setIsDeleting(true);
                                            await toggleDeleteContribution(contribution.id);
                                            setIsDeleting(false);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={!isDeleting ? faTrash : faSpinner} spin={isDeleting} />
                                    </ActionButton>
                                </span>
                            </Tooltip>
                        </span>
                    )}
                    {isSelected && (
                        <span className="tw:inline-block tw:ml-1">
                            <Tooltip content="Edit the contribution label">
                                <span>
                                    <ActionButton
                                        color="link"
                                        disabled={isSaving || isDeleting}
                                        onClick={() => {
                                            setIsEditing(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={!isSaving ? faPen : faSpinner} spin={isSaving} />
                                    </ActionButton>
                                </span>
                            </Tooltip>
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

export default ContributionTab;
