import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { FC, useEffect, useRef, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
} from '@/components/shared/dnd/dragAndDropUtils';
import TemplateComponentProperty from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/Property/TemplateComponentProperty';
import TemplateComponentValue from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/Value/TemplateComponentValue';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape as PropertyShapeType } from '@/services/backend/types';

// Create shared symbols and functions for property shape drag and drop
export const propertyShapeKey = createDragDataKey('propertyShape');
export const createPropertyShapeData = createDragDataFactory<PropertyShapeType>(propertyShapeKey);
export const isPropertyShapeData = createDragDataValidator<PropertyShapeType>(propertyShapeKey);

type PropertyShapeProps = {
    id: number;
    instanceId: symbol;
    propertyShape: PropertyShapeType;
    handleDeletePropertyShape: (_index: number) => void;
    handlePropertiesSelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
    handleClassOfPropertySelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
};

const PropertyShape: FC<PropertyShapeProps> = ({
    id,
    instanceId,
    propertyShape,
    handleDeletePropertyShape,
    handlePropertiesSelect,
    handleClassOfPropertySelect,
}) => {
    const { isEditMode } = useIsEditMode();
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || !isEditMode) return undefined;

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: id,
            targetIndex: id,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement || undefined,
            item: propertyShape,
            index: id,
            instanceId,
            createDragData: createPropertyShapeData,
            isDragData: isPropertyShapeData,
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
            renderDragPreview: ({ container }) => {
                const preview = document.createElement('div');
                preview.className =
                    'inline-flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm shadow-md max-w-xs truncate font-medium';
                preview.textContent = propertyShape.path?.label ?? 'Property';
                container.appendChild(preview);
            },
        });
    }, [propertyShape, id, instanceId, dragHandleElement, isEditMode]);

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative border border-border rounded-sm mb-2 bg-surface overflow-hidden">
            <div className="flex flex-wrap items-stretch">
                <TemplateComponentProperty
                    id={id}
                    handleDeletePropertyShape={handleDeletePropertyShape}
                    handlePropertiesSelect={handlePropertiesSelect}
                    onDragHandleRef={setDragHandleElement}
                />
                <TemplateComponentValue id={id} handleClassOfPropertySelect={handleClassOfPropertySelect} />
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </div>
    );
};

export default PropertyShape;
