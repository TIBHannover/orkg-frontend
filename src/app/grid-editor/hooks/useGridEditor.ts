import { groupBy, uniqBy } from 'lodash';
import { useMemo } from 'react';
import useSWR from 'swr';

import { TData, useGridState } from '@/app/grid-editor/context/GridContext';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Predicate, Statement } from '@/services/backend/types';

const useGridEditor = () => {
    const { entities, isLoading: isLoadingEntities, entityIds } = useEntities();
    const { newProperties, newRows } = useGridState();

    const { templates, isLoading: isLoadingTemplates } = useTemplates();

    const {
        data: statements,
        isLoading: isLoadingStatements,
        mutate: mutateStatements,
    } = useSWR(entityIds && entityIds?.length > 0 ? [entityIds, statementsUrl, 'getStatements'] : null, ([params]) =>
        Promise.all(
            params?.map((id) =>
                getStatements({
                    subjectId: id,
                    returnContent: true,
                    returnFormattedLabels: true,
                    // Sort ascending to keep the order of the statements when creating new ones at the end to avoid flickering of the grid
                    sortBy: [{ property: 'created_at', direction: 'asc' }],
                }),
            ) ?? [],
        ),
    );

    const rowData: TData[] = useMemo(() => {
        if (!entityIds) {
            return [];
        }

        let existingRows: TData[] = [];

        // Group statements by predicate (empty object if no statements)
        const statementsByPredicate = statements ? groupBy(statements.flat(), 'predicate.id') : {};

        // Get existing property IDs from statements
        const existingProperties = Object.keys(statementsByPredicate);

        // Get all required properties from templates
        const allRequiredProperties = templates?.map((t) => getListPropertiesFromTemplate(t, true))?.flat() ?? [];

        // Filter required properties that don't exist in statements and aren't in new properties
        const requiredProperties = uniqBy(
            allRequiredProperties.filter((p) => !existingProperties.includes(p.id) && !newProperties.some((np) => np.id === p.id)),
            'id',
        );

        // Create rows for statements if they exist
        if (statements) {
            // Create rows for each predicate
            existingRows.push(
                ...Object.entries(statementsByPredicate).flatMap(([predicateId, predicateStatements]) => {
                    // Group statements by entity for this predicate
                    const statementsByEntity = groupBy(predicateStatements, 'subject.id');

                    // Find the maximum number of statements any entity has for this predicate
                    const maxStatements = Math.max(
                        ...Object.values(statementsByEntity).map((_statements) => _statements.length),
                        1, // Ensure at least one row even if no statements
                    );

                    // Create rows based on the maximum number of statements
                    return Array.from({ length: maxStatements }, (_, rowIndex) => {
                        const row: {
                            id: string;
                            predicate: Predicate;
                            statements: Record<string, Statement | null>;
                        } = {
                            id: `${predicateId}-${rowIndex}`, // Unique row identifier
                            predicate: predicateStatements[0].predicate,
                            statements: {},
                        };

                        // Fill in statements for each entity
                        entityIds.forEach((entityId) => {
                            const entityStatements = statementsByEntity[entityId] || [];
                            // For each entity, get the statement at the current row index
                            // If the entity has fewer statements, it will be null
                            row.statements[entityId] = entityStatements[rowIndex] ?? null;
                        });

                        return row;
                    });
                }),
            );
        }
        existingRows = [...existingRows, ...newRows];
        // Add rows for required properties that don't have statements yet
        const requiredPropertyRows = requiredProperties.map((predicate) => {
            const row: {
                id: string;
                predicate: Predicate;
                statements: Record<string, Statement | null>;
            } = {
                id: `required-${predicate.id}`, // Unique row identifier for required properties
                predicate: predicate as Predicate,
                statements: {},
            };

            // Initialize empty statements for each entity
            entityIds.forEach((entityId) => {
                row.statements[entityId] = null;
            });

            return row;
        });

        // Add rows for new properties that don't have statements yet and aren't required properties
        const newPropertyRows = newProperties
            .filter(
                (predicate) =>
                    !statementsByPredicate[predicate.id] && // Filter out existing predicates
                    !requiredProperties.some((rp) => rp.id === predicate.id), // Filter out required properties
            )
            .map((predicate) => {
                const row: {
                    id: string;
                    predicate: Predicate;
                    statements: Record<string, Statement | null>;
                } = {
                    id: `new-${predicate.id}`, // Unique row identifier for new properties
                    predicate,
                    statements: {},
                };

                // Initialize empty statements for each entity
                entityIds.forEach((entityId) => {
                    row.statements[entityId] = null;
                });

                return row;
            });

        return [...existingRows, ...requiredPropertyRows, ...newPropertyRows].sort((a, b) => {
            const aLabel = a.predicate?.label || '';
            const bLabel = b.predicate?.label || '';
            return aLabel.localeCompare(bLabel);
        });
    }, [entityIds, statements, templates, newProperties, newRows]);

    const getStatementsBySubjectAndPredicate = (subjectId: string, predicateId: string): Statement[] => {
        const subjectIndex = entityIds.findIndex((id) => id === subjectId);
        return statements?.[subjectIndex]?.filter((s) => s.predicate.id === predicateId) ?? [];
    };

    const isLoading = isLoadingEntities || isLoadingTemplates || isLoadingStatements;

    return {
        isLoadingStatements,
        isLoadingEntities,
        isLoadingTemplates,
        isLoading,
        entityIds,
        rowData,
        entities,
        statements,
        mutateStatements,
        getStatementsBySubjectAndPredicate,
    };
};

export default useGridEditor;
