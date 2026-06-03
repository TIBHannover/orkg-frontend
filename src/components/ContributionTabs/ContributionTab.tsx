import { faCheck, faClose, faPen, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from '@heroui/react';
import { ChangeEvent, FC, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import Math from '@/components/ValuePlugins/Math/Math';
import { Resource } from '@/services/backend/types';

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftLabel(contribution.label);
    }, [contribution.label]);

    return (
        <div className="flex items-center min-h-8">
            {isEditing && (
                <div className="inline-flex items-stretch flex-nowrap h-8">
                    <Input
                        type="text"
                        ref={refInput}
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
                            setTimeout(() => {
                                refInput.current?.select();
                            }, 0)
                        }
                        className="w-[200px] !h-8 rounded-e-none bg-surface text-foreground"
                    />
                    <Button
                        size="sm"
                        variant="secondary"
                        className="px-2 !h-8 rounded-none -ms-px"
                        onPress={() => {
                            setIsEditing(false);
                        }}
                        aria-label="Cancel"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                    <Button
                        size="sm"
                        variant="primary"
                        className="px-2 !h-8 rounded-s-none -ms-px"
                        onPress={async () => {
                            setIsSaving(true);
                            await handleChangeContributionLabel(contribution.id, draftLabel);
                            setIsSaving(false);
                            setIsEditing(false);
                        }}
                        aria-label="Save"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                </div>
            )}
            {!isEditing && (
                <ConditionalWrapper
                    condition={contribution.label?.length > 40}
                    wrapper={(children: ReactNode) => <Tooltip content={contribution.label}>{children}</Tooltip>}
                >
                    <div className="truncate inline-flex items-center h-8" style={{ maxWidth: 300 }}>
                        <Math text={contribution.label} />
                    </div>
                </ConditionalWrapper>
            )}
            {enableEdit && !isEditing && (
                <>
                    {canDelete && isSelected && (
                        <span className="inline-block ml-1 mr-1">
                            <Tooltip content="Delete contribution">
                                <span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        isIconOnly
                                        aria-label="Delete contribution"
                                        isDisabled={isSaving || isDeleting}
                                        className="!min-w-0 !h-8 px-1 text-inherit"
                                        onClick={async (e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setIsDeleting(true);
                                            await toggleDeleteContribution(contribution.id);
                                            setIsDeleting(false);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={!isDeleting ? faTrash : faSpinner} spin={isDeleting} />
                                    </Button>
                                </span>
                            </Tooltip>
                        </span>
                    )}
                    {isSelected && (
                        <span className="inline-block ml-1">
                            <Tooltip content="Edit the contribution label">
                                <span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        isIconOnly
                                        aria-label="Edit contribution label"
                                        isDisabled={isSaving || isDeleting}
                                        className="!min-w-0 !h-8 px-1 text-inherit"
                                        onPress={() => {
                                            setIsEditing(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={!isSaving ? faPen : faSpinner} spin={isSaving} />
                                    </Button>
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
