'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Disclosure, Input, Label, TextArea, TextField } from '@heroui/react';
import type { ExtractionColumn, ExtractionPlan } from '@orkg/agentic-loop-client';
import { uniqueId } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import EditablePropertyItem, {
    type EditableProperty,
    isPropertyDragData,
} from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonPlanEditor/EditablePropertyItem/EditablePropertyItem';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Confirm from '@/components/Confirmation/Confirmation';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';

type AiComparisonPlanEditorProps = {
    plan: ExtractionPlan;
    isSubmitting: boolean;
    onExecute: (editedPlan: ExtractionPlan) => void;
    onCancel: () => void;
};

// The API's ExtractionColumn has no id, so attach a client-only one to use as
// a stable React key — without it, removing a row would remount the inputs of
// every row after it (losing focus/cursor state).
const toEditable = (property: ExtractionColumn): EditableProperty => ({
    ...property,
    _id: uniqueId('prop-'),
});

const AiComparisonPlanEditor = ({ plan, isSubmitting, onExecute, onCancel }: AiComparisonPlanEditorProps) => {
    const [instanceId] = useState(() => createInstanceId('ai-comparison-plan-properties'));
    const [title, setTitle] = useState(plan.title);
    const [description, setDescription] = useState(plan.description);
    const [stepsText, setStepsText] = useState(plan.steps.join('\n'));
    const [properties, setProperties] = useState<EditableProperty[]>(() => plan.properties.map(toEditable));

    useEffect(() => {
        setTitle(plan.title);
        setDescription(plan.description);
        setStepsText(plan.steps.join('\n'));
        setProperties(plan.properties.map(toEditable));
    }, [plan]);

    const updateProperty = (id: string, patch: Partial<ExtractionColumn>) => {
        setProperties((prev) => prev.map((property) => (property._id === id ? { ...property, ...patch } : property)));
    };

    const removeProperty = (id: string) => {
        setProperties((prev) => prev.filter((property) => property._id !== id));
    };

    const moveProperty = useCallback((index: number, direction: -1 | 1) => {
        setProperties((prev) => {
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= prev.length) {
                return prev;
            }

            const next = [...prev];
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    }, []);

    const reorderProperties = useCallback(({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
        setProperties((prev) => {
            const reorderedProperties = performReorder({
                items: prev,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            return reorderedProperties === prev ? prev : reorderedProperties;
        });
    }, []);

    useEffect(() => {
        if (isSubmitting) {
            return undefined;
        }

        const cleanup = createListMonitor({
            instanceId,
            items: properties,
            isDragData: isPropertyDragData,
            onReorder: reorderProperties,
            getItemId: (property) => property._id,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, isSubmitting, properties, reorderProperties]);

    const addProperty = () => {
        setProperties((prev) => [
            ...prev,
            {
                _id: uniqueId('prop-'),
                name: '',
                description: '',
                extractionHint: '',
            },
        ]);
    };

    // Submits the full plan (PUT /plan replaces it wholesale). Properties with
    // an empty name are dropped; a blanked title or steps list falls back to
    // the original plan values instead of submitting empty.
    const handleExecute = () => {
        const cleanedSteps = stepsText
            .split('\n')
            .map((step) => step.trimEnd())
            .filter((step) => step.trim().length > 0);

        const cleanedProperties: ExtractionColumn[] = properties
            .map((property) => ({
                name: property.name.trim(),
                description: property.description.trim(),
                extractionHint: property.extractionHint.trim(),
            }))
            .filter((property) => property.name.length > 0);

        const editedPlan: ExtractionPlan = {
            ...plan,
            title: title.trim() || plan.title,
            description: description.trim(),
            steps: cleanedSteps.length > 0 ? cleanedSteps : plan.steps,
            properties: cleanedProperties,
        };

        onExecute(editedPlan);
    };

    const handleCancel = async () => {
        const confirmed = await Confirm({
            title: 'Cancel plan?',
            message: 'This discards the generated plan and the uploaded paper(s). You will have to start over from the beginning.',
            proceedLabel: 'Cancel plan',
            cancelLabel: 'Keep plan',
        });
        if (confirmed) {
            onCancel();
        }
    };

    return (
        <div className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-3 p-1">
                <TextField fullWidth value={title} onChange={setTitle} isDisabled={isSubmitting}>
                    <Label>Comparison title</Label>
                    <Input type="text" />
                </TextField>
                <TextField fullWidth value={description} onChange={setDescription} isDisabled={isSubmitting}>
                    <Label>Description</Label>
                    <TextArea rows={3} />
                </TextField>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Research field:</span>
                    <Chip size="sm" variant="soft" className="chip--orkg-smart">
                        {plan.researchField.label}
                    </Chip>
                </div>
            </div>

            <div>
                <span className="mb-2 block font-semibold">
                    Comparison properties <span className="font-normal text-muted">({properties.length})</span>
                </span>
                <p className="mb-3 text-sm text-muted">Each property becomes a row in the comparison table, extracted from every paper.</p>
                {properties.length === 0 && <div className="mb-2 text-sm italic text-muted">No properties defined.</div>}
                <div className="flex flex-col gap-3">
                    {properties.map((property, index) => (
                        <EditablePropertyItem
                            key={property._id}
                            property={property}
                            index={index}
                            instanceId={instanceId}
                            isSubmitting={isSubmitting}
                            updateProperty={updateProperty}
                            removeProperty={removeProperty}
                            moveProperty={moveProperty}
                        />
                    ))}
                </div>
                <Button variant="secondary" className="button--orkg-smart mt-3!" size="sm" onPress={addProperty} isDisabled={isSubmitting}>
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Add property
                </Button>
            </div>

            <Disclosure>
                <Disclosure.Heading>
                    <Disclosure.Trigger className="inline-flex items-center gap-1.5 text-sm text-muted">
                        Advanced: execution steps
                        <Disclosure.Indicator />
                    </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                    <Disclosure.Body className="p-1 pt-2">
                        <p className="mb-2 text-sm text-muted">The instructions the AI follows to fill the comparison table, one step per line.</p>
                        <TextField fullWidth value={stepsText} onChange={setStepsText} isDisabled={isSubmitting} aria-label="Execution steps">
                            <TextArea rows={8} className="text-sm" />
                        </TextField>
                    </Disclosure.Body>
                </Disclosure.Content>
            </Disclosure>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onPress={handleCancel} isDisabled={isSubmitting}>
                    Cancel plan
                </Button>
                <ButtonWithLoading variant="primary" className="button--orkg-smart" isLoading={isSubmitting} onClick={handleExecute}>
                    Approve & execute
                </ButtonWithLoading>
            </div>
        </div>
    );
};

export default AiComparisonPlanEditor;
