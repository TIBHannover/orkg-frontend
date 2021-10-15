import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { deleteListEntry, updateListEntry, updateListEntryDescription } from 'actions/literatureList';
import PaperCard from 'components/LiteratureList/PaperCard';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { toast } from 'react-toastify';
import { Button, ListGroupItem } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
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
// className={isHovering ? 'hover' : ''}
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
            message: 'Do you want to remove this item from the list?',
            cancelColor: 'light'
        });

        if (confirm) {
            dispatch(deleteListEntry({ statementId, sectionId }));
            toast.success('The entry has been deleted successfully');
        }
    };

    const handleUpdatePaper = async data => {
        dispatch(updateListEntry(data));
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
                <PaperCard paper={paper} contributions={paper.contributions} description={entry.description} showAddToComparison />
            </div>
            {isOpenEditModal && (
                <EditPaperDialog
                    paperData={paper}
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
