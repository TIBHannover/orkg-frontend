import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { useCallback, useEffect, useState } from 'react';

import EditSection from '@/components/List/EditList/SortableSectionsList/EditSection/EditSection';
import useList from '@/components/List/hooks/useList';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createInstanceId,
    type ReorderParams,
} from '@/components/shared/dnd/dragAndDropUtils';
import Container from '@/components/Ui/Structure/Container';
import { LiteratureListSection } from '@/services/backend/types';

export type HandleManualSort = (params: { id: string; direction: 'up' | 'down' }) => void;

// Create shared symbols and functions for section drag and drop
const sectionDragKey = createDragDataKey('section');
const createSectionDragData = createDragDataFactory<LiteratureListSection>(sectionDragKey);
const isSectionDragData = createDragDataValidator<LiteratureListSection>(sectionDragKey);

const SortableSectionsList = () => {
    const { list, updateList } = useList();
    const [instanceId] = useState(() => createInstanceId('sortable-sections'));

    const reorderSections = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            if (!list) return;

            const finishIndex = getReorderDestinationIndex({
                startIndex,
                closestEdgeOfTarget,
                indexOfTarget,
                axis: 'vertical',
            });

            if (finishIndex === startIndex) {
                return;
            }

            const reorderedSections = reorder({
                list: list.sections,
                startIndex,
                finishIndex,
            });

            updateList({
                sections: reorderedSections,
            });
        },
        [list, updateList],
    );

    const handleManualSort: HandleManualSort = useCallback(
        ({ id, direction }) => {
            if (!list) return;

            const oldIndex = list.sections.findIndex((section) => section.id === id);
            const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;

            if (newIndex < 0 || newIndex >= list.sections.length || oldIndex === newIndex) {
                return;
            }

            reorderSections({
                startIndex: oldIndex,
                indexOfTarget: newIndex,
                closestEdgeOfTarget: null,
            });
        },
        [list, reorderSections],
    );

    useEffect(() => {
        if (!list) return undefined;

        return monitorForElements({
            canMonitor({ source }) {
                return isSectionDragData(source.data) && source.data.instanceId === instanceId;
            },
            onDrop({ location, source }) {
                const target = location.current.dropTargets[0];
                if (!target) {
                    return;
                }

                const sourceData = source.data;
                const targetData = target.data;

                if (!isSectionDragData(sourceData) || !isSectionDragData(targetData)) {
                    return;
                }

                const indexOfTarget = list.sections.findIndex((section) => section.id === targetData.item.id);
                if (indexOfTarget < 0) {
                    return;
                }

                const closestEdgeOfTarget = extractClosestEdge(targetData);

                reorderSections({
                    startIndex: sourceData.index,
                    indexOfTarget,
                    closestEdgeOfTarget,
                });
            },
        });
    }, [instanceId, list, reorderSections]);

    if (!list) {
        return null;
    }

    return (
        <Container className="position-relative p-0">
            {list.sections.map((section, index) => (
                <EditSection
                    key={section.id}
                    index={index}
                    section={section}
                    atIndex={index + 1}
                    instanceId={instanceId}
                    createDragData={createSectionDragData}
                    isDragData={isSectionDragData}
                    handleManualSort={handleManualSort}
                    onReorder={reorderSections}
                />
            ))}
        </Container>
    );
};

export default SortableSectionsList;
