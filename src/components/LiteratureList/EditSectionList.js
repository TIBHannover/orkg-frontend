import { faLightbulb, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddEntryModal from 'components/LiteratureList/AddEntryModal';
import EditSectionListItem from 'components/LiteratureList/EditSectionListItem';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import { Button, ListGroup } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import { sortListEntries } from 'actions/literatureList';

const SortableList = SortableContainer(({ items, papers, section, handleManualSort }) => (
    <ListGroup>
        {items.map((item, index) => {
            return (
                <EditSectionListItem
                    key={`item${item.statementId}`}
                    entry={item}
                    index={index}
                    statementId={item.statementId}
                    sectionId={section.id}
                />
            );
        })}
    </ListGroup>
));

const EditSectionList = ({ section }) => {
    const [isOpenAddEntryModal, setIsOpenAddEntryModal] = useState(false);
    const papers = useSelector(state => state.literatureList.papers);
    const [isSorting, setIsSorting] = useState(false);
    const dispatch = useDispatch();

    const handleSortEnd = ({ oldIndex, newIndex }) => {
        setIsSorting(false);
        if (oldIndex !== newIndex) {
            dispatch(sortListEntries({ sectionId: section.id, entries: section.entries, oldIndex, newIndex }));
        }
    };

    return (
        <>
            <div className="mb-3 mt-2" style={{ pointerEvents: isSorting ? 'none' : 'all' }}>
                <SortableList
                    items={section.entries}
                    papers={papers}
                    section={section}
                    onSortEnd={handleSortEnd}
                    updateBeforeSortStart={() => setIsSorting(true)}
                    lockAxis="y"
                    useDragHandle
                    helperClass="sortableHelper"
                />
            </div>
            <Button color="secondary" size="sm" className="mb-2" onClick={() => setIsOpenAddEntryModal(true)}>
                <Icon icon={faPlus} className="mr-2" />
                Add entries
            </Button>
            <AddEntryModal sectionId={section.id} />
            <Button color="light" size="sm" className="mb-2 ml-2">
                <Icon icon={faLightbulb} className="mr-2" />
                Related papers
            </Button>
            {isOpenAddEntryModal && <AddEntryModal isOpen={isOpenAddEntryModal} setIsOpen={setIsOpenAddEntryModal} sectionId={section.id} />}
        </>
    );
};

EditSectionList.propTypes = {
    section: PropTypes.object.isRequired
};

export default SortableElement(EditSectionList);
