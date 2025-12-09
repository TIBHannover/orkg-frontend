import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { ZodError } from 'zod';

import ActionButton from '@/components/ActionButton/ActionButton';
import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { TableRow } from '@/components/DataBrowser/types/DataBrowserTypes';
import { createValue } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Ui/Button/Button';
import FormFeedback from '@/components/Ui/Form/FormFeedback';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { getConfigByType } from '@/constants/DataTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import { updateLiteral } from '@/services/backend/literals';
import { updateCell, updateRow } from '@/services/backend/tables';
import { getThing } from '@/services/backend/things';
import { EntityType, Node } from '@/services/backend/types';

// Give our default column cell renderer editing superpowers!
const Column: Partial<ColumnDef<TableRow>> = {
    cell: function Cell({ getValue, row, column: { id }, table }) {
        const tableID = table.options.meta?.id;
        const { index } = row;
        const [isModalOpen, setIsModalOpen] = useState(false);
        const initialValue = getValue() as TableRow[string];

        // We need to keep and update the state of the cell normally
        const [value, setValue] = useState<string>(initialValue.value);
        const { config } = useDataBrowserState();
        const { isEditMode } = config;
        const { isUsingSnapshot } = useSnapshotStatement();
        const [isEditing, setIsEditing] = useState<boolean>(false);
        const [dataType, setDataType] = useState<string>(initialValue.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE);
        const [formFeedback, setFormFeedback] = useState<string | null>(null);
        const { schema, inputFormType } = getConfigByType(dataType);

        // Get column information from the table object instead of the hook
        const allColumns = table.getAllColumns();
        const isTitlesColumnsExist = allColumns.some((col) => col.id === 'titles');

        // Find the column index from the column ID using the table columns
        let columnIndex = -1;

        // Find the column by matching the column id
        const colIndex = allColumns.findIndex((col) => col.id === id);

        if (colIndex !== -1) {
            // If titles column exists, it's the first column in cols, so we need to adjust the index
            // The backend API column indices don't include the titles column
            columnIndex = isTitlesColumnsExist ? colIndex - 1 : colIndex;
        } else {
            // Fallback: try parsing the column id as a number
            const numericId = Number.parseInt(id, 10);
            if (!Number.isNaN(numericId) && numericId >= 0) {
                // Adjust for titles column if it exists
                columnIndex = isTitlesColumnsExist ? numericId - 1 : numericId;
                // Ensure the index is valid
                const totalColumns = allColumns.length - (isTitlesColumnsExist ? 1 : 0);
                if (columnIndex < 0 || columnIndex >= totalColumns) {
                    columnIndex = -1;
                }
            }
        }

        const onDelete = async () => {
            if (!tableID) {
                return;
            }
            await updateCell(tableID, index + 1, columnIndex, null);
            if (!isUsingSnapshot) {
                // +1 because the index corresponds to the data row, 0 is the header row
                table.options.meta?.updateData(index + 1, columnIndex, null);
            }
            setIsEditing(false);
        };

        // When the save value is clicked, we'll call our table meta's updateData function
        const onSaveValue = async (_value: string | Node) => {
            let error: ZodError | null = null;
            if (schema && typeof _value === 'string') {
                error = schema.safeParse(_value.trim()).error ?? null;
            }
            if (error) {
                setFormFeedback(error.errors?.[0]?.message);
                return;
            }
            if (!tableID) {
                setFormFeedback(null);
                setIsEditing(false);
                return;
            }
            // Skip updating if it's the titles column (titles are stored in row.label, not in data array)
            if (id === 'titles' && typeof _value === 'string') {
                // Construct the full row data array from the original row data
                const rowData = row.original;
                const dataArray: (string | null)[] = allColumns
                    .filter((col) => col.id !== 'titles')
                    .map((col) => {
                        const cellData = rowData[col.id];
                        return cellData?.id ?? null;
                    });

                // Add 1 to index because row 0 is the header row in the backend API
                await updateRow(tableID, index + 1, {
                    resources: {},
                    literals: {},
                    predicates: {},
                    lists: {},
                    classes: {},
                    row: { label: _value || null, data: dataArray },
                });
                setFormFeedback(null);
                setIsEditing(false);
                if (!isUsingSnapshot) {
                    table.options.meta?.updateData(index + 1, -1, {
                        id: null,
                        label: _value as string,
                        datatype: MISC.DEFAULT_LITERAL_DATATYPE,
                        _class: ENTITIES.LITERAL,
                    });
                }
                return;
            }

            if (columnIndex === -1) {
                setFormFeedback(null);
                setIsEditing(false);
                return;
            }

            // Create a literal with the new value and datatype, then use its ID
            let thingId: string | null = null;
            if (_value && typeof _value === 'string' && _value.trim() && dataType !== 'empty') {
                try {
                    if (initialValue.id) {
                        await updateLiteral(initialValue.id, _value.trim(), dataType);
                        thingId = initialValue.id;
                    } else {
                        const entityType = getConfigByType(dataType).type as EntityType;
                        const newObject = await createValue(entityType, { label: _value.trim(), datatype: dataType });
                        thingId = newObject.id;
                    }
                } catch (e) {
                    // Failed to create literal, exit without updating
                    setFormFeedback(null);
                    setIsEditing(false);
                    return;
                }
            }
            if (_value && typeof _value !== 'string' && '__isNew__' in _value && _value.__isNew__ === true) {
                // create the resource
                const entityType = getConfigByType(dataType).type as EntityType;
                const newObject = await createValue(entityType, { label: _value.label, datatype: dataType });
                thingId = newObject.id;
            } else if (typeof _value !== 'string') {
                thingId = (_value as Node).id;
            }
            // Update the cell using the row index (index corresponds to the data row)
            // and the column index, with the thing ID
            if (thingId !== initialValue.id) {
                await updateCell(tableID, index + 1, columnIndex, thingId);
            }

            // Refresh the table data cache using SWR mutate without re-fetching from hook
            if (!isUsingSnapshot && thingId) {
                const thing = await getThing(thingId);
                // +1 because the index corresponds to the data row, 0 is the header row
                table.options.meta?.updateData(index + 1, columnIndex, {
                    id: thingId,
                    label: thing.label,
                    datatype: 'datatype' in thing && thing.datatype ? thing.datatype : '',
                    _class: thing._class,
                });
            }
            setFormFeedback(null);
            setIsEditing(false);
        };

        // If the initialValue is changed external, sync it up with our state
        useEffect(() => {
            setValue(initialValue.value);
        }, [initialValue, isEditing]);

        useEffect(() => {
            if (dataType === 'xsd:boolean') {
                setValue((v) => Boolean(v === 'true').toString());
            }
        }, [dataType, value, setValue]);

        const isValid = !formFeedback;

        if (isEditing && isEditMode && !isUsingSnapshot) {
            return (
                <div className="d-flex flex-column flex-grow-1">
                    <InputGroup size="sm" className="flex-grow-1 flex-nowrap">
                        {id !== 'titles' && (
                            <>
                                <DatatypeSelector
                                    menuPortalTarget={document.body}
                                    _class={ENTITIES.LITERAL}
                                    dataType={dataType}
                                    setDataType={setDataType}
                                    allowAllDataTypes
                                />
                                <InputField
                                    inputValue={value}
                                    setInputValue={setValue}
                                    inputFormType={inputFormType}
                                    dataType={dataType}
                                    isValid
                                    placeholder=""
                                    allowCreate
                                    menuPortalTarget={document.body}
                                    onChange={(selectedValue) => {
                                        onSaveValue(selectedValue ?? '');
                                    }}
                                    onCreate={(selectedValue) => {
                                        onSaveValue(selectedValue ?? '');
                                    }}
                                />
                            </>
                        )}
                        {id === 'titles' && (
                            <Input
                                type="text"
                                bsSize="sm"
                                value={value || ''}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Enter a title"
                            />
                        )}
                        <Button
                            size="sm"
                            type="submit"
                            color="secondary"
                            className="px-2"
                            onClick={() => {
                                setFormFeedback(null);
                                setIsEditing(false);
                            }}
                            title="Cancel"
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                        <Button className="px-2" size="sm" type="submit" color="primary" onClick={() => onSaveValue(value)} title="Save">
                            <span>
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                        </Button>
                    </InputGroup>{' '}
                    {!isValid && <FormFeedback className="tw:block!">{formFeedback}</FormFeedback>}
                </div>
            );
        }
        return (
            <div className="tw:group tw:relative tw:flex tw:items-center tw:min-w-[300px] tw:leading-8 tw:w-full tw:h-full">
                {(!('_class' in initialValue) || initialValue._class === 'literal_ref' || initialValue._class === ENTITIES.LITERAL) && (
                    <ValuePlugins type={ENTITIES.LITERAL} datatype={initialValue.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE}>
                        {value}
                    </ValuePlugins>
                )}
                {'_class' in initialValue && initialValue._class !== 'literal_ref' && initialValue._class !== ENTITIES.LITERAL && (
                    <>
                        {isModalOpen && (
                            <DataBrowserDialog
                                show
                                toggleModal={() => setIsModalOpen(!isModalOpen)}
                                id={initialValue.id}
                                label={initialValue.value}
                                isEditMode={isEditMode}
                            />
                        )}
                        <DescriptionTooltip id={initialValue.id} _class={initialValue._class as EntityType}>
                            <Button
                                color="link"
                                className="p-0 text-wrap text-start tw:!text-[length:inherit] tw:!no-underline tw:hover:!underline"
                                style={{ maxWidth: '100%' }}
                                onClick={() => setIsModalOpen(true)}
                            >
                                {initialValue.value}
                            </Button>
                        </DescriptionTooltip>
                    </>
                )}
                {!value && isEditMode && (
                    <span className="tw:text-gray-500 tw:text-xs tw:leading-8">{id === 'titles' ? 'No label' : 'No value'}</span>
                )}
                {isEditMode && !isUsingSnapshot && (
                    <span className="tw:hidden tw:group-hover:inline-block tw:ms-2">
                        <ActionButtonView icon={faPen} action={() => setIsEditing(true)} title="Edit" />
                        {id === 'titles' && (
                            <ActionButton
                                title="Delete row"
                                icon={faTrash}
                                requireConfirmation
                                confirmationMessage="Are you sure you want to delete this row?"
                                isLoading={table.options.meta?.deletingRowIndex === Number(row.id)}
                                confirmationButtons={[
                                    {
                                        title: 'Delete',
                                        color: 'danger',
                                        icon: faCheck,
                                        action: () => {
                                            table.options.meta?.deleteRow(Number(row.id));
                                        },
                                    },
                                    {
                                        title: 'Cancel',
                                        color: 'secondary',
                                        icon: faTimes,
                                    },
                                ]}
                            />
                        )}
                        {colIndex !== 0 && value && (
                            <ActionButton
                                title="Delete"
                                icon={faTrash}
                                requireConfirmation
                                confirmationMessage="Are you sure you want to delete this cell value?"
                                confirmationButtons={[
                                    {
                                        title: 'Delete',
                                        color: 'danger',
                                        icon: faCheck,
                                        action: onDelete,
                                    },
                                    {
                                        title: 'Cancel',
                                        color: 'secondary',
                                        icon: faTimes,
                                    },
                                ]}
                            />
                        )}
                    </span>
                )}
            </div>
        );
    },
};

export default Column;
