import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { ItemHeader, ItemHeaderInner } from '@/components/Comparison/styled';
import ContributionCell from '@/components/Comparison/Table/Cells/ContributionCell';
import PropertyCell from '@/components/Comparison/Table/Cells/PropertyCell';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

// Create shared symbols and functions for column header drag and drop
export const columnHeaderKey = createDragDataKey('columnHeader');
export const createColumnHeaderData = createDragDataFactory(columnHeaderKey);
export const isColumnHeaderData = createDragDataValidator(columnHeaderKey);

const ColumnHeader = ({ headerData, columnId, columnStyle, property, index, instanceId, totalColumns }) => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const { isEditMode } = useIsEditMode();
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || !isEditMode) {
            return undefined;
        }

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            item: headerData,
            index,
            instanceId,
            createDragData: createColumnHeaderData,
            isDragData: isColumnHeaderData,
            allowedEdges: ['left', 'right'],
            onDragStart: () => {
                setIsDragging(true);
                setClosestEdge(null);
            },
            onDrop: () => {
                setIsDragging(false);
                setClosestEdge(null);
            },
            onEdgeChange,
            onDragEnter: onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [headerData, columnId, index, instanceId, totalColumns, isEditMode]);

    return (
        <div
            ref={ref}
            className={`th p-0 ${isDragging ? 'shadow' : ''}`}
            style={{
                ...columnStyle,
                opacity: isDragging ? 0.4 : 1,
                position: 'relative',
                cursor: isEditMode ? 'move' : 'default',
            }}
        >
            {!transpose ? (
                <ItemHeader key={`contribution${headerData.id}`}>
                    <ItemHeaderInner>
                        <ContributionCell contribution={headerData} />
                    </ItemHeaderInner>
                </ItemHeader>
            ) : (
                <ItemHeader key={`property${headerData.id}`}>
                    <ItemHeaderInner className="d-flex flex-row align-items-center justify-content-between" $transpose={transpose}>
                        <PropertyCell
                            similar={headerData.similar}
                            label={headerData.label}
                            id={headerData.id}
                            group={headerData.group ?? false}
                            grouped={headerData.grouped ?? false}
                            property={property}
                        />
                    </ItemHeaderInner>
                </ItemHeader>
            )}
            {closestEdge && isEditMode && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

ColumnHeader.propTypes = {
    columnId: PropTypes.string.isRequired,
    columnStyle: PropTypes.object.isRequired,
    headerData: PropTypes.object.isRequired,
    property: PropTypes.object,
    index: PropTypes.number.isRequired,
    instanceId: PropTypes.symbol.isRequired,
    totalColumns: PropTypes.number.isRequired,
};

export default ColumnHeader;
