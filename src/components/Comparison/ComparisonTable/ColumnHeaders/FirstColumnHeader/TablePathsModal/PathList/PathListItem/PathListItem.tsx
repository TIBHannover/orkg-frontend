import { faSquareMinus, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Chip, Tooltip } from '@heroui/react';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import pluralize from 'pluralize';
import { FC } from 'react';

import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';

type PathListItemProps = {
    index: number;
    currentPath: PathWithSettings;
    handleToggleExpandPath: (path: string[]) => void;
    handleSelectPath: (path: string[]) => void;
    instanceId: symbol;
    moveItem: MoveItem;
    parentPathIds?: string[];
    nestedItems?: React.ReactNode;
};

const PathListItem: FC<PathListItemProps> = ({
    index,
    currentPath,
    handleToggleExpandPath,
    handleSelectPath,
    instanceId,
    moveItem,
    parentPathIds = [],
    nestedItems,
}) => {
    const hasChildren = currentPath.children && currentPath.children.length > 0;
    const { isExpanded, isSelected } = currentPath;

    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        moveItem,
        dragHandleLabel: 'Drag to reorder property',
    });

    const fullPath = [...parentPathIds, currentPath.id];

    return (
        <li ref={elementRef} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative">
            <div className="flex mr-2 items-center">
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    onPress={() => handleToggleExpandPath(fullPath)}
                    className="min-w-0 h-auto w-auto p-0 bg-transparent hover:bg-transparent text-secondary"
                    style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                >
                    <Icon icon={isExpanded ? faSquareMinus : faSquarePlus} size="lg" />
                </Button>

                <div className="border border-border rounded py-2 px-3 my-[2px] ml-3 grow flex items-center gap-3">
                    <span className="cursor-move opacity-50" ref={dragHandleRef} {...dragHandleProps}>
                        <Icon className="text-secondary" icon={faGripVertical} size="lg" />
                    </span>
                    <Checkbox isSelected={!!isSelected} onChange={() => handleSelectPath(fullPath)}>
                        <Checkbox.Content className={!isSelected ? 'text-gray-500' : ''}>
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <div className="flex flex-col">
                                <span>
                                    {currentPath.label}
                                    <Tooltip>
                                        <Tooltip.Trigger className="inline-flex">
                                            <Chip size="sm" className="mt-1 ml-2 h-auto py-0 text-xs">
                                                {currentPath.sources}
                                            </Chip>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>
                                            A total of {currentPath.sources ?? 0} {pluralize('source', currentPath.sources ?? 0)}{' '}
                                            {(currentPath.sources ?? 0) === 1 ? 'has' : 'have'} a value for this property
                                        </Tooltip.Content>
                                    </Tooltip>
                                </span>
                            </div>
                        </Checkbox.Content>
                    </Checkbox>
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        style={{ originX: 0, originY: 0 }}
                        initial={{ opacity: 0, scale: 0.5, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {nestedItems}
                    </motion.div>
                )}
            </AnimatePresence>
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </li>
    );
};

export default PathListItem;
