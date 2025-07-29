import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, type ElementDropTargetEventBasePayload } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, type Edge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faBars, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useEffect, useRef, useState } from 'react';
import { ListGroupItem } from 'reactstrap';
import styled from 'styled-components';
import invariant from 'tiny-invariant';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import Confirm from '@/components/Confirmation/Confirmation';
import { supportedContentTypes } from '@/components/ContentType/types';
import useList from '@/components/List/hooks/useList';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import { defaultDragHandleProps, type DragData, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import Button from '@/components/Ui/Button/Button';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { LiteratureListSectionList, LiteratureListSectionListEntry } from '@/services/backend/types';

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

const DragHandle = styled.div`
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-grow: 1;
`;

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
    const contentTypeClass = entry.value?.classes?.filter((classId) => supportedContentTypes.find((c) => c.id === classId))?.[0];

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
        <ListGroupItem action className="p-0" style={{ opacity: isDragging ? 0.4 : 1 }}>
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
                className="position-relative p-0"
            >
                {isHovering && (
                    <Toolbar>
                        <Button color="secondary" className="px-2 py-0" onClick={handleDelete}>
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        <DragHandle
                            ref={(el) => {
                                if (el) {
                                    setDragHandleElement(el);
                                }
                            }}
                            {...defaultDragHandleProps}
                        >
                            <FontAwesomeIcon icon={faBars} className="sortable-handle" />
                        </DragHandle>
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
                {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
            </div>
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={getPaperById(entry.value?.id)}
                    // @ts-expect-error - afterUpdate is not typed
                    afterUpdate={handleUpdatePaper}
                    toggle={(v: boolean) => setIsOpenEditModal(!v)}
                    isPaperLinkVisible
                />
            )}
        </ListGroupItem>
    );
};

export default EditSectionListItem;
