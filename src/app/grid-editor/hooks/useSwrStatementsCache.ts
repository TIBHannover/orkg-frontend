import { useSWRConfig } from 'swr';

import { useGridDispatch, useGridState } from '@/app/grid-editor/context/GridContext';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import { statementsUrl } from '@/services/backend/statements';
import { Predicate, Statement } from '@/services/backend/types';

const useSwrStatementsCache = () => {
    const { mutate } = useSWRConfig();
    const { entityIds } = useEntities();
    const { statements } = useGridEditor();
    const { newRows } = useGridState();
    const dispatch = useGridDispatch();

    const mutateStatement = (newStatement: Statement, oldStatement?: Statement) => {
        // If this is an update, replace the statement in-place; otherwise insert into the correct subject bucket
        if (oldStatement) {
            const updatedStatements = statements?.map((subjectStatements) =>
                subjectStatements.map((s) => (s.id === oldStatement.id ? newStatement : s)),
            );
            mutate([entityIds, statementsUrl, 'getStatements'], updatedStatements, { revalidate: false });
        } else {
            // Creation case: place the new statement into the bucket that matches its subject
            const subjectIndex = entityIds.findIndex((id) => id === newStatement.subject.id);
            if (subjectIndex === -1) {
                // Subject not in the current grid scope; no cache update
                return;
            }

            const clonedBySubject: Statement[][] = Array.from({ length: entityIds.length }, (_, idx) =>
                statements?.[idx] ? [...statements[idx]] : [],
            );
            clonedBySubject[subjectIndex] = [...(clonedBySubject[subjectIndex] ?? []), newStatement];

            mutate([entityIds, statementsUrl, 'getStatements'], clonedBySubject, { revalidate: false });

            // Remove one matching placeholder row for this predicate if present
            const placeholder = newRows.find((r) => r.predicate.id === newStatement.predicate.id);
            if (placeholder) {
                dispatch({ type: 'DELETE_ROW', payload: { rowId: placeholder.id } });
            }
        }
    };

    const addStatements = (newStatements: Statement[]) => {
        const apply = (prev: Statement[][] | undefined) => {
            const entityIndex = entityIds.findIndex((id) => id === newStatements[0].subject.id);
            const updatedStatements = prev?.map((st, index) => (index === entityIndex ? [...st, ...newStatements] : st));
            return updatedStatements;
        };
        mutate([entityIds, statementsUrl, 'getStatements'], apply, { revalidate: false });
    };

    const deleteStatements = (statementIds: string[]) => {
        const apply = (prev: Statement[][] | undefined) => {
            const updatedStatements = prev?.map((st) => st.filter((s) => !statementIds.includes(s.id)));
            return updatedStatements;
        };
        mutate([entityIds, statementsUrl, 'getStatements'], apply, { revalidate: false });
    };

    const updateStatementsPredicate = (statementIds: string[], predicate: Predicate) => {
        const apply = (prev: Statement[][] | undefined) => {
            const updatedStatements = prev?.map((st) => st.map((s) => (statementIds.includes(s.id) ? { ...s, predicate } : s)));
            return updatedStatements;
        };
        mutate([entityIds, statementsUrl, 'getStatements'], apply, { revalidate: false });
    };

    return { mutateStatement, deleteStatements, addStatements, updateStatementsPredicate };
};

export default useSwrStatementsCache;
