import { Alert, Description, Header, Input, Label, ListBox, Select, Separator, TextArea, TextField, toast } from '@heroui/react';
import { FC, useEffect, useRef, useState } from 'react';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';

import AutoComplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import HelpIcon from '@/components/RosettaStone/RosettaTemplateEditor/HelpIcon/HelpIcon';
import NumberConstraints from '@/components/RosettaStone/RosettaTemplateEditor/SlotForms/LiteralConstraints/NumberConstraints';
import StringConstraints from '@/components/RosettaStone/RosettaTemplateEditor/SlotForms/LiteralConstraints/StringConstraints';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import DATA_TYPES, { getConfigByClassId } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Class, Node } from '@/services/backend/types';

type SlotFormsProps = {
    index: number;
    isLocked?: boolean;
};

const cardinalityLabels: Record<string, string> = {
    range: 'Custom...',
    '0,*': 'Zero or more [0,*]',
    '0,1': 'Optional [0,1]',
    '1,1': 'Exactly one [1,1]',
    '1,*': 'One or more [1,*]',
};

const SlotForms: FC<SlotFormsProps> = ({ index, isLocked = false }) => {
    const { properties, numberLockedProperties } = useRosettaTemplateEditorState();

    const canAddRequiredObject = !numberLockedProperties;

    const dispatch = useRosettaTemplateEditorDispatch();
    const slot = properties[index] ?? {};

    const classAutocompleteRef = useRef<SelectInstance<Class> | null>(null);
    const [cardinality, setCardinality] = useState(!slot.min_count && !slot.max_count ? '0,*' : 'range');
    const [menuPortalTarget] = useState<HTMLDivElement | null>(() => {
        if (typeof document === 'undefined') return null;
        const div = document.createElement('div');
        div.setAttribute('data-react-aria-top-layer', 'true');
        return div;
    });

    useEffect(() => {
        if (!menuPortalTarget) return undefined;
        document.body.appendChild(menuPortalTarget);
        return () => {
            menuPortalTarget.remove();
        };
    }, [menuPortalTarget]);

    const safeText = (text: string) => {
        if (text.includes(']') || text.includes('[') || text.includes('}') || text.includes('{')) {
            toast.warning('Curly brackets and square brackets are not allowed.');
            return text.replace(']', '').replace('[', '').replace('}', '').replace('{', '');
        }
        return text;
    };

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'select-option' && selected) {
            if (getConfigByClassId(selected.id)._class === ENTITIES.LITERAL) {
                if (index === 0) {
                    toast.danger('Subject must not be of a literal type.');
                    return;
                }

                dispatch({ type: 'setProperty', payload: { index, data: { ...slot, datatype: selected, class: undefined } } });
            } else {
                dispatch({ type: 'setProperty', payload: { index, data: { ...slot, datatype: undefined, class: selected } } });
            }
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                dispatch({ type: 'setProperty', payload: { index, data: { ...slot, datatype: undefined, class: selected } } });
            }
            // blur the field allows to focus and open the menu again
            if (classAutocompleteRef.current) {
                classAutocompleteRef.current.blur();
            }
        } else if (action === 'clear') {
            dispatch({ type: 'setProperty', payload: { index, data: { ...slot, datatype: undefined, class: undefined } } });
        }
    };

    const onChangeCardinality = (key: string) => {
        setCardinality(key);

        if (key !== 'range') {
            const [minCount, maxCount] = key.split(',');
            dispatch({ type: 'setProperty', payload: { index, data: { ...slot, min_count: minCount, max_count: maxCount } } });
        }
    };

    let range: Node | null | undefined;
    if ('class' in slot && slot.class !== undefined && slot.class) {
        range = slot.class;
    }
    if (!range && 'datatype' in slot && slot.datatype !== undefined) {
        range = slot.datatype;
    }
    if (!range) {
        range = null;
    }
    const _placeholder = index === 0 ? `Subject` : `Object ${index}`;

    return (
        <div className="flex flex-col gap-4">
            {isLocked && (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            This slot cannot be edited. You can only add new object positions, as the positions for the current statement template are
                            locked.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}

            <TextField
                fullWidth
                isDisabled={isLocked}
                value={slot.placeholder ?? ''}
                onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, placeholder: safeText(value) } } })}
            >
                <Label>{index !== 1 ? 'Placeholder' : 'What is the predicate or verb of the statement?'}</Label>
                <Input id={`placeholder${index}`} placeholder={index !== 1 ? 'Placeholder' : 'verb'} />
                {index !== 1 && (
                    <Description className="text-xs text-muted">
                        Please provide a thematic label for the type of information this {index === 0 ? 'subject' : 'object'} item should contain, as
                        in the following sentence (thematic labels here in capital letters): PERSON travels by TRANSPORTATION from DEPARTURE LOCATION
                        TO DESTINATION LOCATION on the DATE.
                    </Description>
                )}
            </TextField>

            {index !== 1 && (
                <>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor={`preposition${index}`} className="inline-flex items-center gap-2">
                            Preposition/Postposition
                            <HelpIcon content="Please add, where appropriate, words that will always appear in front (preposition) and directly following this item (postposition). Adding pre- and postposition words is optional. Together with the placeholder, they can be used to specify a general pattern how statements of this type will be displayed in the ORKG" />
                        </Label>
                        <div className="flex items-stretch [&>*:not(:first-child)]:-ms-px [&>*:first-child]:rounded-e-none [&>*:last-child]:rounded-s-none [&>*:not(:first-child):not(:last-child)]:rounded-none">
                            <Input
                                id={`preposition${index}`}
                                className="min-w-0 flex-1"
                                disabled={isLocked}
                                value={slot.preposition ?? ''}
                                onChange={(e) =>
                                    dispatch({ type: 'setProperty', payload: { index, data: { ...slot, preposition: safeText(e.target.value) } } })
                                }
                            />
                            <span className="inline-flex shrink-0 items-center border border-separator bg-surface-secondary px-3 text-sm text-muted">
                                {slot.placeholder ? slot.placeholder : _placeholder}
                            </span>
                            <Input
                                className="min-w-0 flex-1"
                                disabled={isLocked}
                                value={slot.postposition ?? ''}
                                onChange={(e) =>
                                    dispatch({ type: 'setProperty', payload: { index, data: { ...slot, postposition: safeText(e.target.value) } } })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor={`range${index}`} className="inline-flex items-center gap-2">
                            Type
                            <HelpIcon content="Please specify what type of input you expect for this subject/object item. Per default it will be terms from the ORKG list of terms or another dictionary such as Wikidata. If the item should hold a value, you must choose between 'Integer' or 'Decimal'. If you want to allow only 'yes/true' or 'no/false' it must be 'Boolean', etc. If it should be an input field for a proper name, use 'Text'." />
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.CLASS}
                            placeholder="Select or type to enter a class"
                            onChange={handleClassSelect}
                            value={range}
                            openMenuOnFocus
                            allowCreate
                            isClearable
                            inputId={`range${index}`}
                            menuPortalTarget={menuPortalTarget ?? undefined}
                            defaultOptions={
                                index !== 0
                                    ? DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({
                                          label: dt.name,
                                          id: dt.classId,
                                      }))
                                    : []
                            }
                            enableExternalSources
                            isDisabled={isLocked}
                        />
                    </div>

                    <Select
                        fullWidth
                        isDisabled={isLocked}
                        value={cardinality}
                        onChange={(key) => onChangeCardinality(String(key))}
                        placeholder="Choose cardinality"
                    >
                        <Label className="inline-flex items-center gap-2">
                            Count of values
                            {index === 0 ? (
                                <HelpIcon content="Here, you can specify whether the subject, which is always required and thus always has to be provided for the statement to be saved to the ORKG, is 'Required - Exactly one', meaning that this subject must be specified for this statement template, but only once, whereas 'Required - One or more' means that at least one must be specified, but more can be added." />
                            ) : (
                                <HelpIcon content="Here, you can specify whether the object is required or optional. Required means that it has to be provided for the statement to be saved to the ORKG, whereas optional objects do not have to be specified. 'Optional - Zero or more' means that the same object can be added more than once, but can also be left empty. 'Optional-optional' means that it can only be added once to a given statement of that template, but can be left empty. 'Required - Exactly one' means that this object must be specified for this statement template, but only once, whereas 'Required - One or more' means that at least one must be specified, but more can be added." />
                            )}
                        </Label>
                        <Select.Trigger>
                            <Select.Value>
                                {({ defaultChildren, isPlaceholder }) =>
                                    isPlaceholder ? defaultChildren : (cardinalityLabels[cardinality] ?? cardinality)
                                }
                            </Select.Value>
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item id="range" textValue="Custom...">
                                    Custom...
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <Separator />
                                {index !== 0 && (
                                    <ListBox.Section>
                                        <Header>Optional</Header>
                                        <ListBox.Item id="0,*" textValue="Zero or more">
                                            Zero or more [0,*]
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id="0,1" textValue="Optional">
                                            Optional [0,1]
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox.Section>
                                )}
                                {canAddRequiredObject && (
                                    <ListBox.Section>
                                        <Header>Required</Header>
                                        <ListBox.Item id="1,1" textValue="Exactly one">
                                            Exactly one [1,1]
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id="1,*" textValue="One or more">
                                            One or more [1,*]
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox.Section>
                                )}
                            </ListBox>
                        </Select.Popover>
                    </Select>

                    {cardinality === 'range' && (
                        <div className="flex flex-col gap-4">
                            <TextField
                                fullWidth
                                isDisabled={isLocked || !canAddRequiredObject}
                                value={slot.min_count?.toString() ?? ''}
                                onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, min_count: value } } })}
                            >
                                <Label>Minimum Occurrence</Label>
                                <Input
                                    id="minCountValueInput"
                                    type="number"
                                    min={index === 0 || !canAddRequiredObject ? '1' : '0'}
                                    step={1}
                                    name="minCount"
                                    placeholder="Minimum number of occurrences in the statement"
                                />
                                <Description className="text-xs text-muted">Only optional positions can be added</Description>
                            </TextField>
                            <TextField
                                fullWidth
                                isDisabled={isLocked}
                                value={slot.max_count?.toString() ?? ''}
                                onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, max_count: value } } })}
                            >
                                <Label>Maximum Occurrence</Label>
                                <Input
                                    id="maxCountValueInput"
                                    type="number"
                                    min="0"
                                    step={1}
                                    name="maxCount"
                                    placeholder="Maximum number of occurrences in the statement"
                                />
                                <Description className="text-xs text-muted">Clear the input field if there is no restriction (unbounded)</Description>
                            </TextField>
                        </div>
                    )}

                    <TextField
                        fullWidth
                        isDisabled={isLocked}
                        value={slot.description ?? ''}
                        onChange={(value) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, description: value } } })}
                    >
                        <Label className="inline-flex items-center gap-2">
                            Description
                            <HelpIcon
                                content={`Here you can provide a short description for users who are adding a statement of that type, informing them what they should add for this ${
                                    index === 0 ? 'subject' : 'object'
                                } position. The description is especially helpful in those cases in which the Placeholder is not self-explanatory.`}
                            />
                        </Label>
                        <TextArea id={`description${index}`} placeholder="Description" rows={4} />
                    </TextField>

                    {range && [CLASSES.INTEGER, CLASSES.DECIMAL].includes(range.id) && <NumberConstraints index={index} isLocked={isLocked} />}
                    {range && [CLASSES.STRING].includes(range.id) && <StringConstraints index={index} isLocked={isLocked} />}
                </>
            )}
        </div>
    );
};

export default SlotForms;
