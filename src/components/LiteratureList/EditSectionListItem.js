import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/PaperCard/PaperCard';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Button, ListGroupItem } from 'reactstrap';
import Confirm from 'components/Confirmation/Confirmation';
import { deleteListEntry, listEntryUpdated, updateListEntryDescription } from 'slices/literatureListSlice';
import styled from 'styled-components';

const Toolbar = styled.div`
    width: 200px;
    background: ${props => props.theme.secondary};
    height: 30px;
    left: 50%;
    margin-left: -100px;
    position: absolute;
    z-index: 100;
    top: -15px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2px;

    .sortable-handle {
        cursor: move;
        width: 100%;
    }
`;

const SortableHandle = sortableHandle(() => <Icon icon={faBars} className="text-white sortable-handle" />);

const EditSectionListItem = ({ entry, sectionId, statementId }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const paper = useSelector(state => state.literatureList.papers[entry.paperId]);
    const [description, setDescription] = useState(entry.description?.label);
    const dispatch = useDispatch();

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this item from the list?'
        });

        if (confirm) {
            dispatch(deleteListEntry({ statementId, sectionId }));
        }
    };

    const handleUpdatePaper = async data => {
        dispatch(listEntryUpdated(data));
        dispatch(updateListEntryDescription({ description, entryId: entry.entry.id, descriptionLiteralId: entry.description?.id, sectionId }));
        setIsOpenEditModal(false);
    };

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);
    };

    const additionalFields = {
        description: {
            label: 'Description',
            type: 'textarea',
            value: description,
            onChange: e => setDescription(e.target.value)
        }
    };

    return (
        <ListGroupItem action className="p-0">
            <div
                tabIndex="0"
                onFocus={() => setIsHovering(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                role="presentation"
                className="position-relative p-2"
            >
                {isHovering && (
                    <Toolbar>
                        <Button color="secondary" className="px-2 py-0" onClick={handleDelete}>
                            <Icon icon={faTimes} />
                        </Button>
                        <SortableHandle />
                        <Button color="secondary" className="px-2 py-0" onClick={handleEditPaper}>
                            <Icon icon={faPen} />
                        </Button>
                    </Toolbar>
                )}
                <PaperCard
                    isListGroupItem={false}
                    showBreadcrumbs={false}
                    showCreator={false}
                    paper={{
                        ...paper,
                        title: paper.label
                    }}
                    description={entry.description}
                    showAddToComparison
                />
            </div>
            {isOpenEditModal && (
                <EditPaperDialog
                    paperData={{
                        ...paper,
                        paper: { label: paper.label, id: paper.id },
                        month: paper.publicationMonth,
                        year: paper.publicationYear
                    }}
                    afterUpdate={handleUpdatePaper}
                    toggle={v => setIsOpenEditModal(!v)}
                    isOpen
                    showPaperLink
                    additionalFields={additionalFields}
                />
            )}
        </ListGroupItem>
    );
};

EditSectionListItem.propTypes = {
    entry: PropTypes.object.isRequired,
    sectionId: PropTypes.string.isRequired,
    statementId: PropTypes.string.isRequired
};

export default SortableElement(EditSectionListItem);
