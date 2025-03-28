import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import { FC, ReactElement, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'react-toastify';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useOriginalOrder from '@/components/DataBrowser/hooks/useOriginalOrder';
import DND_TYPES from '@/constants/dndTypes';
import { updateList } from '@/services/backend/lists';
import { Statement } from '@/services/backend/types';
import { handleSortableHoverReactDnd } from '@/utils';

type SortableValueItemProps = {
    statement: Statement;
    children: ReactElement;
};

const SortableValueItem: FC<SortableValueItemProps> = ({ statement, children }) => {
    const { statements, mutateStatements } = useEntity();
    const index = statements?.map((s) => s.id).indexOf(statement.id);

    const { originalOrder, mutateOriginalOrder } = useOriginalOrder(statement.subject.id);

    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const ref = useRef(null);
    const originalIndex = originalOrder?.elements?.indexOf(statement.id) ?? index;

    const handleUpdate = ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => {
        const _valueIds = arrayMove(statements?.map((s) => s.object.id) ?? [], dragIndex, hoverIndex);
        if (statements) {
            mutateStatements(_valueIds.map((id) => statements.find((s) => s.object.id === id) ?? null) as Statement[], { revalidate: false });
        }
    };

    const [, drop] = useDrop({
        accept: DND_TYPES.LIST_ITEM,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: index, handleUpdate }),
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: DND_TYPES.LIST_ITEM,
        item: { index, originalIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isEditMode,
        end: (item) => {
            if (item.index !== item.originalIndex) {
                updateList({ id: statement.subject.id, elements: statements?.map((s) => s.object.id) ?? [] });
                mutateOriginalOrder();
                toast.dismiss();
                toast.success('Order updated successfully');
            }
        },
    });

    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    return (
        <div ref={ref} className="d-flex align-items-center flex-grow-1 m-0 p-0" style={{ opacity }}>
            {isEditMode && (
                <div className="px-2" ref={drag} style={{ cursor: 'move' }}>
                    <FontAwesomeIcon icon={faGripVertical} className="text-secondary" />
                </div>
            )}
            {children}
        </div>
    );
};

export default SortableValueItem;
