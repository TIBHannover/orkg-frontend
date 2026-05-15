import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, TextField } from '@heroui/react';
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

        const [value, setValue] = useState<string>(initialValue.value);
        const { config } = useDataBrowserState();
        const { isEditMode } = config;
        const { isUsingSnapshot } = useSnapshotStatement();
        const [isEditing, setIsEditing] = useState<boolean>(false);
        const [dataType, setDataType] = useState<string>(initialValue.datatype ?? MISC.DEFAULT_LITERAL_DATATYPE);
        const [formFeedback, setFormFeedback] = useState<string | null>(null);
        const { schema, inputFormType } = getConfigByType(dataType);

        const allColumns = table.getAllColumns();
        const isTitlesColumnsExist = allColumns.some((col) => col.id === 'titles');

        let columnIndex = -1;
        const colIndex = allColumns.findIndex((col) => col.id === id);

        if (colIndex !== -1) {
            columnIndex = isTitlesColumnsExist ? colIndex - 1 : colIndex;
        } else {
            const numericId = Number.parseInt(id, 10);
            if (!Number.isNaN(numericId) && numericId >= 0) {
                columnIndex = isTitlesColumnsExist ? numericId - 1 : numericId;
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
                table.options.meta?.updateData(index + 1, columnIndex, null);
            }
            setIsEditing(false);
        };

        const onSaveValue = async (_value: string | Node) => {
            let error: ZodError | null = null;
            if (schema && typeof _value === 'string') {
                error = schema.safeParse(_value.trim()).error ?? null;
            }
            if (error) {
                setFormFeedback(error.issues?.[0]?.message);
                return;
            }
            if (!tableID) {
                setFormFeedback(null);
                setIsEditing(false);
                return;
            }
            if (id === 'titles' && typeof _value === 'string') {
                const rowData = row.original;
                const dataArray: (string | null)[] = allColumns
                    .filter((col) => col.id !== 'titles')
                    .map((col) => {
                        const cellData = rowData[col.id];
                        return cellData?.id ?? null;
                    });

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
                    setFormFeedback(null);
                    setIsEditing(false);
                    return;
                }
            }
            if (_value && typeof _value !== 'string' && '__isNew__' in _value && _value.__isNew__ === true) {
                const entityType = getConfigByType(dataType).type as EntityType;
                const newObject = await createValue(entityType, { label: _value.label, datatype: dataType });
                thingId = newObject.id;
            } else if (typeof _value !== 'string') {
                thingId = (_value as Node).id;
            }
            if (thingId !== initialValue.id) {
                await updateCell(tableID, index + 1, columnIndex, thingId);
            }

            if (!isUsingSnapshot && thingId) {
                const thing = await getThing(thingId);
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
                <div className="flex flex-col grow">
                    <div className="flex items-stretch min-h-9 grow">
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
                            <TextField
                                fullWidth
                                value={value || ''}
                                onChange={setValue}
                                aria-label="Edit title"
                                className="flex-1 min-w-0"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') void onSaveValue(value);
                                    if (e.key === 'Escape') {
                                        setFormFeedback(null);
                                        setIsEditing(false);
                                    }
                                }}
                            >
                                <Input placeholder="Enter a title" autoFocus className="!rounded-e-none" />
                            </TextField>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            isIconOnly
                            aria-label="Cancel"
                            className="!h-9 !rounded-none -ms-px"
                            onPress={() => {
                                setFormFeedback(null);
                                setIsEditing(false);
                            }}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            isIconOnly
                            aria-label="Save"
                            className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                            onPress={() => onSaveValue(value)}
                        >
                            <FontAwesomeIcon icon={faCheck} />
                        </Button>
                    </div>
                    {!isValid && <div className="text-sm text-danger mt-1">{formFeedback}</div>}
                </div>
            );
        }
        return (
            <div className="group relative flex items-center min-w-[300px] leading-8 w-full h-full">
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
                            <button
                                type="button"
                                className="bg-transparent border-0 p-0 text-left text-wrap text-accent hover:underline max-w-full cursor-pointer"
                                onClick={() => setIsModalOpen(true)}
                            >
                                {initialValue.value}
                            </button>
                        </DescriptionTooltip>
                    </>
                )}
                {!value && isEditMode && <span className="text-muted text-xs leading-8">{id === 'titles' ? 'No label' : 'No value'}</span>}
                {isEditMode && !isUsingSnapshot && (
                    <span className="hidden group-hover:inline-block ms-2">
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
                                    { title: 'Cancel', color: 'secondary', icon: faTimes },
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
                                    { title: 'Delete', color: 'danger', icon: faCheck, action: onDelete },
                                    { title: 'Cancel', color: 'secondary', icon: faTimes },
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
