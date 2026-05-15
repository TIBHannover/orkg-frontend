import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPen, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect, useRef, useState } from 'react';

import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import { Author } from '@/services/backend/types';

export const authorKey = createDragDataKey('sortableAuthor');
export const createAuthorData = createDragDataFactory<Author>(authorKey);
export const isAuthorData = createDragDataValidator<Author>(authorKey);

type SortableAuthorItemProps = {
    author: Author;
    authorIndex: number;
    editAuthor: (index: number) => void;
    removeAuthor: (index: number) => void;
    itemLabel: string;
    instanceId: symbol;
    totalItems: number;
    isDisabled: boolean;
};

const SortableAuthorItem: FC<SortableAuthorItemProps> = ({
    author,
    authorIndex,
    editAuthor,
    removeAuthor,
    itemLabel,
    instanceId,
    totalItems,
    isDisabled,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || isDisabled) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: authorIndex,
            targetIndex: authorIndex,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement || undefined,
            item: author,
            index: authorIndex,
            instanceId,
            createDragData: createAuthorData,
            isDragData: isAuthorData,
            onDragStart: () => {
                setIsDragging(true);
                setClosestEdge(null);
            },
            onDrop: () => {
                setIsDragging(false);
                setClosestEdge(null);
            },
            onEdgeChange,
            onDragEnter: onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [author, authorIndex, instanceId, totalItems, dragHandleElement, isDisabled]);

    return (
        <div ref={ref} className="relative" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div className="flex mb-1 rounded-xl overflow-hidden bg-default text-foreground select-none">
                <div
                    ref={setDragHandleElement}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to reorder author"
                    className="px-2.5 py-2 text-gray-400 hover:text-gray-600"
                    style={{ cursor: isDisabled ? 'default' : 'move' }}
                >
                    <FontAwesomeIcon icon={faSort} />
                </div>
                <div
                    className="flex-1 flex items-center px-2 py-2 truncate cursor-pointer"
                    onClick={() => !isDisabled && editAuthor(authorIndex)}
                    onKeyDown={(e) => (e.key === 'Enter' && !isDisabled ? editAuthor(authorIndex) : undefined)}
                    role="button"
                    tabIndex={0}
                >
                    {author.name}
                    {author.identifiers?.orcid?.[0] && <FontAwesomeIcon className="mx-1" icon={faOrcid} style={{ color: '#A6CE39' }} />}
                </div>
                {!isDisabled && (
                    <>
                        <div
                            className="px-2 py-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-default-200"
                            onClick={() => editAuthor(authorIndex)}
                            onKeyDown={(e) => (e.key === 'Enter' ? editAuthor(authorIndex) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            <FontAwesomeIcon icon={faPen} />
                        </div>
                        <div
                            title={`Delete ${itemLabel}`}
                            className="px-2 py-2 ml-0.5 cursor-pointer text-gray-400 hover:bg-danger-100 hover:text-danger"
                            onClick={() => removeAuthor(authorIndex)}
                            onKeyDown={(e) => (e.key === 'Enter' ? removeAuthor(authorIndex) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    </>
                )}
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default SortableAuthorItem;
