import { faCheck, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useEffect, useMemo, useState } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';

import ActionButton from '@/components/ActionButton/ActionButton';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import InputField from '@/components/InputField/InputField';
import { getCanAddValueCount, getRange, getRestrictingTemplate, type Item, validateValue } from '@/components/SemantifyButton/utils';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import Table from '@/components/Ui/Table/Table';
import { getConfigByClassId, getConfigByType, getSuggestionByValue } from '@/constants/DataTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
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
            // Update the item at the specified index
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
            toast.error('Error saving entity');
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
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems.push({ value: '', resource: null, type: getConfigByType(MISC.DEFAULT_LITERAL_DATATYPE), inputValue: '' });
            return updatedItems;
        });
    };
    const isValid = items.every((item) => validateValue(template, item, statement.predicate.id));
    const isDisabled = !items.length || (canAddValue !== undefined && items.length - 1 > canAddValue) || !isValid;

    return (
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" backdrop="static" unmountOnClose>
            <ModalHeader toggle={toggleModal}>Semantify</ModalHeader>
            <ModalBody>
                <Table bordered>
                    <tbody>
                        <tr>
                            <td className="col-2">
                                <strong>Subject</strong>
                            </td>
                            <td>
                                <Link href={reverse(ROUTES.RESOURCE, { resourceId: statement.subject.id })} target="_blank">
                                    {statement.subject.label || 'No value'}
                                </Link>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Property</strong>
                            </td>
                            <td>
                                <DescriptionTooltip id={statement.predicate.id} _class={ENTITIES.PREDICATE}>
                                    <Link href={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })} target="_blank">
                                        {statement.predicate.label || 'No value'}
                                    </Link>
                                </DescriptionTooltip>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Original Value</strong>
                            </td>
                            <td> {statement.object?.label || 'No value'}</td>
                        </tr>
                    </tbody>
                </Table>
                <hr />
                {template && (
                    <Alert color="info">
                        <strong className="me-2">Template:</strong>
                        This value has an applied template:{' '}
                        <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })} target="_blank" className="text-primary">
                            {template.label}
                        </Link>
                    </Alert>
                )}
                {canAddValue === 0 && (
                    <Alert color="warning">
                        <strong className="me-2">Warning:</strong>
                        This value has reached the maximum count of values.
                    </Alert>
                )}
                {!!canAddValue && canAddValue > 0 && (
                    <Alert color="info">
                        <strong className="me-2">Info:</strong>
                        This semantification can have {canAddValue} more values.
                    </Alert>
                )}
                <FormGroup row className="align-items-center">
                    <Col sm={5} className="d-flex align-items-center">
                        <Input type="checkbox" checked={isCheckedSeparated} onChange={toggleIsChecked} className="me-2" id="separated-checkbox" />
                        <Label className="mb-0" htmlFor="separated-checkbox">
                            Split the original value with separator:
                        </Label>
                    </Col>
                    <Col sm={1}>
                        <Input
                            type="text"
                            value={separator}
                            disabled={!isCheckedSeparated}
                            maxLength={1}
                            onChange={(e) => handleSeparatorChange(e.target.value)}
                            className="text-center p-1 tw:w-2 inline-block"
                        />
                    </Col>
                </FormGroup>

                <FormGroup row sm={4}>
                    <Col sm={8}>
                        <strong>Select Type / Resource</strong>
                    </Col>
                    <Col sm={2} className="text-center">
                        <strong>Valid</strong>
                    </Col>
                    <Col sm={2} className="text-end">
                        <strong>Actions</strong>
                    </Col>
                </FormGroup>

                {items.map((item, idx) => (
                    <Row key={idx} sm={4} className="mb-3">
                        <Col sm={8}>
                            <InputGroup>
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
                            </InputGroup>
                        </Col>
                        <Col sm={2} className="text-center">
                            {validateValue(template, item, statement.predicate.id) ? (
                                <FontAwesomeIcon icon={faCheck} className="text-success" />
                            ) : (
                                <FontAwesomeIcon icon={faXmark} className="text-danger" />
                            )}
                        </Col>
                        <Col sm={2} className="text-end">
                            <ActionButton action={() => handleDelete(idx)} icon={faXmark} title="Remove" />
                        </Col>
                    </Row>
                ))}
                <Button color="secondary" onClick={handleAddValue} className="tw:flex tw:items-center tw:gap-2" size="sm">
                    <FontAwesomeIcon icon={faPlus} /> Add value
                </Button>
            </ModalBody>

            <ModalFooter>
                <Tooltip
                    content={
                        isDisabled
                            ? 'You cannot save this semantification because of the restrictions of the template, try to remove some values or change the values.'
                            : ''
                    }
                >
                    <div className="d-inline-block">
                        <ButtonWithLoading disabled={isDisabled} color="primary" onClick={saveEntity} isLoading={isSaving} loadingMessage="Saving...">
                            Save
                        </ButtonWithLoading>
                    </div>
                </Tooltip>
                <Button color="secondary" onClick={toggleModal}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default SemantifyButtonModal;
