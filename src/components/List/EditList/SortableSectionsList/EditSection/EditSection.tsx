import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, type ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, type Edge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { FC, useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import Confirm from '@/components/Confirmation/Confirmation';
import AddSection from '@/components/List/EditList/AddSection/AddSection';
import EditSectionList from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionList';
import EditSectionText from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionText/EditSectionText';
import { type HandleManualSort } from '@/components/List/EditList/SortableSectionsList/SortableSectionsList';
import { isListSection, isTextSection } from '@/components/List/helpers/typeGuards';
import useList from '@/components/List/hooks/useList';
import { type DragData, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import SortableSection from '@/components/shared/dnd/SortableSection/SortableSection';
import { LiteratureListSection } from '@/services/backend/types';

type EditSectionProps = {
    section: LiteratureListSection;
    atIndex: number;
    index: number;
    instanceId: symbol;
    createDragData: (params: { item: LiteratureListSection; index: number; instanceId: symbol }) => DragData<LiteratureListSection>;
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<LiteratureListSection>;
    handleManualSort: HandleManualSort;
    onReorder: (params: ReorderParams) => void;
};

const EditSection: FC<EditSectionProps> = ({ section, handleManualSort, atIndex, index, instanceId, createDragData, isDragData, onReorder }) => {
    const { list, deleteSection } = useList();
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return undefined;
        }

        const data = createDragData({ item: section, index, instanceId });

        function onChange({ source, self }: ElementDropTargetEventBasePayload) {
            const isSource = source.element === element;
            if (isSource) {
                setClosestEdge(null);
                return;
            }

            const currentClosestEdge = extractClosestEdge(self.data);
            const sourceIndex = source.data.index;
            invariant(typeof sourceIndex === 'number');

            const isItemBeforeSource = index === sourceIndex - 1;
            const isItemAfterSource = index === sourceIndex + 1;

            const isDropIndicatorHidden =
                (isItemBeforeSource && currentClosestEdge === 'bottom') || (isItemAfterSource && currentClosestEdge === 'top');

            if (isDropIndicatorHidden) {
                setClosestEdge(null);
                return;
            }

            setClosestEdge(currentClosestEdge);
        }

        return combine(
            draggable({
                element,
                dragHandle: dragHandleElement || undefined,
                getInitialData: () => data,
                onDragStart() {
                    setIsDragging(true);
                },
                onDrop() {
                    setIsDragging(false);
                },
            }),
            dropTargetForElements({
                element,
                canDrop({ source }) {
                    return isDragData(source.data) && source.data.instanceId === instanceId;
                },
                getData({ input }) {
                    return attachClosestEdge(data, {
                        element,
                        input,
                        allowedEdges: ['top', 'bottom'],
                    });
                },
                onDragEnter: onChange,
                onDrag: onChange,
                onDragLeave() {
                    setClosestEdge(null);
                },
                onDrop() {
                    setClosestEdge(null);
                },
            }),
        );
    }, [section, index, instanceId, createDragData, isDragData, onReorder, dragHandleElement]);

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
        <section ref={ref} style={{ opacity: isDragging ? 0.7 : 1, position: 'relative' }}>
            <SortableSection
                handleDelete={handleDelete}
                handleSort={(direction: 'up' | 'down') => handleManualSort({ id: section.id, direction })}
                dragHandleRef={setDragHandleElement}
            >
                {isTextSection(section) && <EditSectionText section={section} />}
                {isListSection(section) && <EditSectionList section={section} />}
            </SortableSection>
            <AddSection index={atIndex} />
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </section>
    );
};

export default EditSection;
