import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Confirm from 'components/Confirmation/Confirmation';
import { supportedContentTypes } from 'components/ContentType/types';
import PaperCard from 'components/PaperCard/PaperCard';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Button, ListGroupItem } from 'reactstrap';
import { deleteListEntry, listEntryUpdated, updateListEntryDescription } from 'slices/listSlice';
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
    const contentType = useSelector(state => state.list.contentTypes[entry.contentTypeId]);
    const [description, setDescription] = useState(entry.description?.label);
    const dispatch = useDispatch();
    const isPaper = contentType?.classes?.includes(CLASSES.PAPER);
    const contentTypeClass = contentType?.classes?.filter(classId => supportedContentTypes.find(c => c.id === classId))?.[0];

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
        dispatch(listEntryUpdated({ ...data, contentType: data.paper, ...data.paper }));
        if (entry.description?.id || description) {
            dispatch(updateListEntryDescription({ description, entryId: entry.entry.id, descriptionLiteralId: entry.description?.id, sectionId }));
        }
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
                className="position-relative p-0"
            >
                {isHovering && (
                    <Toolbar>
                        <Button color="secondary" className="px-2 py-0" onClick={handleDelete}>
                            <Icon icon={faTimes} />
                        </Button>
                        <SortableHandle />
                        {isPaper ? (
                            <Button color="secondary" className="px-2 py-0" onClick={handleEditPaper}>
                                <Icon icon={faPen} />
                            </Button>
                        ) : (
                            <Link to={reverse(ROUTES.CONTENT_TYPE, { id: contentType.id, type: contentTypeClass, mode: 'edit' })} target="_blank">
                                <Button color="secondary" className="px-2 py-0">
                                    <Icon icon={faPen} />
                                </Button>
                            </Link>
                        )}
                    </Toolbar>
                )}
                <PaperCard
                    showCurationFlags={false}
                    isListGroupItem={false}
                    showBreadcrumbs={false}
                    showCreator={false}
                    paper={{
                        ...contentType,
                        title: contentType.label
                    }}
                    description={entry.description}
                    showAddToComparison
                    linkTarget="_blank"
                    showContributionCount={true}
                    route={!isPaper ? reverse(ROUTES.CONTENT_TYPE, { id: contentType.id, type: contentTypeClass }) : undefined}
                />
            </div>
            {isOpenEditModal && (
                <EditPaperDialog
                    paperData={{
                        ...contentType,
                        paper: { label: contentType.label, id: contentType.id },
                        month: contentType.publicationMonth,
                        year: contentType.publicationYear
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
