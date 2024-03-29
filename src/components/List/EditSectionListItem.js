import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import Confirm from 'components/Confirmation/Confirmation';
import { supportedContentTypes } from 'components/ContentType/types';
import Link from 'components/NextJsMigration/Link';
import EditPaperModal from 'components/PaperForm/EditPaperModal';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Button, ListGroupItem } from 'reactstrap';
import { getPaper } from 'services/backend/papers';
import { deleteListEntry, listEntryUpdated } from 'slices/listSlice';
import styled from 'styled-components';
import { convertPaperToNewFormat } from 'utils';

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
    const dispatch = useDispatch();
    const isPaper = contentType?.classes?.includes(CLASSES.PAPER);
    const contentTypeClass = contentType?.classes?.filter(classId => supportedContentTypes.find(c => c.id === classId))?.[0];
    const [paperData, setPaperData] = useState({});

    useEffect(() => {
        const getData = async () => {
            if (isOpenEditModal) {
                setPaperData(await getPaper(contentType.id));
            }
        };
        getData();
    }, [contentType.id, isOpenEditModal]);

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this item from the list?',
        });

        if (confirm) {
            dispatch(deleteListEntry({ statementId, sectionId }));
        }
    };

    const handleUpdatePaper = async data => {
        dispatch(
            listEntryUpdated({
                // TODO: the data model of lists should be updated to use the same model as the paper form, then this mapping of updated data is not needed anymore
                contentType: { id: contentType.id },
                label: data.title,
                authors: data.authors.map(author => ({
                    id: author.id,
                    label: author.name,
                })),
                publicationMonth: data.publication_info?.published_month ? { label: data.publication_info?.published_month } : null,
                publicationYear: data.publication_info?.published_year ? { label: data.publication_info?.published_year } : null,
            }),
        );
        setIsOpenEditModal(false);
    };

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);
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
                            <Link
                                href={`${reverse(ROUTES.CONTENT_TYPE, { id: contentType.id, type: contentTypeClass })}?isEditMode=true`}
                                target="_blank"
                            >
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
                    paper={convertPaperToNewFormat(contentType)}
                    description={entry.description}
                    showAddToComparison
                    linkTarget="_blank"
                    showContributionCount={true}
                    route={!isPaper ? reverse(ROUTES.CONTENT_TYPE, { id: contentType.id, type: contentTypeClass }) : undefined}
                />
            </div>
            {isOpenEditModal && (
                <EditPaperModal paperData={paperData} afterUpdate={handleUpdatePaper} toggle={v => setIsOpenEditModal(!v)} isPaperLinkVisible />
            )}
        </ListGroupItem>
    );
};

EditSectionListItem.propTypes = {
    entry: PropTypes.object.isRequired,
    sectionId: PropTypes.string.isRequired,
    statementId: PropTypes.string.isRequired,
};

export default SortableElement(EditSectionListItem);
