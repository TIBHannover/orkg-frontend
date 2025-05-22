import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPen, faSort, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { AuthorTag, StyledDragHandle } from '@/components/Input/AuthorsInput/styled';
import ItemTypes from '@/constants/dndTypes';
import { Author } from '@/services/backend/types';
import { handleSortableHoverReactDnd } from '@/utils';

type SortableAuthorItemProps = {
    author: Author;
    authorIndex: number;
    editAuthor: (index: number) => void;
    removeAuthor: (index: number) => void;
    itemLabel: string;
    handleUpdate: ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => void;
    isDisabled: boolean;
};

const SortableAuthorItem: FC<SortableAuthorItemProps> = ({ author, authorIndex, editAuthor, removeAuthor, itemLabel, handleUpdate, isDisabled }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: ItemTypes.AUTHOR_TAG,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: authorIndex, handleUpdate }),
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.AUTHOR_TAG,
        item: { index: authorIndex },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => true && !isDisabled,
    });

    const opacity = isDragging ? 0.4 : 1;

    preview(drop(ref));

    return (
        <AuthorTag ref={ref} style={{ opacity }}>
            <StyledDragHandle className="ms-2 me-2" ref={drag}>
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
    );
};

export default SortableAuthorItem;
