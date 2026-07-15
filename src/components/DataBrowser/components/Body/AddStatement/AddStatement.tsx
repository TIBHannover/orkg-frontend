import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import PredicateView from '@/components/DataBrowser/components/Body/PredicateView/PredicateView';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import ValueInputField from '@/components/DataBrowser/components/Body/ValueInputField/ValueInputField';
import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useBlankNode from '@/components/DataBrowser/hooks/useBlankNode';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useConstraints from '@/components/DataBrowser/hooks/useConstraints';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import { StatementWrapperStyled } from '@/components/DataBrowser/styles/styled';
import SmartValueSuggestions from '@/components/SmartSuggestions/SmartValueSuggestions';
import { PREDICATES } from '@/constants/graphSettings';
import { createResourceStatement } from '@/services/backend/statements';
import { Predicate } from '@/services/backend/types';

type AddStatementProps = {
    shift?: boolean;
    predicate: Predicate;
    canDelete: boolean;
    showDeleteButton?: boolean;
};

const AddStatement: FC<AddStatementProps> = ({ predicate, shift, canDelete, showDeleteButton = true }) => {
    const { canAddValue, ranges } = useConstraints(predicate.id);
    const range = ranges.length > 0 ? ranges[0] : undefined;
    const { config, context } = useDataBrowserState();
    const { isEditMode } = config;
    const { title, abstract } = context;
    const { isBlankNode, createBlankNode } = useBlankNode(ranges);
    const [showAdd, setShowAdd] = useState(false);
    const { canEdit } = useCanEdit();
    const { entity, mutateStatements } = useEntity();
    const { currentId, navigateToPath } = useHistory();

    const dispatch = useDataBrowserDispatch();
    const deleteProperty = () => {
        if (entity) {
            dispatch({ type: 'DELETE_PROPERTY', payload: { id: entity.id, predicateId: predicate.id } });
        }
    };

    const handleAddValue = async () => {
        if (isBlankNode) {
            const newResourceId = await createBlankNode();
            await createResourceStatement(currentId, predicate.id, newResourceId);
            navigateToPath([currentId, predicate.id, newResourceId]);
            mutateStatements();
        } else {
            setShowAdd(true);
        }
    };

    return (
        <div className="border-b border-gray-200 flex flex-wrap items-stretch gap-0">
            <div className="flex flex-1 min-w-0">
                <div className="flex shrink-0 grow-0 w-4/12 basis-4/12 max-w-4/12" style={{ borderRight: '1px solid #e0e0e0' }}>
                    {shift && <HierarchyIndicator path={['1', '1']} side="left" />}
                    <StatementWrapperStyled className="px-2 py-2 flex items-center flex-1 min-w-0 flex-grow">
                        <PredicateView predicate={predicate} isNewPredicate />{' '}
                        {showDeleteButton && canEdit && isEditMode && (
                            <span className="ml-1 actionButtons">
                                <ActionButton
                                    isDisabled={!canDelete}
                                    title={canDelete ? 'Delete property' : 'This property is required by the template'}
                                    icon={faTrash}
                                    requireConfirmation
                                    confirmationMessage="Are you sure?"
                                    confirmationButtons={[
                                        {
                                            title: 'Delete',
                                            color: 'danger',
                                            icon: faCheck,
                                            action: deleteProperty,
                                        },
                                        {
                                            title: 'Cancel',
                                            color: 'secondary',
                                            icon: faTimes,
                                        },
                                    ]}
                                    testId={`delete-property-${predicate.id}`}
                                />
                            </span>
                        )}
                    </StatementWrapperStyled>
                </div>
                <div className="flex flex-1 min-w-0">
                    <div className="px-2 py-1 flex flex-1 min-w-0 items-center min-h-11">
                        {canEdit && isEditMode && !showAdd && (
                            <div className="flex items-center">
                                <ActionButton
                                    isDisabled={!canAddValue}
                                    title={canAddValue ? 'Add value' : 'This property reached the maximum number of values set by template'}
                                    icon={faPlus}
                                    action={handleAddValue}
                                    testId={`add-value-${predicate.id}-${Boolean(isBlankNode)}`}
                                />
                                {canAddValue &&
                                    [PREDICATES.HAS_RESEARCH_PROBLEM, PREDICATES.METHOD, PREDICATES.MATERIAL].includes(predicate.id) &&
                                    title && (
                                        <SmartValueSuggestions
                                            paperTitle={title}
                                            abstract={abstract}
                                            predicateId={predicate.id}
                                            resourceId={currentId}
                                            classId={range ? range?.id : undefined}
                                        />
                                    )}
                            </div>
                        )}
                        {canEdit && isEditMode && showAdd && <ValueInputField predicate={predicate} toggleShowInput={() => setShowAdd((v) => !v)} />}
                        {!isEditMode && <i className="text-small">No values</i>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStatement;
