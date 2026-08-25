import { faCheck, faClose, faCodeBranch, faFileLines, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Skeleton, Switch, Tooltip } from '@heroui/react';
import { toInteger } from 'lodash';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import ReactStringReplace from 'react-string-replace';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import CardShell from '@/components/Cards/CardShell/CardShell';
import useAuthentication from '@/components/hooks/useAuthentication';
import CompactItemMetadata from '@/components/ItemMetadata/CompactItemMetadata';
import { normalizeSpacing, removeEmptySegments } from '@/components/RosettaStone/SingleStatement/hooks/helpers';
import useEditStatement from '@/components/RosettaStone/SingleStatement/hooks/useEditStatement';
import useRosettaTemplate from '@/components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import InfoBox from '@/components/RosettaStone/SingleStatement/InfoBox';
import StatementInputField from '@/components/RosettaStone/SingleStatement/StatementInputField';
import StatementValue from '@/components/RosettaStone/SingleStatement/StatementValue';
import VersionsModal from '@/components/RosettaStone/SingleStatement/VersionsModal';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getPaper, papersUrl } from '@/services/backend/papers';
import { RosettaStoneStatement } from '@/services/backend/types';

type SingleStatementProps = {
    statement: RosettaStoneStatement;
    setNewStatements?: Dispatch<SetStateAction<RosettaStoneStatement[]>>;
    reloadStatements?: () => void;
    showContext?: boolean;
    /** Render provenance (creation date, contributor, certainty, id and versions) below the statement. Used by the statement listings */
    showMetadata?: boolean;
    handleAddStatement?: (templateId: string, subjects: OptionType[]) => void;
};

const SingleStatement: FC<SingleStatementProps> = ({
    statement,
    showContext = false,
    showMetadata = false,
    setNewStatements,
    reloadStatements,
    handleAddStatement,
}) => {
    const { isEditMode } = useIsEditMode();
    const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
    const toggleVersionsModal = () => setIsVersionsModalOpen((v) => !v);

    const {
        onSave,
        isSaving,
        isNegate,
        certainty,
        setIsNegate,
        setCertainty,
        localValues,
        updateLocalValue,
        isEditing,
        setIsEditing,
        handleDeleteStatement,
        handleDeleteStatementPermanently,
    } = useEditStatement({ statement, setNewStatements, reloadStatements });

    const { isCurationAllowed } = useAuthentication();

    const { data: context, isLoading: isLoadingContext } = useSWR(showContext ? [statement.context, papersUrl, 'getStatement'] : null, ([params]) =>
        getPaper(params),
    );

    const { data: template, isLoading: isLoadingTemplate } = useRosettaTemplate({ id: statement.template_id ?? '' });

    if (isLoadingTemplate) {
        return (
            <CardShell>
                <Skeleton className="h-4 w-3/5 rounded" />
                {showMetadata && <Skeleton className="h-3 w-2/5 rounded" />}
            </CardShell>
        );
    }

    if (!template) {
        return null;
    }

    const replacementFunction = (match: string, index: number) => {
        const i = toInteger(match);
        const value = match === '0' ? statement.subjects : statement.objects[i - 1];
        if (isEditing && isEditMode && template.properties[i] !== undefined) {
            return (
                <StatementInputField
                    key={index}
                    value={localValues[match] ?? []}
                    propertyShape={template.properties[i]}
                    updateValue={(v: OptionType[]) => updateLocalValue(match, v)}
                />
            );
        }
        return (
            <StatementValue
                key={index}
                template={template}
                propertyShape={template.properties[i]}
                value={value}
                isEditMode={isEditMode}
                handleAddStatement={handleAddStatement}
                context={statement.context}
                showQuickActionButtons={!showContext}
            />
        );
    };

    const formattedLabelWithInputs = ReactStringReplace(
        isEditing
            ? template?.formatted_label.replaceAll(']', ' ').replaceAll('[', ' ')
            : removeEmptySegments(template?.formatted_label ?? '', statement),
        /{(.*?)}/,
        replacementFunction,
    );

    let editButtonTitle = 'Edit statement';

    if (isEditing) {
        editButtonTitle = 'Cancel edit statement';
    }
    if (!statement.modifiable) {
        editButtonTitle = 'Not modifiable statement';
    }

    return (
        <CardShell
            footer={
                showMetadata &&
                !isEditing && (
                    <CompactItemMetadata item={statement} showCreatedAt showCreatedBy showCertainty>
                        {statement.latest_version_id && (
                            // the accent icon marks the button as interactive among the plain-text metadata items
                            <button
                                type="button"
                                onClick={toggleVersionsModal}
                                className="inline-flex cursor-pointer items-center rounded-[var(--radius)] hover:underline"
                            >
                                <FontAwesomeIcon icon={faCodeBranch} size="sm" className="me-1 text-accent" /> Versions
                            </button>
                        )}
                    </CompactItemMetadata>
                )
            }
            actions={
                // -me-2 cancels the trailing margin ActionButton carries, so the last button sits on the padding edge
                <div className="-me-2 flex items-center">
                    {isEditMode && statement.latest_version_id && (
                        <ActionButton
                            title={editButtonTitle}
                            icon={isEditing ? faClose : faPen}
                            action={() => setIsEditing((v) => !v)}
                            isDisabled={!statement.modifiable}
                        />
                    )}
                    {isEditMode && (
                        <ActionButton
                            title={statement.modifiable ? 'Delete statement' : 'Not modifiable statement'}
                            icon={faTrash}
                            requireConfirmation
                            isDisabled={!statement.modifiable}
                            confirmationMessage="Are you sure to delete?"
                            confirmationButtons={[
                                ...(statement.latest_version_id && isCurationAllowed
                                    ? [{ title: 'Delete permanently', color: 'danger', icon: faCheck, action: handleDeleteStatementPermanently }]
                                    : []),
                                {
                                    title: 'Delete',
                                    color: statement.latest_version_id && isCurationAllowed ? 'warning' : 'danger',
                                    icon: faCheck,
                                    action: handleDeleteStatement,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    )}
                    <InfoBox
                        statement={statement}
                        template={template}
                        certainty={certainty}
                        setCertainty={setCertainty}
                        isEditing={isEditing}
                        openVersionsModal={toggleVersionsModal}
                    />
                </div>
            }
        >
            <div>
                <div className="break-words" style={{ lineHeight: isEditing ? 3 : 1.8 }}>
                    {!isEditing && statement.negated && (
                        <Chip color="danger" size="sm" className="me-2 align-middle">
                            NOT
                        </Chip>
                    )}
                    {normalizeSpacing(formattedLabelWithInputs)}.
                </div>
                {showContext && isLoadingContext && <Skeleton className="mt-1 h-4 w-64 rounded" />}
                {showContext && !isLoadingContext && context && (
                    <Link
                        href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: context.id, contributionId: 'statements' })}
                        className="mt-1 flex w-fit max-w-full items-center gap-1.5 text-sm text-muted hover:text-accent"
                        title={context.title}
                    >
                        <FontAwesomeIcon icon={faFileLines} size="sm" className="shrink-0" />
                        <span className="truncate">{context.title}</span>
                    </Link>
                )}
                <VersionsModal show={isVersionsModalOpen} id={statement.version_id ?? statement.id} toggle={toggleVersionsModal} />
            </div>
            {isEditing && isEditMode && (
                <div className="mt-2 flex items-center justify-between gap-3">
                    <Tooltip>
                        <Switch isSelected={isNegate} onChange={setIsNegate} size="sm">
                            <Switch.Content className="text-sm">
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                                Negate statement
                            </Switch.Content>
                        </Switch>
                        <Tooltip.Content>By activating this option the statement would be negated.</Tooltip.Content>
                    </Tooltip>
                    <ButtonWithLoading variant="primary" size="sm" onPress={onSave} isLoading={isSaving}>
                        {!statement.latest_version_id ? 'Create' : 'Update'}
                    </ButtonWithLoading>
                </div>
            )}
        </CardShell>
    );
};

export default SingleStatement;
