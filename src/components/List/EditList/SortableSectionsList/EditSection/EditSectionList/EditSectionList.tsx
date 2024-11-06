import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import AddEntryModal from 'components/List/EditList/SortableSectionsList/EditSection/EditSectionList/AddEntryModal/AddEntryModal';
import EditSectionListItem from 'components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionListItem/EditSectionListItem';
import useList from 'components/List/hooks/useList';
import { FC, useState } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Alert, Button, ListGroup } from 'reactstrap';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from 'services/backend/types';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    .sortable-helper{
        z-index: 10000 !important;
        border-radius: 0 !important;
    }
`;

type SortableListProps = { entries: LiteratureListSectionListEntry[]; section: LiteratureListSectionList };

const SortableList = SortableContainer<SortableListProps>(({ entries, section }: SortableListProps) => (
    <ListGroup>
        {entries.map((entry, index) => (
            <EditSectionListItem key={entry.value.id} entry={entry} index={index} section={section} />
        ))}
    </ListGroup>
));

type EditSectionListProps = {
    section: LiteratureListSectionList;
};

const EditSectionList: FC<EditSectionListProps> = ({ section }) => {
    const { updateSection } = useList();
    const [isOpenAddEntryModal, setIsOpenAddEntryModal] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const handleSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        setIsSorting(false);
        if (oldIndex !== newIndex) {
            updateSection(section.id, {
                entries: arrayMove(section.entries, oldIndex, newIndex),
            });
        }
    };

    return (
        <>
            {section.entries.length === 0 && (
                <Alert color="info" className="mt-2" fade={false}>
                    No entries added yet
                </Alert>
            )}
            {section.entries.length > 0 && (
                <div className="mb-3 mt-2" style={{ pointerEvents: isSorting ? 'none' : 'all' }}>
                    <GlobalStyle />
                    <SortableList
                        entries={section.entries}
                        section={section}
                        onSortEnd={handleSortEnd}
                        updateBeforeSortStart={() => setIsSorting(true)}
                        lockAxis="y"
                        useDragHandle
                        helperClass="sortable-helper"
                    />
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

export default SortableElement<EditSectionListProps>(EditSectionList);
