import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import Confirm from 'components/Confirmation/Confirmation';
import { supportedContentTypes } from 'components/ContentType/types';
import useList from 'components/List/hooks/useList';
import EditPaperModal from 'components/PaperForm/EditPaperModal';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Button, ListGroupItem } from 'reactstrap';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from 'services/backend/types';
import styled from 'styled-components';

const Toolbar = styled.div`
    width: 200px;
    background: ${(props) => props.theme.secondary};
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

const SortableHandleComponent = SortableHandle(() => <FontAwesomeIcon icon={faBars} className="text-white sortable-handle" />);

type EditSectionListItemProps = {
    entry: LiteratureListSectionListEntry;
    section: LiteratureListSectionList;
};

const EditSectionListItem: FC<EditSectionListItemProps> = ({ entry, section }) => {
    const { updateListSection, getPaperById, mutatePapers } = useList();
    const [isHovering, setIsHovering] = useState(false);
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const isPaper = entry.value?.classes?.includes(CLASSES.PAPER);
    const contentTypeClass = entry.value?.classes?.filter((classId) => supportedContentTypes.find((c) => c.id === classId))?.[0];

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this item from the list?',
        });

        if (confirm) {
            updateListSection(section.id, {
                entries: section.entries.filter((e) => e.value?.id !== entry.value?.id),
            });
        }
    };

    const handleUpdateDescription = async (description: string) => {
        updateListSection(section.id, {
            entries: section.entries.map((e) => {
                if (e.value?.id === entry.value?.id) {
                    return {
                        ...e,
                        description,
                    };
                }
                return e;
            }),
        });
    };

    const handleUpdatePaper = async () => {
        mutatePapers();
        setIsOpenEditModal(false);
    };

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);
    };

    return (
        <ListGroupItem action className="p-0">
            <div
                tabIndex={0}
                onFocus={() => setIsHovering(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                role="presentation"
                className="position-relative p-0"
            >
                {isHovering && (
                    <Toolbar>
                        <Button color="secondary" className="px-2 py-0" onClick={handleDelete}>
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <SortableHandleComponent />
                        {isPaper ? (
                            <Button color="secondary" className="px-2 py-0" onClick={handleEditPaper}>
                                <FontAwesomeIcon icon={faPen} />
                            </Button>
                        ) : (
                            <Link
                                href={`${reverse(ROUTES.CONTENT_TYPE, { id: entry.value?.id, type: contentTypeClass })}?isEditMode=true`}
                                target="_blank"
                            >
                                <Button color="secondary" className="px-2 py-0">
                                    <FontAwesomeIcon icon={faPen} />
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
                    paper={getPaperById(entry.value?.id) || { title: entry.value?.label }}
                    description={entry.description}
                    showAddToComparison
                    linkTarget="_blank"
                    showContributionCount={isPaper}
                    isDescriptionEditable
                    handleUpdateDescription={handleUpdateDescription}
                    route={!isPaper ? reverse(ROUTES.CONTENT_TYPE, { id: entry.value?.id, type: contentTypeClass }) : undefined}
                />
            </div>
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={getPaperById(entry.value?.id)}
                    // @ts-expect-error this is still a JS component
                    afterUpdate={handleUpdatePaper}
                    toggle={(v) => setIsOpenEditModal(!v)}
                    isPaperLinkVisible
                />
            )}
        </ListGroupItem>
    );
};

export default SortableElement<EditSectionListItemProps>(EditSectionListItem);
