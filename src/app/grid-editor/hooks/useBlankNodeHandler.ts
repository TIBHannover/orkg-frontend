import { useCallback } from 'react';

import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import { LITERAL_DATA_TYPES_CLASS_IDS } from '@/constants/DataTypes';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement, getStatement } from '@/services/backend/statements';
import { getTemplates } from '@/services/backend/templates';
import { Node } from '@/services/backend/types';

/**
 * Hook that provides a handler function for creating blank nodes in event handlers.
 * This hook provides functions that can be safely called from within event handlers
 * and will dynamically evaluate blank node requirements for given ranges.
 */
const useBlankNodeHandler = () => {
    const { mutateStatement } = useSwrStatementsCache();

    const handleBlankNode = useCallback(
        async (ranges: Node[], subjectId: string, predicateId: string): Promise<boolean> => {
            const rangesNoLiterals = ranges.filter((r) => !LITERAL_DATA_TYPES_CLASS_IDS.includes(r.id));

            if (rangesNoLiterals.length === 0) {
                return false;
            }

            try {
                // Get templates for all ranges
                const templatesData = await Promise.all(rangesNoLiterals.map((r) => getTemplates({ targetClass: r.id })));

                const templates = templatesData.map((c) => c.content).flat() ?? [];
                const isBlankNode = templates.filter((t) => t.formatted_label).length > 0;
                const blankNodeLabel = templates.filter((t) => t.formatted_label).map((t) => t.label)?.[0] ?? null;

                if (isBlankNode) {
                    const newResourceId = await createResource({
                        label: blankNodeLabel,
                        classes: ranges.map((r) => r.id),
                    });
                    const statementId = await createResourceStatement(subjectId, predicateId, newResourceId);
                    const statement = await getStatement(statementId);
                    mutateStatement(statement);
                    return true; // Indicates that a blank node was created
                }

                return false; // No blank node was needed
            } catch (error) {
                console.error('Error creating blank node:', error);
                return false;
            }
        },
        [mutateStatement],
    );

    return { handleBlankNode };
};

export default useBlankNodeHandler;
