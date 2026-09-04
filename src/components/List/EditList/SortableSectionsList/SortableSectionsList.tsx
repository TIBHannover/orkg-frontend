import { reorderList, useAutoScroll, useSortableList } from '@orkg/pragmatic-dnd-hooks';
import { useCallback } from 'react';

import EditSection from '@/components/List/EditList/SortableSectionsList/EditSection/EditSection';
import useList from '@/components/List/hooks/useList';
import Container from '@/components/Ui/Structure/Container';

export type HandleManualSort = (params: { id: string; direction: 'up' | 'down' }) => void;

const SortableSectionsList = () => {
    const { list, updateList } = useList();

    const { instanceId, moveItem } = useSortableList({
        itemCount: list?.sections.length ?? 0,
        onReorder: (event) => {
            if (!list) return;
            updateList({
                sections: reorderList(list.sections, event),
            });
        },
    });

    useAutoScroll({ instanceId, includeWindow: true });

    const handleManualSort: HandleManualSort = useCallback(
        ({ id, direction }) => {
            if (!list) return;

            const oldIndex = list.sections.findIndex((section) => section.id === id);
            if (oldIndex === -1) {
                return;
            }
            moveItem(oldIndex, direction === 'up' ? oldIndex - 1 : oldIndex + 1);
        },
        [list, moveItem],
    );

    if (!list) {
        return null;
    }

    return (
        <Container className="relative">
            {list.sections.map((section, index) => (
                <EditSection
                    key={section.id}
                    index={index}
                    section={section}
                    atIndex={index + 1}
                    instanceId={instanceId}
                    moveItem={moveItem}
                    handleManualSort={handleManualSort}
                />
            ))}
        </Container>
    );
};

export default SortableSectionsList;
