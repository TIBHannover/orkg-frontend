import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import { FC } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import TemplateComponentProperty from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/Property/TemplateComponentProperty';
import TemplateComponentValue from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/Value/TemplateComponentValue';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape as PropertyShapeType } from '@/services/backend/types';

type PropertyShapeProps = {
    id: number;
    instanceId: symbol;
    moveItem: MoveItem;
    propertyShape: PropertyShapeType;
    handleDeletePropertyShape: (_index: number) => void;
    handlePropertiesSelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
    handleClassOfPropertySelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
};

const PropertyShape: FC<PropertyShapeProps> = ({
    id,
    instanceId,
    moveItem,
    propertyShape,
    handleDeletePropertyShape,
    handlePropertiesSelect,
    handleClassOfPropertySelect,
}) => {
    const { isEditMode } = useIsEditMode();

    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index: id,
        isDisabled: !isEditMode,
        moveItem,
        dragHandleLabel: 'Drag to reorder property',
        previewOffset: 'preserve-offset-on-source',
        renderDragPreview: ({ container }) => {
            const preview = document.createElement('div');
            preview.className =
                'inline-flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm shadow-md max-w-xs truncate font-medium';
            preview.textContent = propertyShape.path?.label ?? 'Property';
            container.appendChild(preview);
        },
    });

    return (
        // the indicator lives on this unclipped wrapper: inside the bordered box
        // below, overflow-hidden would cut the line and its terminal ring off
        <div ref={elementRef} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative py-1">
            <div className="border border-border rounded-sm bg-surface overflow-hidden">
                <div className="flex flex-wrap items-stretch">
                    <TemplateComponentProperty
                        id={id}
                        handleDeletePropertyShape={handleDeletePropertyShape}
                        handlePropertiesSelect={handlePropertiesSelect}
                        onDragHandleRef={dragHandleRef}
                        dragHandleProps={dragHandleProps}
                    />
                    <TemplateComponentValue id={id} handleClassOfPropertySelect={handleClassOfPropertySelect} />
                </div>
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </div>
    );
};

export default PropertyShape;
