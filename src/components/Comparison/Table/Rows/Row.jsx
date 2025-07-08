import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { functions, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useEffect, useRef, useState } from 'react';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

export const rowKey = createDragDataKey('comparison-row');
export const createRowData = createDragDataFactory(rowKey);
export const isRowData = createDragDataValidator(rowKey);

const Row = ({ row, index, instanceId }) => {
    const { isEditMode } = useIsEditMode();
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState(null);
    const ref = useRef(null);
    const [dragHandle, setDragHandle] = useState(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || !isEditMode) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle,
            item: row,
            index,
            instanceId,
            createDragData: createRowData,
            isDragData: isRowData,
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
            onEdgeChange,
            onDragEnter: onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [row, index, instanceId, isEditMode, dragHandle]);

    return (
        <div
            ref={ref}
            style={{
                ...row.getRowProps()?.style,
                position: 'relative',
                opacity: isDragging ? 0.4 : 1,
            }}
            className={`comparisonRow tr p-0 ${isDragging ? 'shadow' : ''}`}
        >
            {row.cells.map((cell, cellIndex) => (
                <div
                    {...cell.getCellProps()}
                    className="td p-0"
                    key={cell.column.id}
                    ref={cellIndex === 0 ? setDragHandle : null}
                    style={{ ...(cell.getCellProps().style ?? {}), ...(cellIndex === 0 && isEditMode ? { cursor: 'move' } : {}) }}
                >
                    {cell.render('Cell')}
                </div>
            ))}
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

Row.propTypes = {
    row: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    instanceId: PropTypes.symbol.isRequired,
};

export default memo(Row, (prevProps, nextProps) =>
    isEqual(omit(prevProps.row.cells, functions(prevProps.row.cells)), omit(nextProps.row.cells, functions(nextProps.row.cells))),
);
