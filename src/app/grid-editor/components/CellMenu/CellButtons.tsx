import { faCheck, faPen, faPlus, faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ColDef, GridApi, IRowNode } from 'ag-grid-community';
import classNames from 'classnames';
import { useState } from 'react';

import { TData, useGridDispatch } from '@/app/grid-editor/context/GridContext';
import useBlankNode from '@/app/grid-editor/hooks/useBlankNode';
import useConstraints from '@/app/grid-editor/hooks/useConstraints';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import ActionButton from '@/components/ActionButton/ActionButton';
import InfoTippy from '@/components/DataBrowser/components/Body/ValueOptions/InfoTippy';
import SemantifyButton from '@/components/SemantifyButton/SemantifyButton';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import { createResourceStatement, deleteStatementById, getStatement } from '@/services/backend/statements';
import { Literal, Resource, Statement } from '@/services/backend/types';

type TableCellButtonsProps = {
    value: Statement;
    api?: GridApi<TData>;
    node?: IRowNode<TData>;
    colDef?: ColDef<TData>;
};

const CellButtons = ({ value, api, node, colDef }: TableCellButtonsProps) => {
    const { entityIds, getStatementsBySubjectAndPredicate } = useGridEditor();
    const { canAddValue: canAddValueFn, getRanges, getScopedTemplates } = useConstraints();
    const templates = getScopedTemplates(value.subject.id);
    const ranges = getRanges(value.predicate.id, value.subject.id);
    const canAddValue = canAddValueFn(value.predicate.id, value.subject.id);
    const { isBlankNode, createBlankNode, isLoadingTemplates } = useBlankNode(ranges);
    const [disableHover, setDisableHover] = useState(false);
    const dispatch = useGridDispatch();
    const { deleteStatements, mutateStatement, addStatements } = useSwrStatementsCache();

    const onStartEditing = () => {
        if (api && node && colDef && node.rowIndex !== null && colDef.field) {
            api.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: colDef.field,
            });
        }
    };

    const onAddNewRow = () => {
        // Create a new row with empty statements for each entity
        const newRowStatements: Record<string, Statement | null> = {};
        entityIds.forEach((entityId) => {
            newRowStatements[entityId] = null;
        });
        dispatch({ type: 'ADD_ROW', payload: { row: { id: `temp-row-${Date.now()}`, predicate: value.predicate, statements: newRowStatements } } });
    };

    const onAddNewValue = async () => {
        if (isBlankNode) {
            const newResourceId = await createBlankNode();
            const statementId = await createResourceStatement(value.subject.id, value.predicate.id, newResourceId);
            const statement = await getStatement(statementId);
            mutateStatement(statement);
        } else {
            onAddNewRow();
        }
    };

    const onSaveSemantify = async (deletedStatementIds: string[], newStatementIds: string[]) => {
        try {
            const newStatements = await Promise.all(newStatementIds.map((id) => getStatement(id)));
            addStatements(newStatements);
            deleteStatements(deletedStatementIds);
        } catch (error) {
            console.error('Error semantifying statements:', error);
        }
    };

    const onDelete = async () => {
        try {
            await deleteStatementById(value.id);
            deleteStatements([value.id]);
        } catch (error) {
            console.error('Error deleting statement:', error);
        }
    };

    const isLiteral = value.object._class === ENTITIES.LITERAL;
    const isFormatted = 'formatted_label' in value.object && Boolean((value.object as Resource).formatted_label);
    const isEmptyObject = value.object.id === 'empty';
    const isNonDefaultDatatype = isLiteral && (value.object as Literal).datatype !== MISC.DEFAULT_LITERAL_DATATYPE;
    const isDisabledSemantify = isNonDefaultDatatype || isFormatted || isEmptyObject;

    return (
        <div className={classNames({ 'cell-buttons': true, disableHover })}>
            <InfoTippy statement={value} />
            <SemantifyButton
                statement={value}
                isDisabled={isDisabledSemantify}
                title={isDisabledSemantify ? 'Literal datatypes, and formatted labels, cannot be semantified' : 'Semantify'}
                onSave={onSaveSemantify}
                templates={templates}
                currentPathStatements={getStatementsBySubjectAndPredicate(value.subject.id, value.predicate.id)}
            />
            {isLoadingTemplates ? (
                <ActionButton isDisabled title="Loading templates" icon={faSpinner} />
            ) : (
                <ActionButton
                    isDisabled={!canAddValue}
                    title={canAddValue ? 'Add value' : 'This property reached the maximum number of values set by template'}
                    icon={faPlus}
                    action={onAddNewValue}
                />
            )}
            <ActionButton title="Edit" icon={faPen} isDisabled={!api || !node || !colDef} action={onStartEditing} />
            <ActionButton
                title="Delete"
                icon={faTrash}
                isDisabled={false}
                requireConfirmation
                confirmationMessage="Are you sure to delete?"
                confirmationButtons={[
                    {
                        title: 'Delete',
                        color: 'danger',
                        icon: faCheck,
                        action: onDelete,
                    },
                    {
                        title: 'Cancel',
                        color: 'secondary',
                        icon: faTimes,
                    },
                ]}
                open={disableHover}
                setOpen={setDisableHover}
            />
        </div>
    );
};

export default CellButtons;
