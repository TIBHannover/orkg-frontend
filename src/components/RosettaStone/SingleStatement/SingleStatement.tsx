import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { OptionType } from 'components/Autocomplete/types';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import removeEmptySegments from 'components/RosettaStone/SingleStatement/hooks/helpers';
import useEditStatement from 'components/RosettaStone/SingleStatement/hooks/useEditStatement';
import useRosettaTemplate from 'components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import InfoBox from 'components/RosettaStone/SingleStatement/InfoBox';
import StatementInputField from 'components/RosettaStone/SingleStatement/StatementInputField';
import StatementValue from 'components/RosettaStone/SingleStatement/StatementValue';
import ActionButton from 'components/ActionButton/ActionButton';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ROUTES from 'constants/routes';
import { toInteger } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import ReactStringReplace from 'react-string-replace';
import { Badge, FormGroup, Input, Label, ListGroupItem } from 'reactstrap';
import { getPaper, papersUrl } from 'services/backend/papers';
import { RosettaStoneStatement } from 'services/backend/types';
import { isCurationAllowed } from 'slices/authSlice';
import { RootStore } from 'slices/types';
import useSWR from 'swr';

type SingleStatementProps = {
    statement: RosettaStoneStatement;
    setNewStatements?: Dispatch<SetStateAction<RosettaStoneStatement[]>>;
    reloadStatements: () => void;
    showContext?: boolean;
};

const SingleStatement: FC<SingleStatementProps> = ({ statement, showContext = false, setNewStatements, reloadStatements }) => {
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

    const isCurator = useSelector((state: RootStore) => isCurationAllowed(state));

    const { data: context, isLoading: isLoadingContext } = useSWR(showContext ? [statement.context, papersUrl, 'getStatement'] : null, ([params]) =>
        getPaper(params),
    );

    const { data: template, isLoading: isLoadingTemplate } = useRosettaTemplate({ id: statement.template_id ?? '' });

    if (isLoadingTemplate) {
        return 'Loading...';
    }

    if (!template) {
        return null;
    }

    const replacementFunction = (match: string) => {
        const i = toInteger(match);
        const value = match === '0' ? statement.subjects : statement.objects[i - 1];
        if (isEditing && isEditMode && template.properties[i] !== undefined) {
            return (
                <StatementInputField
                    value={localValues[match] ?? []}
                    propertyShape={template.properties[i]}
                    updateValue={(v: OptionType[]) => updateLocalValue(match, v)}
                />
            );
        }
        return <StatementValue key={i} propertyShape={template.properties[i]} value={value} />;
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
        <ListGroupItem className="py-3">
            <div className="position-absolute top-0 end-0 mt-2 z-3">
                {isEditMode && (
                    <span className="ms-2">
                        {statement.latest_version_id && (
                            <ActionButton
                                title={editButtonTitle}
                                icon={isEditing ? faClose : faPen}
                                action={() => setIsEditing((v) => !v)}
                                isDisabled={!statement.modifiable}
                                appendTo={document.body}
                            />
                        )}
                        <ActionButton
                            title={statement.modifiable ? 'Delete statement' : 'Not modifiable statement'}
                            icon={faTrash}
                            requireConfirmation
                            isDisabled={!statement.modifiable}
                            confirmationMessage="Are you sure to delete?"
                            confirmationButtons={[
                                ...(statement.latest_version_id && isCurator
                                    ? [{ title: 'Delete permanently', color: 'danger', icon: faCheck, action: handleDeleteStatementPermanently }]
                                    : []),
                                {
                                    title: 'Delete',
                                    color: statement.latest_version_id && isCurator ? 'warning' : 'danger',
                                    icon: faCheck,
                                    action: handleDeleteStatement,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                            appendTo={document.body}
                        />
                    </span>
                )}

                <InfoBox statement={statement} template={template} certainty={certainty} setCertainty={setCertainty} isEditing={isEditing} />
            </div>
            <div className="p-2">
                <div style={{ lineHeight: isEditing ? 3 : 2 }}>
                    {!isEditing && statement.negated && (
                        <div className="d-inline-block me-2">
                            <Badge color="danger">NOT</Badge>
                        </div>
                    )}
                    {formattedLabelWithInputs}.
                </div>
                {showContext && isLoadingContext && <div className="d-inline-block">Loading...</div>}
                {showContext && !isLoadingContext && context && (
                    <Link href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: context.id, contributionId: 'statements' })}>
                        <Badge color="light">Context: {context.title}</Badge>
                    </Link>
                )}
            </div>
            <div className="d-flex justify-content-between">
                {isEditing && isEditMode && (
                    <div className="clearfix">
                        <FormGroup switch className="pull-right me-2">
                            <Tippy interactive appendTo={document.body} content="By activating this option the statement would be negated.">
                                <span>
                                    <Input
                                        checked={isNegate}
                                        type="switch"
                                        role="switch"
                                        id={`negate${statement.id}`}
                                        onChange={() => setIsNegate((v) => !v)}
                                    />
                                    <Label check for={`negate${statement.id}`}>
                                        Negate statement
                                    </Label>
                                </span>
                            </Tippy>
                        </FormGroup>
                    </div>
                )}
                {isEditing && isEditMode && (
                    <ButtonWithLoading color="primary" size="sm" onClick={onSave} isLoading={isSaving}>
                        {!statement.latest_version_id ? 'Create' : 'Update'}
                    </ButtonWithLoading>
                )}
            </div>
        </ListGroupItem>
    );
};

export default SingleStatement;
