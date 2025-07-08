import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { INSTANCE_ID, isDragData } from '@/components/DataBrowser/components/Body/Statement/SortableValueItem/SortableValueItem';
import { createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { CLASSES } from '@/constants/graphSettings';
import { updateList } from '@/services/backend/lists';
import { Class, Literal, Predicate, Resource, Statement } from '@/services/backend/types';

type UseListOrderingProps = {
    statements: Statement[] | undefined;
    entity: Predicate | Resource | Class | Literal | undefined;
    isEditMode?: boolean;
    mutateStatements: (data: Statement[], options?: { revalidate: boolean }) => void;
};

const useListOrdering = ({ statements, entity, isEditMode, mutateStatements }: UseListOrderingProps) => {
    const isList = entity && 'classes' in entity && entity.classes?.includes(CLASSES.LIST);

    // Reorder callback for drag and drop
    const reorderStatements = useCallback(
        async ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            if (!statements || !entity) return;

            const reorderedItems = performReorder({
                items: statements,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            // Update the UI during drag
            mutateStatements(reorderedItems, { revalidate: false });

            // Persist the changes
            try {
                await updateList({ id: entity.id, elements: reorderedItems.map((s) => s.object.id) });
                // await mutateOriginalOrder();
                toast.dismiss();
                toast.success('Order updated successfully');
            } catch (err) {
                console.error('Failed to update list order:', err);
                toast.error('Failed to update order');
            }
        },
        [statements, entity, mutateStatements],
    );

    // Set up list monitor for drag and drop
    useEffect(() => {
        if (!statements || !isEditMode || !isList) return undefined;

        const cleanup = createListMonitor({
            instanceId: INSTANCE_ID,
            items: statements,
            isDragData,
            onReorder: reorderStatements,
            getItemId: (statement) => statement.id,
        });

        return () => {
            cleanup?.();
        };
    }, [statements, isEditMode, isList, reorderStatements]);

    return {
        isList,
        reorderStatements,
    };
};

export default useListOrdering;
