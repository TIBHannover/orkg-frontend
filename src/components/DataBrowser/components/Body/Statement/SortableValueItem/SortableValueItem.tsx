import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropIndicator, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { FC, ReactElement, useMemo } from 'react';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useListOrderingContext from '@/components/DataBrowser/context/ListOrderingContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { Statement } from '@/services/backend/types';

type SortableValueItemProps = {
    statement: Statement;
    children: ReactElement;
};

const SortableValueItem: FC<SortableValueItemProps> = ({ statement, children }) => {
    const { statements } = useEntity();
    const index = statements?.map((s) => s.id).indexOf(statement.id);
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const listOrdering = useListOrderingContext();
    const currentIndex = index ?? 0;

    // rendered outside Body's provider there is nothing to reorder against
    const fallbackInstanceId = useMemo(() => Symbol('sortable-value-item-detached'), []);

    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId: listOrdering?.instanceId ?? fallbackInstanceId,
        index: currentIndex,
        isDisabled: !isEditMode || !listOrdering,
        moveItem: listOrdering?.moveItem,
        requireDragHandle: true,
        dragHandleLabel: 'Drag to reorder list item',
    });

    const opacity = isDragging ? 0 : 1;

    return (
        <div ref={elementRef} className="flex items-center grow self-stretch -my-[4.5px] py-[4.5px] relative" style={{ opacity }}>
            {isEditMode && (
                <div className="px-2" ref={dragHandleRef} {...dragHandleProps} style={{ cursor: 'move' }}>
                    <FontAwesomeIcon icon={faGripVertical} className="text-secondary" />
                </div>
            )}
            {children}
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </div>
    );
};

export default SortableValueItem;
