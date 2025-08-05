import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useCallback, useEffect, useState } from 'react';

import AddEntryModal from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/AddEntryModal/AddEntryModal';
import EditSectionListItem from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionListItem/EditSectionListItem';
import useList from '@/components/List/hooks/useList';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createInstanceId,
    type ReorderParams,
} from '@/components/shared/dnd/dragAndDropUtils';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import ListGroup from '@/components/Ui/List/ListGroup';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from '@/services/backend/types';

type EditSectionListProps = {
    section: LiteratureListSectionList;
};

// Create shared symbols and functions for this list type
const editSectionListKey = createDragDataKey('editSectionList');
const createEditSectionListData = createDragDataFactory<LiteratureListSectionListEntry>(editSectionListKey);
const isEditSectionListData = createDragDataValidator<LiteratureListSectionListEntry>(editSectionListKey);

const EditSectionList: FC<EditSectionListProps> = ({ section }) => {
    const { updateSection } = useList();
    const [isOpenAddEntryModal, setIsOpenAddEntryModal] = useState(false);
    const [instanceId] = useState(() => createInstanceId('edit-section-list'));

    const reorderEntries = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const finishIndex = getReorderDestinationIndex({
                startIndex,
                closestEdgeOfTarget,
                indexOfTarget,
                axis: 'vertical',
            });

            if (finishIndex === startIndex) {
                return;
            }

            const reorderedEntries = reorder({
                list: section.entries,
                startIndex,
                finishIndex,
            });

            updateSection(section.id, {
                entries: reorderedEntries,
            });
        },
        [section.entries, section.id, updateSection],
    );

    useEffect(() => {
        return monitorForElements({
            canMonitor({ source }) {
                return isEditSectionListData(source.data) && source.data.instanceId === instanceId;
            },
            onDrop({ location, source }) {
                const target = location.current.dropTargets[0];
                if (!target) {
                    return;
                }

                const sourceData = source.data;
                const targetData = target.data;

                if (!isEditSectionListData(sourceData) || !isEditSectionListData(targetData)) {
                    return;
                }

                const indexOfTarget = section.entries.findIndex((entry) => entry.value?.id === targetData.item.value?.id);
                if (indexOfTarget < 0) {
                    return;
                }

                const closestEdgeOfTarget = extractClosestEdge(targetData);

                reorderEntries({
                    startIndex: sourceData.index,
                    indexOfTarget,
                    closestEdgeOfTarget,
                });
            },
        });
    }, [instanceId, section.entries, reorderEntries]);

    return (
        <>
            {section.entries.length === 0 && (
                <Alert color="info" className="mt-2" fade={false}>
                    No entries added yet
                </Alert>
            )}
            {section.entries.length > 0 && (
                <div className="mb-3 mt-2">
                    <ListGroup>
                        {section.entries.map((entry, index) => (
                            <EditSectionListItem
                                key={entry.value.id}
                                entry={entry}
                                index={index}
                                section={section}
                                instanceId={instanceId}
                                createDragData={createEditSectionListData}
                                isDragData={isEditSectionListData}
                                onReorder={reorderEntries}
                            />
                        ))}
                    </ListGroup>
                </div>
            )}
            <Button color="secondary" size="sm" className="mb-2" onClick={() => setIsOpenAddEntryModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add entries
            </Button>

            {isOpenAddEntryModal && <AddEntryModal toggle={() => setIsOpenAddEntryModal((v) => !v)} section={section} />}
        </>
    );
};

export default EditSectionList;
