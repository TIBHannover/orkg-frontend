import { ChangeEvent, FC, useRef, useState } from 'react';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';
import { toast } from 'react-toastify';

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
import Alert from '@/components/Ui/Alert/Alert';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import InputGroupText from '@/components/Ui/Input/InputGroupText';
import Label from '@/components/Ui/Label/Label';
import DATA_TYPES, { getConfigByClassId } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Class, Node } from '@/services/backend/types';

type SlotFormsProps = {
    index: number;
    isLocked?: boolean;
};

const SlotForms: FC<SlotFormsProps> = ({ index, isLocked = false }) => {
    const { properties, numberLockedProperties } = useRosettaTemplateEditorState();

    const canAddRequiredObject = !numberLockedProperties;

    const dispatch = useRosettaTemplateEditorDispatch();
    const slot = properties[index] ?? {};

    const classAutocompleteRef = useRef<SelectInstance<Class> | null>(null);
    const [cardinality, setCardinality] = useState(!slot.min_count && !slot.max_count ? '0,*' : 'range');

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
                    toast.error('Subject must not be of a literal type.');
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

    const onChangeCardinality = (event: ChangeEvent<HTMLInputElement>) => {
        setCardinality(event.target.value);

        if (event.target.value !== 'range') {
            const [minCount, maxCount] = event.target.value.split(',');
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
        <div>
            {isLocked && (
                <Alert color="warning">
                    This slot cannot be edited. You can only add new object positions, as the positions for the current statement type are locked
                </Alert>
            )}
            <FormGroup className="mt-2">
                <Label for={`placeholder${index}`}>{index !== 1 ? 'Placeholder' : 'What is the predicate or verb of the statement?'}</Label>
                <Input
                    onChange={(e) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, placeholder: safeText(e.target.value) } } })}
                    value={slot.placeholder}
                    type="text"
                    id={`placeholder${index}`}
                    placeholder={index !== 1 ? 'Placeholder' : 'verb'}
                    disabled={isLocked}
                />
                {index !== 1 && (
                    <p className="text-mute">
                        <small>
                            Please provide a thematic label for the type of information this {index === 0 ? 'subject' : 'object'} item should contain,
                            as in the following sentence (thematic labels here in capital letters): PERSON travels by TRANSPORTATION from DEPARTURE
                            LOCATION TO DESTINATION LOCATION on the DATE.
                        </small>
                    </p>
                )}
            </FormGroup>
            {index !== 1 && (
                <>
                    <FormGroup className="mt-2">
                        <Label for={`preposition${index}`}>
                            Preposition/Postposition{' '}
                            <HelpIcon content="Please add, where appropriate, words that will always appear in front (preposition) and directly following this item (postposition). Adding pre- and postposition words is optional. Together with the placeholder, they can be used to specify a general pattern how statements of this type will be displayed in the ORKG" />
                        </Label>
                        <InputGroup>
                            <Input
                                onChange={(e) =>
                                    dispatch({ type: 'setProperty', payload: { index, data: { ...slot, preposition: safeText(e.target.value) } } })
                                }
                                value={slot.preposition}
                                type="text"
                                id={`preposition${index}`}
                                disabled={isLocked}
                            />
                            <InputGroupText>{slot.placeholder ? slot.placeholder : _placeholder}</InputGroupText>
                            <Input
                                onChange={(e) =>
                                    dispatch({ type: 'setProperty', payload: { index, data: { ...slot, postposition: safeText(e.target.value) } } })
                                }
                                value={slot.postposition}
                                type="text"
                                disabled={isLocked}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="mt-2">
                        <Label for={`range${index}`}>
                            Type{' '}
                            <HelpIcon content="Please specify what type of input you expect for this subject/object item. Per default it will be terms from the ORKG list of terms or another dictionary such as Wikidata. If the item should hold a value, you must choose between 'Integer' or 'Decimal'. If you want to allow only 'yes/true' or 'no/false' it must be 'Boolean', etc. If it should be an input field for a proper name, use 'Text'." />
                        </Label>
                        <InputGroup size="sm">
                            <AutoComplete
                                entityType={ENTITIES.CLASS}
                                placeholder="Select or type to enter a class"
                                onChange={handleClassSelect}
                                value={range}
                                openMenuOnFocus
                                allowCreate
                                isClearable
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
                        </InputGroup>
                    </FormGroup>
                    <div className="mt-2">
                        <FormGroup>
                            <Label for="cardinalityValueInput">
                                Count of values{' '}
                                {index === 0 ? (
                                    <HelpIcon content="Here, you can specify whether the subject, which is always required and thus always has to be provided for the statement to be saved to the ORKG, is 'Required - Exactly one', meaning that this subject must be specified for this statement type, but only once, whereas 'Required - One or more' means that at least one must be specified, but more can be added." />
                                ) : (
                                    <HelpIcon content="Here, you can specify whether the object is required or optional. Required means that it has to be provided for the statement to be saved to the ORKG, whereas optional objects do not have to be specified. 'Optional - Zero or more' means that the same object can be added more than once, but can also be left empty. 'Optional-optional' means that it can only be added once to a given statement of that type, but can be left empty. 'Required - Exactly one' means that this object must be specified for this statement type, but only once, whereas 'Required - One or more' means that at least one must be specified, but more can be added." />
                                )}
                            </Label>
                            <Input onChange={onChangeCardinality} value={cardinality} type="select" id="cardinalityValueInput" disabled={isLocked}>
                                <option value="range">Custom...</option>
                                {index !== 0 && (
                                    <optgroup label="Optional">
                                        <option value="0,*">Zero or more [0,*]</option>
                                        <option value="0,1">Optional [0,1]</option>
                                    </optgroup>
                                )}
                                {canAddRequiredObject && (
                                    <optgroup label="Required">
                                        <option value="1,1">Exactly one [1,1]</option>
                                        <option value="1,*">One or more [1,*]</option>
                                    </optgroup>
                                )}
                            </Input>
                        </FormGroup>
                    </div>
                    {cardinality === 'range' && (
                        <div className="mt-2">
                            <FormGroup>
                                <Label for="minCountValueInput">Minimum Occurrence</Label>
                                <Input
                                    onChange={(e) =>
                                        dispatch({ type: 'setProperty', payload: { index, data: { ...slot, min_count: e.target.value } } })
                                    }
                                    value={slot.min_count}
                                    type="number"
                                    min={index === 0 || !canAddRequiredObject ? '1' : '0'}
                                    step="1"
                                    name="minCount"
                                    id="minCountValueInput"
                                    placeholder="Minimum number of occurrences in the statement"
                                    disabled={isLocked || !canAddRequiredObject}
                                />
                                <p className="text-mute">
                                    <small>Only optional positions can be added</small>
                                </p>
                            </FormGroup>
                            <FormGroup>
                                <Label for="maxCountValueInput">Maximum Occurrence</Label>
                                <Input
                                    onChange={(e) =>
                                        dispatch({ type: 'setProperty', payload: { index, data: { ...slot, max_count: e.target.value } } })
                                    }
                                    value={slot.max_count}
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="maxCount"
                                    id="maxCountValueInput"
                                    placeholder="Maximum number of occurrences in the statement"
                                    disabled={isLocked}
                                />
                                <p className="text-mute">
                                    <small>Clear the input field if there is no restriction (unbounded)</small>
                                </p>
                            </FormGroup>
                        </div>
                    )}
                    <FormGroup className="mt-2">
                        <Label for={`description${index}`}>
                            Description{' '}
                            <HelpIcon
                                // eslint-disable-next-line max-len
                                content={`Here you can provide a short description for users who are adding a statement of that type, informing them what they should add for this ${
                                    index === 0 ? 'subject' : 'object'
                                } position. The description is especially helpful in those cases in which the Placeholder is not self-explanatory.`}
                            />
                        </Label>
                        <Input
                            onChange={(e) => dispatch({ type: 'setProperty', payload: { index, data: { ...slot, description: e.target.value } } })}
                            value={slot.description}
                            type="textarea"
                            id={`description${index}`}
                            placeholder="Description"
                            rows="4"
                            disabled={isLocked}
                        />
                    </FormGroup>
                    {range && [CLASSES.INTEGER, CLASSES.DECIMAL].includes(range.id) && <NumberConstraints index={index} isLocked={isLocked} />}
                    {range && [CLASSES.STRING].includes(range.id) && <StringConstraints index={index} isLocked={isLocked} />}
                </>
            )}
        </div>
    );
};

export default SlotForms;
