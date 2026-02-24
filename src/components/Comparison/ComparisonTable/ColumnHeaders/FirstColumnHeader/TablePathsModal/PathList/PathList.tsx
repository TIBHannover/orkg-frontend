import { isEqual, uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';

import PathListItem from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/PathList/PathListItem/PathListItem';
import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createInstanceId,
    createListMonitor,
    performReorder,
    type ReorderParams,
} from '@/components/shared/dnd/dragAndDropUtils';

const itemKey = createDragDataKey(uniqueId());
const createItemData = createDragDataFactory<PathWithSettings>(itemKey);
const isItemData = createDragDataValidator<PathWithSettings>(itemKey);

type PathListProps = {
    paths: PathWithSettings[];
    handleReorder: ({ newPathOrder, parentPathIds }: { newPathOrder: PathWithSettings[]; parentPathIds: string[] }) => void;
    handleToggleExpandPath: (path: string[]) => void;
    handleSelectPath: (path: string[]) => void;
    parentPathIds?: string[];
};

const PathList: FC<PathListProps> = ({ paths, handleReorder, handleToggleExpandPath, handleSelectPath, parentPathIds = [] }) => {
    const [instanceId] = useState(() => createInstanceId(uniqueId()));

    const reorderItems = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedItems = performReorder({
                items: paths,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedItems !== paths) {
                handleReorder({ newPathOrder: reorderedItems, parentPathIds });
            }
        },
        [paths, handleReorder, parentPathIds],
    );

    useEffect(() => {
        return createListMonitor({
            instanceId,
            items: paths,
            isDragData: isItemData,
            onReorder: reorderItems,
            getItemId: (item) => parentPathIds.join('/') + item.id,
        });
    }, [instanceId, parentPathIds, paths, reorderItems]);

    return (
        <ul className={`tw:relative list-unstyled mb-0 ${parentPathIds.length !== 0 ? 'ms-4' : ''}`}>
            {paths.map((path) => (
                <PathListItem
                    key={parentPathIds.join('/') + path.id}
                    currentPath={path}
                    handleToggleExpandPath={handleToggleExpandPath}
                    handleSelectPath={handleSelectPath}
                    index={paths.findIndex((_property) => isEqual(_property.id, path.id))}
                    instanceId={instanceId}
                    createDragData={createItemData}
                    isDragData={isItemData}
                    parentPathIds={parentPathIds}
                    nestedItems={
                        // add the nested items here to prevent a dependency cycle issue
                        <PathList
                            paths={path.children || []}
                            handleReorder={handleReorder}
                            handleToggleExpandPath={handleToggleExpandPath}
                            handleSelectPath={handleSelectPath}
                            parentPathIds={[...parentPathIds, path.id]}
                        />
                    }
                />
            ))}
        </ul>
    );
};

export default PathList;
