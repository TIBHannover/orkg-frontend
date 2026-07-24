import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Chip, Skeleton, Switch, Tooltip } from '@heroui/react';
import { toInteger } from 'lodash';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';
import ReactStringReplace from 'react-string-replace';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import { normalizeSpacing, removeEmptySegments } from '@/components/RosettaStone/SingleStatement/hooks/helpers';
import useEditStatement from '@/components/RosettaStone/SingleStatement/hooks/useEditStatement';
import useRosettaTemplate from '@/components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import InfoBox from '@/components/RosettaStone/SingleStatement/InfoBox';
import StatementInputField from '@/components/RosettaStone/SingleStatement/StatementInputField';
import StatementValue from '@/components/RosettaStone/SingleStatement/StatementValue';
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
    handleAddStatement?: (templateId: string, subjects: OptionType[]) => void;
};

const SingleStatement: FC<SingleStatementProps> = ({ statement, showContext = false, setNewStatements, reloadStatements, handleAddStatement }) => {
    const { isEditMode } = useIsEditMode();

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
        return <Skeleton className="w-full h-4 rounded" />;
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
        <div className="py-4 px-4 relative border-b border-divider last:border-b-0">
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
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
                <InfoBox statement={statement} template={template} certainty={certainty} setCertainty={setCertainty} isEditing={isEditing} />
            </div>
            <div className="pt-4 pr-20">
                <div className="leading-loose" style={{ lineHeight: isEditing ? 3 : 2 }}>
                    {!isEditing && statement.negated && (
                        <Chip color="danger" size="sm" className="mr-2 align-middle">
                            NOT
                        </Chip>
                    )}
                    {normalizeSpacing(formattedLabelWithInputs)}.
                </div>
                {showContext && isLoadingContext && <div className="inline-block">Loading...</div>}
                {showContext && !isLoadingContext && context && (
                    <Link href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: context.id, contributionId: 'statements' })}>
                        <Chip size="sm" className="inline-block truncate" style={{ maxWidth: '50%' }} title={context.title}>
                            Context: {context.title}
                        </Chip>
                    </Link>
                )}
            </div>
            {isEditing && isEditMode && (
                <div className="mt-4 flex items-center justify-between gap-3">
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
        </div>
    );
};

export default SingleStatement;
