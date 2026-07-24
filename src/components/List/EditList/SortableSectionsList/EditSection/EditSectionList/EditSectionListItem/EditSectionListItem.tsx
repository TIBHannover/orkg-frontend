import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, type ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { attachClosestEdge, type Edge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { FC, useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import Confirm from '@/components/Confirmation/Confirmation';
import { additionalContentTypes } from '@/components/ContentType/types';
import useList from '@/components/List/hooks/useList';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import { defaultDragHandleProps, type DragData, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from '@/services/backend/types';

type EditSectionListItemProps = {
    entry: LiteratureListSectionListEntry;
    section: LiteratureListSectionList;
    index: number;
    instanceId: symbol;
    createDragData: (params: { item: LiteratureListSectionListEntry; index: number; instanceId: symbol }) => DragData<LiteratureListSectionListEntry>;
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<LiteratureListSectionListEntry>;
    onReorder: (params: ReorderParams) => void;
};

const EditSectionListItem: FC<EditSectionListItemProps> = ({ entry, section, index, instanceId, createDragData, isDragData, onReorder }) => {
    const { updateSection, getPaperById, mutatePapers } = useList();
    const [isHovering, setIsHovering] = useState(false);
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    const isPaper = entry.value?.classes?.includes(CLASSES.PAPER);
    const contentTypeClass = entry.value?.classes?.filter((classId) => additionalContentTypes.find((c) => c.id === classId))?.[0];

    useEffect(() => {
        const element = ref.current;

        // Don't setup drag and drop if element is not available yet
        if (!element) {
            return undefined;
        }

        const data = createDragData({ item: entry, index, instanceId });

        function onChange({ source, self }: ElementDropTargetEventBasePayload) {
            const isSource = source.element === element;
            if (isSource) {
                setClosestEdge(null);
                return;
            }

            const currentClosestEdge = extractClosestEdge(self.data);
            const sourceIndex = source.data.index;
            invariant(typeof sourceIndex === 'number');

            const isItemBeforeSource = index === sourceIndex - 1;
            const isItemAfterSource = index === sourceIndex + 1;

            const isDropIndicatorHidden =
                (isItemBeforeSource && currentClosestEdge === 'bottom') || (isItemAfterSource && currentClosestEdge === 'top');

            if (isDropIndicatorHidden) {
                setClosestEdge(null);
                return;
            }

            setClosestEdge(currentClosestEdge);
        }

        return combine(
            draggable({
                element,
                dragHandle: dragHandleElement || undefined,
                getInitialData: () => data,
                onGenerateDragPreview({ nativeSetDragImage }) {
                    setCustomNativeDragPreview({
                        nativeSetDragImage,
                        render: ({ container }) => {
                            const preview = document.createElement('div');
                            preview.className =
                                'inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md max-w-xs truncate font-medium';
                            preview.textContent = entry.value?.label ?? 'List item';
                            container.appendChild(preview);
                        },
                    });
                },
                onDragStart() {
                    setIsDragging(true);
                },
                onDrop() {
                    setIsDragging(false);
                },
            }),
            dropTargetForElements({
                element,
                canDrop({ source }) {
                    return isDragData(source.data) && source.data.instanceId === instanceId;
                },
                getData({ input }) {
                    return attachClosestEdge(data, {
                        element,
                        input,
                        allowedEdges: ['top', 'bottom'],
                    });
                },
                onDragEnter: onChange,
                onDrag: onChange,
                onDragLeave() {
                    setClosestEdge(null);
                },
                onDrop() {
                    setClosestEdge(null);
                },
            }),
        );
    }, [entry, index, instanceId, onReorder, dragHandleElement, createDragData, isDragData]);

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
        <li className="block w-full min-w-0 bg-surface p-3 text-foreground" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div
                ref={ref}
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
                            ref={(el) => {
                                if (el) {
                                    setDragHandleElement(el);
                                }
                            }}
                            className="flex grow cursor-move items-center justify-center text-white [&_.sortable-handle]:w-full [&_.sortable-handle]:cursor-move"
                            {...defaultDragHandleProps}
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
                {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
            </div>
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
