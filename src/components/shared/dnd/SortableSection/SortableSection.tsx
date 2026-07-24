import { faArrowDown, faArrowUp, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC, useState } from 'react';

import { defaultDragHandleProps } from '@/components/shared/dnd/dragAndDropUtils';

export type SortableSectionProps = {
    handleDelete: () => void;
    handleSort: (direction: 'up' | 'down') => void;
    children: React.ReactNode;
    dragHandleRef?: (element: HTMLElement | null) => void;
    className?: string;
};

const SortableSection: FC<SortableSectionProps> = ({ handleDelete, handleSort, children, dragHandleRef, className = 'box rounded' }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            tabIndex={0}
            role="presentation"
            className={`relative px-10 py-2.5 [&_a]:underline ${className}`}
            onFocus={() => setIsHovering(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {isHovering && (
                <Button
                    isIconOnly
                    size="sm"
                    variant="primary"
                    aria-label="Delete section"
                    onPress={handleDelete}
                    className="absolute -top-2 -left-1 z-1 h-6 min-w-6"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            )}
            <div
                ref={dragHandleRef}
                {...defaultDragHandleProps}
                aria-label="Drag to reorder section"
                className={`absolute left-0 top-0 z-0 flex h-full w-[25px] cursor-move items-center justify-center rounded-l-md ${
                    isHovering ? 'bg-secondary-solid text-white' : 'text-muted'
                }`}
            >
                <FontAwesomeIcon icon={faBars} />
            </div>
            {isHovering && (
                <>
                    <div className="absolute left-0 top-[25px] w-[25px]">
                        <Tooltip>
                            <Button
                                isIconOnly
                                size="sm"
                                aria-label="Move section up"
                                onPress={() => handleSort('up')}
                                className="h-6 w-full min-w-0 bg-secondary-solid text-white hover:bg-secondary-solid-hover"
                            >
                                <FontAwesomeIcon icon={faArrowUp} />
                            </Button>
                            <Tooltip.Content>Move up</Tooltip.Content>
                        </Tooltip>
                    </div>
                    <div className="absolute left-0 top-[calc(100%-30px)] w-[25px]">
                        <Tooltip>
                            <Button
                                isIconOnly
                                size="sm"
                                aria-label="Move section down"
                                onPress={() => handleSort('down')}
                                className="h-6 w-full min-w-0 bg-secondary-solid text-white hover:bg-secondary-solid-hover"
                            >
                                <FontAwesomeIcon icon={faArrowDown} />
                            </Button>
                            <Tooltip.Content>Move down</Tooltip.Content>
                        </Tooltip>
                    </div>
                </>
            )}
            {children}
        </div>
    );
};

export default SortableSection;
