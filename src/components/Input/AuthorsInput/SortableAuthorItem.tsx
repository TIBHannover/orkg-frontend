import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPen, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect, useRef, useState } from 'react';

import { AuthorTag, StyledDragHandle } from '@/components/Input/AuthorsInput/styled';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import { Author } from '@/services/backend/types';

// Create shared symbols and functions for author drag and drop
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

    const opacity = isDragging ? 0.4 : 1;

    return (
        <div ref={ref} style={{ opacity, position: 'relative' }}>
            <AuthorTag>
                <StyledDragHandle
                    className="ms-2 me-2"
                    ref={setDragHandleElement}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag to reorder author"
                    style={{ cursor: isDisabled ? 'default' : 'move' }}
                >
                    <FontAwesomeIcon icon={faSort} />
                </StyledDragHandle>
                <div
                    className="name"
                    onClick={() => !isDisabled && editAuthor(authorIndex)}
                    onKeyDown={(e) => (e.key === 'Enter' && !isDisabled ? editAuthor(authorIndex) : undefined)}
                    role="button"
                    tabIndex={0}
                >
                    {author.name}
                    {author.identifiers?.orcid?.[0] && <FontAwesomeIcon style={{ margin: '4px' }} icon={faOrcid} />}
                </div>
                {!isDisabled && (
                    <>
                        <div
                            style={{ padding: '8px' }}
                            onClick={() => editAuthor(authorIndex)}
                            onKeyDown={(e) => (e.key === 'Enter' ? editAuthor(authorIndex) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            <FontAwesomeIcon icon={faPen} />
                        </div>
                        <div
                            title={`Delete ${itemLabel}`}
                            className="delete"
                            onClick={() => removeAuthor(authorIndex)}
                            onKeyDown={(e) => (e.key === 'Enter' ? removeAuthor(authorIndex) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    </>
                )}
            </AuthorTag>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default SortableAuthorItem;
