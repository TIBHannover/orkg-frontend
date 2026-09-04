import { type NestedReorderEvent, useNestedSortableList } from '@orkg/pragmatic-dnd-hooks';
import { isEqual } from 'lodash';
import { FC } from 'react';

import PathListItem from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/PathList/PathListItem/PathListItem';
import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';

type PathListProps = {
    paths: PathWithSettings[];
    handleReorder: (event: NestedReorderEvent) => void;
    handleToggleExpandPath: (path: string[]) => void;
    handleSelectPath: (path: string[]) => void;
    parentPathIds?: string[];
};

const PathList: FC<PathListProps> = ({ paths, handleReorder, handleToggleExpandPath, handleSelectPath, parentPathIds = [] }) => {
    // one sortable list per level: siblings reorder within their level only
    const { instanceId, moveItem } = useNestedSortableList({
        itemCount: paths.length,
        parentPath: parentPathIds,
        onReorder: handleReorder,
    });

    return (
        <ul className={`relative list-unstyled mb-0 ${parentPathIds.length !== 0 ? 'ml-6' : ''}`}>
            {paths.map((path) => (
                <PathListItem
                    key={parentPathIds.join('/') + path.id}
                    currentPath={path}
                    handleToggleExpandPath={handleToggleExpandPath}
                    handleSelectPath={handleSelectPath}
                    index={paths.findIndex((_property) => isEqual(_property.id, path.id))}
                    instanceId={instanceId}
                    moveItem={moveItem}
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
