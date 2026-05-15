import { faCheck, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Checkbox, Input, Label, Modal, TextField, toast, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC, useEffect, useMemo, useState } from 'react';
import { SingleValue } from 'react-select';

import ActionButton from '@/components/ActionButton/ActionButton';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import InputField from '@/components/InputField/InputField';
import { getCanAddValueCount, getRange, getRestrictingTemplate, type Item, validateValue } from '@/components/SemantifyButton/utils';
import { getConfigByClassId, getConfigByType, getSuggestionByValue } from '@/constants/DataTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createLiteral } from '@/services/backend/literals';
import { createResource } from '@/services/backend/resources';
import { createStatement, deleteStatementById } from '@/services/backend/statements';
import { Statement, Template } from '@/services/backend/types';

type SemantifyButtonModalProps = {
    isModalOpen: boolean;
    toggleModal: () => void;
    statement: Statement;
    templates?: Template[];
    currentPathStatements?: Statement[];
    onSave: (deletedStatementIds: string[], newStatementIds: string[]) => void;
};

const SemantifyButtonModal: FC<SemantifyButtonModalProps> = ({ isModalOpen, toggleModal, statement, templates, currentPathStatements, onSave }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [isCheckedSeparated, setIsCheckedSeparated] = useState(false);
    const [separator, setSeparator] = useState(',');
    const [isSaving, setIsSaving] = useState(false);
    const template = templates ? getRestrictingTemplate(templates, statement) : undefined;
    const range = template ? getRange(template, statement) : undefined;
    const canAddValue = template ? getCanAddValueCount(template, statement, currentPathStatements || []) : undefined;
    const currentCell = statement.object;
    let optionsClasses: string[] = [];
    if (statement.object?._class === ENTITIES.RESOURCE && range) {
        optionsClasses = [range.id];
    }

    const initialItems = useMemo(() => {
        if (currentCell) {
            let type = MISC.DEFAULT_LITERAL_DATATYPE;
            if ('datatype' in currentCell) {
                type = currentCell.datatype;
            } else if ('_class' in currentCell) {
                type = currentCell._class;
            }
            return [
                {
                    value: currentCell.label,
                    resource: currentCell?._class !== ENTITIES.LITERAL ? currentCell : null,
                    type: getConfigByType(type),
                    inputValue: currentCell.label,
                },
            ];
        }
        return [];
    }, [currentCell]);

    useEffect(() => {
        setItems(initialItems);
    }, [currentCell, initialItems]);

    const handleResourceSelect = (index: number, resource: SingleValue<OptionType>) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                resource,
                type: resource ? getConfigByType(ENTITIES.RESOURCE) : updatedItems[index].type,
                inputValue: undefined,
            };
            return updatedItems;
        });
    };

    const saveEntity = async () => {
        setIsSaving(true);
        if (!statement.id) {
            console.error('Error: statementId is null');
            setIsSaving(false);
            return;
        }
        let newStatementIds: string[] = [];
        try {
            await deleteStatementById(statement.id);
            const promises: Promise<string>[] = [];
            for (const item of items) {
                if (item.resource) {
                    promises.push(createStatement(statement.subject.id, statement.predicate.id, item.resource.id));
                } else if (item.type.type === ENTITIES.RESOURCE) {
                    const resource = await createResource({ label: item.inputValue || '', classes: range ? [range.id] : [] });
                    promises.push(createStatement(statement.subject.id, statement.predicate.id, resource));
                } else {
                    const literal = await createLiteral(item.inputValue || '', item.type.type);
                    promises.push(createStatement(statement.subject.id, statement.predicate.id, literal));
                }
            }
            newStatementIds = await Promise.all(promises);
            toast.success('Value semantified successfully');
        } catch (error) {
            console.error('Error saving entity:', error);
            toast.danger('Error saving entity');
        } finally {
            onSave([statement.id], newStatementIds);
            toggleModal();
            setIsSaving(false);
        }
    };

    const splitValueIntoEnumeration = (cellLabel: string, newSeparator: string) => {
        const split = cellLabel
            .split(newSeparator)
            .filter((l) => l.trim() !== '')
            .map((l) => l.trim());
        setItems(
            split.map((l) => ({
                value: l,
                resource: null,
                type: range ? getConfigByClassId(range.id) : getSuggestionByValue(l)[0],
                inputValue: l,
            })),
        );
    };

    const toggleIsChecked = () => {
        setIsCheckedSeparated((prev) => {
            const newChecked = !prev;
            if (newChecked) {
                if (currentCell?.label) {
                    splitValueIntoEnumeration(currentCell.label, separator);
                }
            } else if (currentCell) {
                setItems(initialItems);
            }
            return newChecked;
        });
    };

    const handleSeparatorChange = (newSeparator: string) => {
        setSeparator(newSeparator);
        if (isCheckedSeparated && currentCell?.label) {
            splitValueIntoEnumeration(currentCell.label, newSeparator);
        }
    };

    const handleDelete = (idx: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems.splice(idx, 1);
            return updatedItems;
        });
    };

    const handleAddValue = () => {
        setItems((prevItems) => [...prevItems, { value: '', resource: null, type: getConfigByType(MISC.DEFAULT_LITERAL_DATATYPE), inputValue: '' }]);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) toggleModal();
    };

    const isValid = items.every((item) => validateValue(template, item, statement.predicate.id));
    const isDisabled = !items.length || (canAddValue !== undefined && items.length - 1 > canAddValue) || !isValid;

    return (
        <Modal.Backdrop isOpen={isModalOpen} onOpenChange={handleOpenChange} isDismissable={false}>
            <Modal.Container size="lg" className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-3xl">
                    <Modal.Header>
                        <Modal.Heading>Semantify</Modal.Heading>
                        <Modal.CloseTrigger />
                    </Modal.Header>
                    <Modal.Body className="p-1">
                        <div className="divide-default bg-surface-secondary divide-y overflow-hidden rounded-lg border text-sm">
                            <div className="flex items-start gap-3 p-3">
                                <span className="text-muted w-28 shrink-0 font-medium">Subject</span>
                                <Link
                                    href={reverse(ROUTES.RESOURCE, { resourceId: statement.subject.id })}
                                    target="_blank"
                                    className="text-accent break-all"
                                >
                                    {statement.subject.label || 'No value'}
                                </Link>
                            </div>
                            <div className="flex items-start gap-3 p-3">
                                <span className="text-muted w-28 shrink-0 font-medium">Property</span>
                                <DescriptionTooltip id={statement.predicate.id} _class={ENTITIES.PREDICATE}>
                                    <Link
                                        href={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })}
                                        target="_blank"
                                        className="text-accent break-all"
                                    >
                                        {statement.predicate.label || 'No value'}
                                    </Link>
                                </DescriptionTooltip>
                            </div>
                            <div className="flex items-start gap-3 p-3">
                                <span className="text-muted w-28 shrink-0 font-medium">Original value</span>
                                <span className="break-all">{statement.object?.label || 'No value'}</span>
                            </div>
                        </div>

                        {template && (
                            <Alert status="accent" className="mt-4">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Template applied</Alert.Title>
                                    <Alert.Description>
                                        This value uses template{' '}
                                        <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })} target="_blank" className="text-accent underline">
                                            {template.label}
                                        </Link>
                                        .
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {canAddValue === 0 && (
                            <Alert status="warning" className="mt-3">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Maximum reached</Alert.Title>
                                    <Alert.Description>This value has reached the maximum count of values.</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {!!canAddValue && canAddValue > 0 && (
                            <Alert status="accent" className="mt-3">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>
                                        This semantification can have up to <strong>{canAddValue}</strong> more value{canAddValue > 1 ? 's' : ''}.
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Checkbox isSelected={isCheckedSeparated} onChange={toggleIsChecked}>
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>Split the original value by separator</Checkbox.Content>
                            </Checkbox>
                            <TextField
                                value={separator}
                                onChange={handleSeparatorChange}
                                isDisabled={!isCheckedSeparated}
                                aria-label="Separator character"
                            >
                                <Label className="sr-only">Separator</Label>
                                <Input maxLength={1} className="w-12 text-center" />
                            </TextField>
                        </div>

                        <div className="mt-5 mb-2 grid grid-cols-12 items-center gap-3 px-1">
                            <div className="text-muted col-span-8 text-xs font-semibold tracking-wide uppercase">Select type / resource</div>
                            <div className="text-muted col-span-2 text-center text-xs font-semibold tracking-wide uppercase">Valid</div>
                            <div className="text-muted col-span-2 text-right text-xs font-semibold tracking-wide uppercase">Actions</div>
                        </div>

                        <div className="divide-default flex flex-col divide-y">
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 items-center gap-3 py-2">
                                    <div className="col-span-8 flex min-h-9 min-w-0 grow items-stretch [&_.react-select__control]:!min-h-9">
                                        <DatatypeSelector
                                            _class={item.resource?._class}
                                            range={range}
                                            isDisabled={!!range?.id}
                                            dataType={item.type.type}
                                            setDataType={(newDataType) => {
                                                setItems((prevItems) => {
                                                    const updatedItems = [...prevItems];
                                                    const dataTypeValue = newDataType;
                                                    updatedItems[idx].type = getConfigByType(dataTypeValue || MISC.DEFAULT_LITERAL_DATATYPE);
                                                    return updatedItems;
                                                });
                                            }}
                                        />
                                        <InputField
                                            range={range}
                                            inputValue={item.inputValue || ''}
                                            setInputValue={(v) => {
                                                setItems((prevItems) => {
                                                    const updatedItems = [...prevItems];
                                                    updatedItems[idx].inputValue = v;
                                                    return updatedItems;
                                                });
                                            }}
                                            inputFormType={item.type.inputFormType || 'text'}
                                            dataType={item.type.type}
                                            isValid
                                            includeClasses={optionsClasses}
                                            allowCreate
                                            onChange={(selectedValue) => {
                                                if (selectedValue) {
                                                    handleResourceSelect(idx, selectedValue);
                                                }
                                            }}
                                            autoFocus={false}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        {validateValue(template, item, statement.predicate.id) ? (
                                            <span className="bg-success-soft text-success-soft-foreground inline-flex size-7 items-center justify-center rounded-full">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </span>
                                        ) : (
                                            <span className="bg-danger-soft text-danger-soft-foreground inline-flex size-7 items-center justify-center rounded-full">
                                                <FontAwesomeIcon icon={faXmark} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <ActionButton action={() => handleDelete(idx)} icon={faXmark} title="Remove" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="secondary" size="sm" onPress={handleAddValue} className="mt-3 gap-2">
                            <FontAwesomeIcon icon={faPlus} /> Add value
                        </Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggleModal}>
                            Close
                        </Button>
                        <Tooltip isDisabled={!isDisabled} delay={300}>
                            <Tooltip.Trigger>
                                <span className="inline-block">
                                    <ButtonWithLoading
                                        isDisabled={isDisabled}
                                        variant="primary"
                                        onPress={saveEntity}
                                        isLoading={isSaving}
                                        loadingMessage="Saving..."
                                    >
                                        Save
                                    </ButtonWithLoading>
                                </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content showArrow>
                                <Tooltip.Arrow />
                                <p className="max-w-xs">
                                    You cannot save this semantification because of the template restrictions. Try to remove some values or change the
                                    current values.
                                </p>
                            </Tooltip.Content>
                        </Tooltip>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SemantifyButtonModal;
