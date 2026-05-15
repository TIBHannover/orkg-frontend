import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Accordion, Button, Label, Separator, TextArea, TextField, toast } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';

import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import PositionItem, { isPositionData } from '@/components/RosettaStone/RosettaTemplateEditor/PositionItem/PositionItem';
import StatementPlaceholder from '@/components/RosettaStone/RosettaTemplateEditor/StatementPlaceholder';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { createInstanceId, createListMonitor, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { guid } from '@/utils';

function StepThree() {
    const { examples, lockedExamples, numberLockedProperties, properties } = useRosettaTemplateEditorState();
    const dispatch = useRosettaTemplateEditorDispatch();
    const [instanceId] = useState(() => createInstanceId('rosetta-positions'));

    const [open, setOpen] = useState(properties?.length > 0 ? (properties[0].id ?? '') : '');

    const handleAddObjectPosition = () => {
        const newId = guid();
        dispatch({ type: 'addObjectPosition', payload: newId });
        setOpen(newId);
    };

    const reorderPositions = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            // Don't allow reordering of locked positions (subject and verb)
            if (startIndex === 0 || startIndex === 1 || indexOfTarget === 0 || indexOfTarget === 1) {
                return;
            }

            const finishIndex = getReorderDestinationIndex({
                startIndex,
                closestEdgeOfTarget,
                indexOfTarget,
                axis: 'vertical',
            });

            if (finishIndex !== startIndex) {
                const reorderedProperties = reorder({
                    list: properties,
                    startIndex,
                    finishIndex,
                });
                dispatch({ type: 'reorderProperties', payload: reorderedProperties });
            }
        },
        [dispatch, properties],
    );

    useEffect(() => {
        const cleanup = createListMonitor({
            instanceId,
            items: properties,
            isDragData: isPositionData,
            onReorder: reorderPositions,
            getItemId: (property) => property.id || '',
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, properties, reorderPositions]);

    const handleExamplesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (numberLockedProperties > 0) {
            if (e.target.value.startsWith(lockedExamples)) {
                dispatch({ type: 'setExamples', payload: e.target.value });
            } else {
                toast.clear();
                toast.danger(`Examples must start with "${lockedExamples}"`);
            }
        } else {
            dispatch({ type: 'setExamples', payload: e.target.value });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <TextField fullWidth>
                <Label className="inline-flex items-center gap-2">
                    Provide some example sentences
                    <HelpIcon content="In the first step, we want you to provide several example sentences for the type of statement you are defining. Here are some examples for a measurement statement: 'This apple has a weight of 212.45 grams (95% conf. inter.: 212.44 - 212.47 grams).', 'The sample has a mean blood pressure of 120 mmHg.', 'The lake has a pH of 7.5.'" />
                </Label>
                <TextArea
                    id="examples"
                    onChange={handleExamplesChange}
                    value={examples}
                    placeholder="Provide example sentences that illustrate the type of information you expect this statement template to handle. These examples will help users understand the scope of the statement template."
                    rows={4}
                />
            </TextField>
            <Separator />
            <StatementPlaceholder />
            <Separator />
            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 font-medium text-foreground">
                    Positions
                    <HelpIcon content="In this step, you create a pattern for the new statement template. At the top you see the progress you make in specifying that pattern and how it will be displayed in the ORKG. Each item you see at the top is a specific position in the sentence that you define. At the bottom you can add more object positions. Whenever you add an object, it will appear at the top. With the statement pattern it should be possible to express all the example sentences that you provided." />
                </div>
                <Accordion
                    allowsMultipleExpanded={false}
                    expandedKeys={open ? new Set([open]) : new Set()}
                    onExpandedChange={(keys) => {
                        if (keys.size === 0) {
                            setOpen('');
                        } else {
                            setOpen(String(Array.from(keys)[0]));
                        }
                    }}
                    className="flex flex-col gap-2"
                >
                    {properties.map((property, i) => (
                        <PositionItem property={property} i={i} key={property?.id} instanceId={instanceId} totalItems={properties.length} />
                    ))}
                </Accordion>
                <div>
                    <Button size="sm" variant="tertiary" onPress={handleAddObjectPosition}>
                        <FontAwesomeIcon icon={faPlus} /> Add object position
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default StepThree;
