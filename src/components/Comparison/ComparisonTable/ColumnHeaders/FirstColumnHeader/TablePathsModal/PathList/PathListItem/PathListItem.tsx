import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faSquareMinus, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useId, useRef, useState } from 'react';

import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';
import { createDraggableItem, createEdgeChangeHandler, DragData } from '@/components/shared/dnd/dragAndDropUtils';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';

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
    const id = useId();
    const ref = useRef<HTMLLIElement>(null);

    const hasChildren = currentPath.children && currentPath.children.length > 0;
    const { isExpanded, isSelected } = currentPath;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const edgeChangeHandler = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        createDraggableItem({
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
        <li ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }} className="tw:relative">
            <div className="d-flex me-2">
                <Button
                    color="link"
                    onClick={() => handleToggleExpandPath(fullPath)}
                    className="p-0 text-secondary"
                    style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                >
                    <Icon icon={isExpanded ? faSquareMinus : faSquarePlus} size="lg" />
                </Button>

                <div className="tw:border tw:border-[#e4e4e4] tw:rounded tw:py-2 tw:px-3 tw:my-[2px] tw:ml-3 tw:flex-grow">
                    <span className="tw:cursor-move tw:me-4 tw:ms-1 tw:py-3 tw:opacity-50" ref={setDragHandleElement}>
                        <Icon className="text-secondary" icon={faGripVertical} size="lg" />
                    </span>
                    <Input type="checkbox" checked={!!isSelected} onChange={() => handleSelectPath(fullPath)} className="me-3" id={id} />
                    <label htmlFor={id} className={`${!isSelected ? 'text-muted' : ''}`}>
                        {currentPath.label}
                    </label>
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
