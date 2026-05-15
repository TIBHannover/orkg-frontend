import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faSquareMinus, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useRef, useState } from 'react';

import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';
import { createDraggableItem, createEdgeChangeHandler, DragData } from '@/components/shared/dnd/dragAndDropUtils';

type PathListItemProps = {
    index: number;
    currentPath: PathWithSettings;
    handleToggleExpandPath: (path: string[]) => void;
    handleSelectPath: (path: string[]) => void;
    instanceId: symbol;
    createDragData: ({ item, index, instanceId }: { item: PathWithSettings; index: number; instanceId: symbol }) => DragData<PathWithSettings>;
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<PathWithSettings>;
    parentPathIds?: string[];
    nestedItems?: React.ReactNode;
};

const PathListItem: FC<PathListItemProps> = ({
    index,
    currentPath,
    handleToggleExpandPath,
    handleSelectPath,
    instanceId,
    createDragData,
    isDragData,
    parentPathIds = [],
    nestedItems,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);
    const ref = useRef<HTMLLIElement>(null);

    const hasChildren = currentPath.children && currentPath.children.length > 0;
    const { isExpanded, isSelected } = currentPath;

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const edgeChangeHandler = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            item: currentPath,
            index,
            dragHandle: dragHandleElement || undefined,
            instanceId,
            createDragData,
            isDragData,
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
            onEdgeChange: edgeChangeHandler,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [currentPath, index, instanceId, createDragData, isDragData, dragHandleElement]);

    const fullPath = [...parentPathIds, currentPath.id];

    return (
        <li ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative">
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

                <div className="border border-[#e4e4e4] rounded py-2 px-3 my-[2px] ml-3 grow flex items-center gap-3">
                    <span className="cursor-move opacity-50" ref={setDragHandleElement}>
                        <Icon className="text-secondary" icon={faGripVertical} size="lg" />
                    </span>
                    <Checkbox isSelected={!!isSelected} onChange={() => handleSelectPath(fullPath)}>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content className={!isSelected ? 'text-gray-500' : ''}>{currentPath.label}</Checkbox.Content>
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
            {closestEdge && <DropIndicator edge={closestEdge} />}
        </li>
    );
};

export default PathListItem;
