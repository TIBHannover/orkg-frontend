import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPen, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { FC } from 'react';

import { Author } from '@/services/backend/types';

type SortableAuthorItemProps = {
    author: Author;
    authorIndex: number;
    editAuthor: (index: number) => void;
    removeAuthor: (index: number) => void;
    itemLabel: string;
    instanceId: symbol;
    moveItem: MoveItem;
    isDisabled: boolean;
};

const SortableAuthorItem: FC<SortableAuthorItemProps> = ({
    author,
    authorIndex,
    editAuthor,
    removeAuthor,
    itemLabel,
    instanceId,
    moveItem,
    isDisabled,
}) => {
    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index: authorIndex,
        isDisabled,
        moveItem,
        dragHandleLabel: 'Drag to reorder author',
    });

    return (
        <div ref={elementRef} className="relative py-0.5" style={{ opacity: isDragging ? 0.4 : 1 }}>
            <div className="flex rounded-xl overflow-hidden bg-default text-foreground select-none">
                <div
                    ref={dragHandleRef}
                    {...dragHandleProps}
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
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </div>
    );
};

export default SortableAuthorItem;
