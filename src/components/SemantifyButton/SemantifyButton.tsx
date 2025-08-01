import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Col, Row, Table } from 'reactstrap';

import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { getConfigByType, getSuggestionByValue } from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Literal, Resource } from '@/services/backend/types';
import { addValue, deleteStatement, setCurrentSementifyCell } from '@/slices/contributionEditorSlice';
import { RootStore } from '@/slices/types';

const SemantifyButton = ({
    cellValue,
    title,
    contributionId,
    propertyId,
    isDisabled,
}: {
    cellValue: Resource | Literal;
    title: string;
    contributionId: string;
    propertyId: string;
    isDisabled: boolean;
}) => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [items, setItems] = useState<Array<{ value: string; resource: SingleValue<OptionType> | null; type: any; inputValue?: string }>>([]);
    const [isCheckedSeparated, setIsCheckedSeparated] = useState(false);
    const [separator, setSeparator] = useState(',');

    const toggleModal = () => {
        if (!isModalOpen) {
            dispatch(setCurrentSementifyCell([propertyId, contributionId]));
        }
        setIsModalOpen((prev) => !prev);
    };

    const property = useSelector((state: RootStore) => state.contributionEditor.properties[propertyId]);
    const contribution = useSelector((state: RootStore) => state.contributionEditor.contributions[contributionId]);
    const paper = useSelector((state: RootStore) => state.contributionEditor.papers[contribution?.paperId]);

    const statementId = useSelector((state: RootStore) => {
        const statementIds = Object.keys(state.contributionEditor.statements).filter(
            (sId) =>
                state.contributionEditor.statements[sId].contributionId === contributionId &&
                state.contributionEditor.statements[sId].propertyId === propertyId,
        );
        return statementIds.find((sId) => state.contributionEditor.statements[sId]?.objectId === cellValue?.id) || null;
    });

    const currentCell = useSelector((state: RootStore) => {
        if (statementId) {
            const statement = state.contributionEditor.statements[statementId];
            if (statement.type === ENTITIES.LITERAL) {
                return state.contributionEditor.literals[statement.objectId] ?? null;
            }
            return state.contributionEditor.resources[statement.objectId] ?? null;
        }
        return null;
    });

    useEffect(() => {
        if (currentCell) {
            setItems([
                {
                    value: currentCell.label,
                    resource: currentCell.resource || null,
                    type: currentCell.type || getConfigByType('xsd:string'), // Default type if not already set
                    inputValue: currentCell.label,
                },
            ]);
        }
    }, [currentCell]);

    const determineDataTypes = () => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.resource) {
                    return {
                        ...item,
                        type: ENTITIES.RESOURCE,
                    };
                }
                const suggestion = getSuggestionByValue(item.value)[0];
                const type = suggestion || getConfigByType('xsd:string');
                return {
                    ...item,
                    type,
                    inputValue: item.value,
                };
            }),
        );
    };

    useEffect(() => {
        determineDataTypes();
    }, []);

    const handleResourceSelect = (index: number, resource: SingleValue<OptionType & { selected?: boolean }>) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];

            // Update the item at the specified index
            updatedItems[index] = {
                ...updatedItems[index],
                resource,
                type: resource ? ENTITIES.RESOURCE : updatedItems[index].type, // Set the type if resource is selected
                inputValue: undefined,
            };

            return updatedItems;
        });
    };

    const saveEntity = async () => {
        if (!statementId) {
            console.error('Error: statementId is null');
            return;
        }

        // @ts-expect-error awaiting typescript migration of contribution editor slice
        dispatch(deleteStatement(statementId));

        for (const item of items) {
            if (item.resource) {
                dispatch(
                    // @ts-expect-error awaiting typescript migration of contribution editor slice
                    addValue(ENTITIES.RESOURCE, item.resource, null, contributionId, propertyId),
                );
            } else {
                dispatch(
                    // @ts-expect-error awaiting typescript migration of contribution editor slice
                    addValue(ENTITIES.LITERAL, { label: item.value, datatype: item.type.type }, null, contributionId, propertyId),
                );
            }
        }
        toast.success('Value semantified successfully');
        toggleModal();
    };

    const splitValueIntoEnumeration = (cellLabel: string, newSeparator: string) => {
        const split = cellLabel
            .split(newSeparator)
            .filter((value) => value.trim() !== '')
            .map((value) => value.trim());
        setItems(split.map((value) => ({ value, resource: null, type: getConfigByType('xsd:string'), inputValue: value })));
    };

    const toggleIsChecked = () => {
        setIsCheckedSeparated((prev) => {
            const newChecked = !prev;

            if (newChecked) {
                if (currentCell?.label) {
                    splitValueIntoEnumeration(currentCell.label, separator);
                }
            } else if (currentCell) {
                setItems([
                    {
                        value: currentCell.label,
                        resource: currentCell.resource || null,
                        type: currentCell.type || getConfigByType('xsd:string'),
                        inputValue: currentCell.label,
                    },
                ]);
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

    return (
        <>
            <ActionButton title={title} icon={faWandMagicSparkles} isDisabled={isDisabled} action={toggleModal} iconSize="xs" />

            <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" backdrop="static" unmountOnClose>
                <ModalHeader toggle={toggleModal}>Semantify</ModalHeader>
                <ModalBody>
                    <Table bordered>
                        <tbody>
                            <tr>
                                <td className="col-2">
                                    <strong>Contribution</strong>
                                </td>
                                <td>
                                    <Link
                                        href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: paper?.id, contributionId: contribution?.id })}
                                        target="_blank"
                                    >
                                        {paper?.label || 'No value'}
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Property</strong>
                                </td>
                                <td>
                                    <DescriptionTooltip id={property?.id} _class={ENTITIES.PREDICATE}>
                                        <Link href={reverse(ROUTES.PROPERTY, { id: property?.id })} target="_blank">
                                            {property?.label || 'No value'}
                                        </Link>
                                    </DescriptionTooltip>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Original Value</strong>
                                </td>
                                <td>{currentCell?.label || 'No value'}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <hr />
                    <FormGroup row className="align-items-center">
                        <Col sm={4} className="d-flex align-items-center">
                            <Input type="checkbox" checked={isCheckedSeparated} onChange={toggleIsChecked} className="me-2" id="separated-checkbox" />
                            <Label className="mb-0" htmlFor="separated-checkbox">
                                Separated list with separator:
                            </Label>
                        </Col>
                        <Col sm={1}>
                            <Input
                                type="text"
                                value={separator}
                                disabled={!isCheckedSeparated}
                                maxLength={1}
                                onChange={(e) => handleSeparatorChange(e.target.value)}
                                className="text-center p-1"
                                style={{ width: '50px', display: 'inline-block' }}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup row sm={4}>
                        <Col sm={4}>
                            <strong>Value</strong>
                        </Col>
                        <Col sm={5}>
                            <strong>Select Resource</strong>
                        </Col>
                        <Col sm={3}>
                            <strong>Resulting type</strong>
                        </Col>
                    </FormGroup>

                    {items.map((item, idx) => (
                        <Row key={idx} sm={4} className="mb-3">
                            <Col sm={4}>{item.value}</Col>
                            <Col sm={5}>
                                <InputGroup>
                                    <Autocomplete
                                        entityType={ENTITIES.RESOURCE}
                                        onChange={(value, { action }) => {
                                            if (action === 'select-option') {
                                                // @ts-expect-error mismatch between the type of the value and the type of the option
                                                handleResourceSelect(idx, { ...value, selected: true });
                                            } else if (action === 'create-option' && value) {
                                                handleResourceSelect(idx, value);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (item.inputValue) {
                                                setItems((prevItems) => {
                                                    const updatedItems = [...prevItems];
                                                    updatedItems[idx].resource = null;
                                                    updatedItems[idx].type = getConfigByType('xsd:string');
                                                    return updatedItems;
                                                });
                                            }
                                        }}
                                        inputValue={item.inputValue || undefined}
                                        onInputChange={(value, action) => {
                                            if (action?.action !== 'input-blur' && action?.action !== 'menu-close') {
                                                setItems((prevItems) => {
                                                    const updatedItems = [...prevItems];
                                                    updatedItems[idx].inputValue = value;
                                                    return updatedItems;
                                                });
                                            }
                                        }}
                                        value={item.resource}
                                        allowCreate
                                        openMenuOnFocus
                                    />
                                </InputGroup>
                            </Col>
                            <Col sm={3}>{typeof item?.type === 'string' ? item.type : item?.type?.name}</Col>
                        </Row>
                    ))}
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={saveEntity}>
                        Save
                    </Button>
                    <Button color="secondary" onClick={toggleModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default SemantifyButton;
