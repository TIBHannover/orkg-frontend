import { faClipboard, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Input, Label, ListBox, Select, TextArea, TextField, toast, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC, Key, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ValidationRulesNumber from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesNumber';
import ValidationRulesString from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/ValidationRules/ValidationRulesString';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import DATA_TYPES from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { PropertyShape } from '@/services/backend/types';
import { updatePropertyShapes } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';
import { getLinkByEntityType } from '@/utils';

type TemplateComponentValueProps = {
    id: number;
    handleClassOfPropertySelect: (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, index: number) => void;
};

const CARDINALITY_OPTIONS: { id: string; label: string }[] = [
    { id: '0,*', label: 'Zero or more [0,*]' },
    { id: '0,1', label: 'Optional [0,1]' },
    { id: '1,1', label: 'Exactly one [1,1]' },
    { id: '1,*', label: 'One or more [1,*]' },
    { id: 'range', label: 'Custom...' },
];

const TemplateComponentValue: FC<TemplateComponentValueProps> = ({ id, handleClassOfPropertySelect }) => {
    const propertyShape = useSelector((state: RootStore) => state.templateEditor.properties[id]);
    const strCardinality = `${propertyShape.min_count || '*'},${propertyShape.max_count || '*'}`;
    const mapOptions: { [key: string]: string } = {
        '*,*': '0,*',
        '0,*': '0,*',
        '0,1': '0,1',
        '1,1': '1,1',
        '1,*': '1,*',
    };
    const [cardinality, setCardinality] = useState<string>(mapOptions[strCardinality] || 'range');
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    const propertyShapes = useSelector((state: RootStore) => state.templateEditor.properties);

    const updateField = (name: string, value: string) => {
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            const _item = { ...item } as PropertyShape & Record<string, unknown>;
            if (j === id) {
                _item[name] = value;
            }
            return _item;
        });
        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const onChangeCardinality = (key: Key | null) => {
        if (!key) return;
        const value = key.toString();
        setCardinality(value);

        if (value !== 'range') {
            const [minCount, maxCount] = value.split(',');
            const templatePropertyShapes = propertyShapes.map((item, j) => {
                const _item = { ...item };
                if (j === id) {
                    _item.min_count = parseInt(minCount, 10);
                    _item.max_count = maxCount !== '*' ? parseInt(maxCount, 10) : undefined;
                }
                return _item;
            });
            dispatch(updatePropertyShapes(templatePropertyShapes));
        }
    };

    let range: OptionType | null | undefined = null;

    if ('class' in propertyShape && propertyShape.class !== undefined) {
        range = propertyShape.class as OptionType;
    } else if ('datatype' in propertyShape && propertyShape.datatype !== undefined) {
        range = propertyShape.datatype as OptionType;
    }

    const hasRange = !!range?.id;
    const rangeLink = hasRange ? getLinkByEntityType(range?._class || 'class', range!.id) : '#';

    const handleCopyRangeId = () => {
        if (range?.id && navigator.clipboard) {
            navigator.clipboard.writeText(range.id);
            toast.success('ID copied to clipboard');
        }
    };

    return (
        <div className="basis-full md:basis-7/12 bg-surface p-4 flex flex-col gap-3">
            <div className="flex items-stretch">
                <div className="min-w-0 flex-1">
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        placeholder={isEditMode ? 'Select or type to enter a class' : 'No Class'}
                        onChange={(selected: SingleValue<OptionType>, action: ActionMeta<OptionType>) => {
                            handleClassOfPropertySelect(selected, action, id);
                        }}
                        value={range}
                        openMenuOnFocus
                        allowCreate
                        isDisabled={!isEditMode}
                        isClearable
                        defaultOptions={[
                            ...DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({ label: dt.name, id: dt.classId })),
                            { label: 'Resource', id: CLASSES.RESOURCE },
                        ]}
                        size="sm"
                        enableExternalSources
                        groupPosition={hasRange ? 'start' : undefined}
                    />
                </div>
                {hasRange && (
                    <ButtonGroup
                        variant="tertiary"
                        size="sm"
                        aria-label="Range actions"
                        className="shrink-0 [&>[data-slot='button']:first-child]:rounded-l-none"
                    >
                        <Tooltip delay={0}>
                            <Button isIconOnly aria-label="Copy ID to clipboard" onPress={handleCopyRangeId} variant="tertiary">
                                <FontAwesomeIcon icon={faClipboard} className="size-3.5 text-muted" />
                            </Button>
                            <Tooltip.Content>Copy ID to clipboard</Tooltip.Content>
                        </Tooltip>
                        <Tooltip delay={0}>
                            <Button
                                variant="tertiary"
                                isIconOnly
                                aria-label="Open class page"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={(props: any) => <Link {...props} href={rangeLink} target="_blank" rel="noreferrer" />}
                            >
                                <ButtonGroup.Separator />
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="size-3.5 text-muted" />
                            </Button>
                            <Tooltip.Content>Open class page</Tooltip.Content>
                        </Tooltip>
                    </ButtonGroup>
                )}
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
                <Label htmlFor={`cardinalityValueInput-${id}`} className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                    Cardinality
                </Label>
                <div className="col-span-12 md:col-span-9">
                    <Select
                        aria-label="Cardinality"
                        selectedKey={cardinality}
                        onSelectionChange={onChangeCardinality}
                        isDisabled={!isEditMode}
                        className="w-full"
                    >
                        <Select.Trigger id={`cardinalityValueInput-${id}`} className="w-full">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {CARDINALITY_OPTIONS.map((option) => (
                                    <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                                        {option.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            </div>

            {cardinality === 'range' && (
                <>
                    <div className="grid grid-cols-12 items-center gap-2">
                        <Label htmlFor={`minCountValueInput-${id}`} className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                            Minimum occurrence
                        </Label>
                        <div className="col-span-12 md:col-span-9">
                            <TextField
                                fullWidth
                                value={
                                    propertyShape.min_count !== undefined && propertyShape.min_count !== null ? String(propertyShape.min_count) : ''
                                }
                                onChange={(value) => updateField('min_count', value)}
                                isDisabled={!isEditMode}
                                aria-label="Minimum occurrence"
                            >
                                <Input
                                    id={`minCountValueInput-${id}`}
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Minimum number of occurrences in the resource"
                                    className="!border !border-border focus:!border-accent"
                                />
                            </TextField>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-2">
                        <Label htmlFor="maxCountValueInput" className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                            Maximum occurrence
                        </Label>
                        <div className="col-span-12 md:col-span-9">
                            <TextField
                                fullWidth
                                value={
                                    propertyShape.max_count !== undefined && propertyShape.max_count !== null ? String(propertyShape.max_count) : ''
                                }
                                onChange={(value) => updateField('max_count', value)}
                                isDisabled={!isEditMode}
                                aria-label="Maximum occurrence"
                            >
                                <Input
                                    id="maxCountValueInput"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Maximum number of occurrences in the resource"
                                    className="!border !border-border focus:!border-accent"
                                />
                            </TextField>
                            {isEditMode && <p className="text-muted text-xs mt-1">Clear the input field if there is no restriction (unbounded)</p>}
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-12 items-center gap-2">
                <Label htmlFor={`placeholderInput-${id}`} className="col-span-12 md:col-span-3 text-muted text-sm md:text-right">
                    Placeholder
                </Label>
                <div className="col-span-12 md:col-span-9">
                    <TextField
                        fullWidth
                        value={propertyShape.placeholder || ''}
                        onChange={(value) => updateField('placeholder', value)}
                        isDisabled={!isEditMode}
                        aria-label="Placeholder"
                    >
                        <Input
                            id={`placeholderInput-${id}`}
                            placeholder="Enter a placeholder for the input form"
                            className="!border !border-border focus:!border-accent"
                        />
                    </TextField>
                </div>
            </div>

            <div className="grid grid-cols-12 items-start gap-2">
                <Label htmlFor={`descriptionInput-${id}`} className="col-span-12 md:col-span-3 text-muted text-sm md:text-right md:pt-2">
                    Description
                </Label>
                <div className="col-span-12 md:col-span-9">
                    <TextField
                        fullWidth
                        value={propertyShape.description || ''}
                        onChange={(value) => updateField('description', value)}
                        isDisabled={!isEditMode}
                        aria-label="Description"
                    >
                        <TextArea
                            id={`descriptionInput-${id}`}
                            placeholder="Enter a description for the input form"
                            rows={2}
                            className="!border !border-border focus:!border-accent"
                        />
                    </TextField>
                </div>
            </div>

            {range && [CLASSES.INTEGER, CLASSES.DECIMAL].includes(range.id) && <ValidationRulesNumber id={id} />}
            {range && [CLASSES.STRING].includes(range.id) && <ValidationRulesString id={id} />}
        </div>
    );
};

export default TemplateComponentValue;
