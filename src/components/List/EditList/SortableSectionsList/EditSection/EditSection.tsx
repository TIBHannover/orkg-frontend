import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { FC } from 'react';

import Confirm from '@/components/Confirmation/Confirmation';
import AddSection from '@/components/List/EditList/AddSection/AddSection';
import EditSectionList from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionList';
import EditSectionText from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionText/EditSectionText';
import { type HandleManualSort } from '@/components/List/EditList/SortableSectionsList/SortableSectionsList';
import { isListSection, isTextSection } from '@/components/List/helpers/typeGuards';
import useList from '@/components/List/hooks/useList';
import SortableSection from '@/components/shared/dnd/SortableSection/SortableSection';
import { LiteratureListSection } from '@/services/backend/types';

type EditSectionProps = {
    section: LiteratureListSection;
    atIndex: number;
    index: number;
    instanceId: symbol;
    moveItem: MoveItem;
    handleManualSort: HandleManualSort;
};

const EditSection: FC<EditSectionProps> = ({ section, handleManualSort, atIndex, index, instanceId, moveItem }) => {
    const { list, deleteSection } = useList();

    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        moveItem,
        dragHandleLabel: 'Drag to reorder section',
        previewOffset: 'preserve-offset-on-source',
        renderDragPreview: ({ container }) => {
            const preview = document.createElement('div');
            preview.className =
                'inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md max-w-xs truncate font-medium';
            preview.textContent = isTextSection(section) ? (section.heading ?? 'Text section') : 'List section';
            container.appendChild(preview);
        },
    });

    if (!list) {
        return null;
    }

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this section?',
        });

        if (confirm) {
            deleteSection(section.id);
        }
    };

    return (
        <section ref={elementRef} style={{ opacity: isDragging ? 0.7 : 1, position: 'relative' }}>
            <SortableSection
                handleDelete={handleDelete}
                handleSort={(direction: 'up' | 'down') => handleManualSort({ id: section.id, direction })}
                dragHandleRef={dragHandleRef}
                dragHandleProps={dragHandleProps}
            >
                {isTextSection(section) && <EditSectionText section={section} />}
                {isListSection(section) && <EditSectionList section={section} />}
            </SortableSection>
            <AddSection index={atIndex} />
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </section>
    );
};

export default EditSection;
