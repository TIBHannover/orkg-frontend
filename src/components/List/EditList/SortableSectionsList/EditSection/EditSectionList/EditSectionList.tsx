import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';
import { reorderList, useAutoScroll, useSortableList } from '@orkg/pragmatic-dnd-hooks';
import { FC, useState } from 'react';

import AddEntryModal from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/AddEntryModal/AddEntryModal';
import EditSectionListItem from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionListItem/EditSectionListItem';
import useList from '@/components/List/hooks/useList';
import { LiteratureListSectionList } from '@/services/backend/types';

type EditSectionListProps = {
    section: LiteratureListSectionList;
};

const EditSectionList: FC<EditSectionListProps> = ({ section }) => {
    const { updateSection } = useList();
    const [isOpenAddEntryModal, setIsOpenAddEntryModal] = useState(false);

    // per-section list: entries can only reorder within their own section
    const { instanceId, moveItem } = useSortableList({
        itemCount: section.entries.length,
        onReorder: (event) => {
            updateSection(section.id, {
                entries: reorderList(section.entries, event),
            });
        },
    });

    useAutoScroll({ instanceId, includeWindow: true });

    return (
        <>
            {section.entries.length === 0 && (
                <Alert status="accent" className="mt-2 rounded-2xl flex-row items-center">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>No entries added yet</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}
            {section.entries.length > 0 && (
                <div className="mb-4 mt-2">
                    <ul className="m-0 flex w-full flex-col divide-y divide-border overflow-hidden rounded-(--radius) border border-border bg-surface p-0 list-none">
                        {section.entries.map((entry, index) => (
                            <EditSectionListItem
                                key={`${entry.value?.id ?? 'no-id'}-${index}`}
                                entry={entry}
                                index={index}
                                section={section}
                                instanceId={instanceId}
                                moveItem={moveItem}
                            />
                        ))}
                    </ul>
                </div>
            )}
            <Button variant="secondary" size="sm" className="mb-2 mt-2" onPress={() => setIsOpenAddEntryModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add entries
            </Button>
            {isOpenAddEntryModal && <AddEntryModal toggle={() => setIsOpenAddEntryModal((v) => !v)} section={section} />}
        </>
    );
};

export default EditSectionList;
