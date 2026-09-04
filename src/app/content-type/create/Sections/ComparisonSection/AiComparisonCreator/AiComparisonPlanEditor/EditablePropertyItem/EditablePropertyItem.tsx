'use client';

import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Disclosure, Input, TextArea, TextField } from '@heroui/react';
import type { ExtractionColumn } from '@orkg/agentic-loop-client';
import { DropIndicator, type MoveItem, useSortableItem } from '@orkg/pragmatic-dnd-hooks';

export type EditableProperty = ExtractionColumn & { _id: string };

type EditablePropertyItemProps = {
    property: EditableProperty;
    index: number;
    instanceId: symbol;
    isSubmitting: boolean;
    updateProperty: (id: string, patch: Partial<ExtractionColumn>) => void;
    removeProperty: (id: string) => void;
    moveItem: MoveItem;
};

const EditablePropertyItem = ({ property, index, instanceId, isSubmitting, updateProperty, removeProperty, moveItem }: EditablePropertyItemProps) => {
    const { elementRef, dragHandleRef, dragHandleProps, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        isDisabled: isSubmitting,
        moveItem,
        requireDragHandle: true,
        dragHandleLabel: 'Drag to reorder property. Use arrow up or arrow down to move.',
        previewOffset: 'preserve-offset-on-source',
        renderDragPreview: ({ container }) => {
            const preview = document.createElement('div');
            preview.className =
                'inline-flex max-w-xs items-center gap-2 truncate rounded border border-border bg-surface px-3 py-2 text-sm font-medium shadow-md';
            preview.textContent = property.name || 'Property';
            container.appendChild(preview);
        },
    });

    return (
        <div ref={elementRef} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative -my-1.5 py-1.5">
            <div className="flex items-start gap-2 rounded-lg border border-smart/30 bg-surface p-3 shadow-sm">
                <div
                    ref={dragHandleRef}
                    {...dragHandleProps}
                    aria-keyshortcuts="ArrowUp ArrowDown Home End"
                    className={`text-muted px-1 pt-2 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-1">
                    <TextField
                        fullWidth
                        value={property.name}
                        onChange={(value) => updateProperty(property._id, { name: value })}
                        isDisabled={isSubmitting}
                        aria-label="Property name"
                    >
                        <Input type="text" placeholder="Property name" className="font-medium" />
                    </TextField>
                    <TextField
                        fullWidth
                        value={property.description}
                        onChange={(value) => updateProperty(property._id, { description: value })}
                        isDisabled={isSubmitting}
                        aria-label="Property description"
                    >
                        <TextArea className="text-sm" rows={2} placeholder="What information this property captures" />
                    </TextField>
                    <Disclosure>
                        <Disclosure.Heading>
                            <Disclosure.Trigger className="inline-flex items-center gap-1.5 text-sm text-muted">
                                Extraction hint
                                {property.extractionHint.trim().length > 0 && <span aria-hidden className="bg-smart size-1.5 rounded-full" />}
                                <Disclosure.Indicator />
                            </Disclosure.Trigger>
                        </Disclosure.Heading>
                        <Disclosure.Content>
                            <Disclosure.Body className="p-1 pt-2">
                                <TextField
                                    fullWidth
                                    value={property.extractionHint}
                                    onChange={(value) => updateProperty(property._id, { extractionHint: value })}
                                    isDisabled={isSubmitting}
                                    aria-label="Property extraction hint"
                                >
                                    <TextArea className="text-sm" rows={2} placeholder="How to locate and extract this value from a paper" />
                                </TextField>
                            </Disclosure.Body>
                        </Disclosure.Content>
                    </Disclosure>
                </div>
                <Button
                    variant="danger-soft"
                    isIconOnly
                    size="sm"
                    onPress={() => removeProperty(property._id)}
                    aria-label="Remove property"
                    isDisabled={isSubmitting}
                >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                </Button>
            </div>
            {closestEdge && <DropIndicator edge={closestEdge} gap="0px" terminal className="text-primary" />}
        </div>
    );
};

export default EditablePropertyItem;
