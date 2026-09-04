import { toast } from '@heroui/react';
import { reorderList, useSortableList } from '@orkg/pragmatic-dnd-hooks';

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

    const { instanceId, moveItem } = useSortableList({
        itemCount: statements?.length ?? 0,
        onReorder: async (event) => {
            if (!statements || !entity || !isEditMode || !isList) return;

            const reorderedItems = reorderList(statements, event);

            // Update the UI during drag
            mutateStatements(reorderedItems, { revalidate: false });

            // Persist the changes
            try {
                await updateList({ id: entity.id, elements: reorderedItems.map((s) => s.object.id) });
                toast.clear();
                toast.success('Order updated successfully');
            } catch (err) {
                console.error('Failed to update list order:', err);
                toast.danger('Failed to update order');
            }
        },
    });

    return {
        isList,
        instanceId,
        moveItem,
    };
};

export default useListOrdering;
