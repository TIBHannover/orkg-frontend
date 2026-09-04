import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import Link from 'next/link';
import { FC, useState } from 'react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import Confirm from '@/components/Confirmation/Confirmation';
import { additionalContentTypes } from '@/components/ContentType/types';
import useList from '@/components/List/hooks/useList';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from '@/services/backend/types';

type EditSectionListItemProps = {
    entry: LiteratureListSectionListEntry;
    section: LiteratureListSectionList;
    index: number;
    instanceId: symbol;
    moveItem: MoveItem;
};

const EditSectionListItem: FC<EditSectionListItemProps> = ({ entry, section, index, instanceId, moveItem }) => {
    const { updateSection, getPaperById, mutatePapers } = useList();
    const [isHovering, setIsHovering] = useState(false);
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);

    const isPaper = entry.value?.classes?.includes(CLASSES.PAPER);
    const contentTypeClass = entry.value?.classes?.filter((classId) => additionalContentTypes.find((c) => c.id === classId))?.[0];

    // the handle lives in the hover toolbar; rows must stay drop targets while
    // it is unmounted, so no `requireDragHandle` here
    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        moveItem,
        dragHandleLabel: 'Drag to reorder list item',
        previewOffset: 'preserve-offset-on-source',
        renderDragPreview: ({ container }) => {
            const preview = document.createElement('div');
            preview.className =
                'inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md max-w-xs truncate font-medium';
            preview.textContent = entry.value?.label ?? 'List item';
            container.appendChild(preview);
        },
    });

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Do you want to remove this item from the list?',
        });

        if (confirm) {
            updateSection(section.id, {
                entries: section.entries.filter((e) => e.value?.id !== entry.value?.id),
            });
        }
    };

    const handleUpdateDescription = async (description: string) => {
        updateSection(section.id, {
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
        <li ref={elementRef} className="relative block w-full min-w-0 bg-surface p-3 text-foreground" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div
                tabIndex={0}
                onFocus={() => {
                    setIsHovering(true);
                }}
                onMouseEnter={() => {
                    setIsHovering(true);
                }}
                onMouseLeave={() => {
                    setIsHovering(false);
                }}
                role="presentation"
                className="relative p-0"
            >
                {isHovering && (
                    <div className="absolute left-1/2 -top-3.75 z-100 flex h-7.5 w-50 -translate-x-1/2 items-center justify-between rounded-md bg-secondary-solid px-0.5">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            className="h-6 min-w-0 px-2 py-0 text-white hover:bg-white/10"
                            onPress={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <div
                            ref={dragHandleRef}
                            {...dragHandleProps}
                            className="flex grow cursor-move items-center justify-center text-white [&_.sortable-handle]:w-full [&_.sortable-handle]:cursor-move"
                        >
                            <FontAwesomeIcon icon={faBars} className="sortable-handle" />
                        </div>
                        {isPaper ? (
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                className="h-6 min-w-0 px-2 py-0 text-white hover:bg-white/10"
                                onPress={handleEditPaper}
                            >
                                <FontAwesomeIcon icon={faPen} />
                            </Button>
                        ) : (
                            <Link
                                href={`${reverse(ROUTES.CONTENT_TYPE, { id: entry.value?.id, type: contentTypeClass })}?isEditMode=true`}
                                target="_blank"
                            >
                                <Button isIconOnly size="sm" variant="ghost" className="h-6 min-w-0 px-2 py-0 text-white hover:bg-white/10">
                                    <FontAwesomeIcon icon={faPen} />
                                </Button>
                            </Link>
                        )}
                    </div>
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
            {closestEdge && (
                <DropIndicator
                    edge={closestEdge}
                    gap="0px"
                    terminal="no-bleed"
                    className="text-primary"
                    style={closestEdge === 'bottom' ? { bottom: -2 } : undefined}
                />
            )}
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={getPaperById(entry.value?.id) ?? null}
                    afterUpdate={handleUpdatePaper}
                    toggle={() => setIsOpenEditModal(false)}
                    isPaperLinkVisible
                />
            )}
        </li>
    );
};

export default EditSectionListItem;
