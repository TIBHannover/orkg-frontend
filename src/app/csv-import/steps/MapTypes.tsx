import { Alert, Label, ListBox, Select } from '@heroui/react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Dispatch, FC, SetStateAction } from 'react';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import { isDefaultHeader, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import DATA_TYPES, { DataType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const TYPE_DROPDOWN_OPTIONS = DATA_TYPES.filter(
    (dt) => dt.classId !== CLASSES.RESOURCE && dt.classId !== CLASSES.LIST && dt.classId !== CLASSES.CSVW_TABLE,
);

type TypeMappingProps = {
    data: string[][];
    mappedColumns: MappedColumn[];
    setMappedColumns: Dispatch<SetStateAction<MappedColumn[]>>;
    setData: (data: string[][]) => void;
    runValidation: (data: string[][], mappedDataTypes: MappedColumn[]) => void;
    cellValidation: (boolean | ZodError<unknown> | null | undefined)[][];
    booleanCellValidation: boolean[][];
    columnValidation: string | null;
};

const TypeMapping: FC<TypeMappingProps> = ({
    data,
    mappedColumns,
    setMappedColumns,
    setData,
    runValidation,
    cellValidation,
    booleanCellValidation,
    columnValidation,
}) => {
    const handleChangeColumnType = (colIndex: number, newType: DataType) => {
        const _mappedColumns = [...mappedColumns];
        _mappedColumns[colIndex] = {
            predicate: mappedColumns[colIndex].predicate,
            inputValue: mappedColumns[colIndex].inputValue,
            type: newType,
        };
        setMappedColumns(_mappedColumns);
        runValidation(data, _mappedColumns);
        const updatedData = [...data];
        const { label, entityId } = parseCellString(updatedData[0][colIndex]);
        updatedData[0][colIndex] = `${entityId ? `orkg:${entityId}` : label}${
            _mappedColumns[colIndex].type ? `<${_mappedColumns[colIndex].type?.classId}>` : ''
        }`;
        setData(updatedData);
    };

    const generateInvalidationMessagesForColumn = (index: number) => {
        return booleanCellValidation
            .map((row, i) => {
                return row.map((cell, j) => {
                    return j === index && cell === false ? (
                        <div key={`error-${i}-${j}`}>
                            <strong>Row {i + 1}</strong> - <b>{mappedColumns[index].predicate?.label}</b>: {fromError(cellValidation[i][j]).message}
                        </div>
                    ) : null;
                });
            })
            .flat()
            .filter((v) => v !== null);
    };

    return (
        <div>
            {columnValidation && (
                <Alert status="danger" className="mb-4">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>{columnValidation}</Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <div className="overflow-auto bg-surface text-sm max-h-[500px] border-2 border-secondary rounded">
                <table className="w-full border-separate border-spacing-0 text-sm [&_th]:border-b [&_th]:border-separator [&_th]:px-3 [&_th]:py-2 [&_td]:border-b [&_td]:border-separator [&_td]:px-3 [&_td]:py-2 [&_tbody_tr:nth-child(odd)_td]:bg-surface-secondary/50">
                    <thead className="sticky top-0 z-8 bg-white">
                        <tr>
                            <th className="text-left">#</th>
                            <th className="text-left">Mapped property</th>
                            <th className="text-left">Column type</th>
                            <th className="text-left">Data Validation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedColumns.map((column, index) => (
                            <tr key={index}>
                                <th scope="row" className="text-left">
                                    {index + 1}
                                </th>

                                <td>
                                    <div className="flex justify-between">
                                        {column.predicate?.id ? (
                                            <DescriptionTooltip
                                                id={column.predicate?.id}
                                                _class={ENTITIES.PREDICATE}
                                                disabled={isDefaultHeader(column.predicate?.id)}
                                            >
                                                {isDefaultHeader(column.predicate?.id) ? (
                                                    <b>{column.predicate?.label}</b>
                                                ) : (
                                                    <Link href={reverse(ROUTES.PROPERTY, { id: column.predicate?.id })} target="_blank">
                                                        {column.predicate?.label}
                                                    </Link>
                                                )}
                                            </DescriptionTooltip>
                                        ) : (
                                            <Tooltip content="This property will be created as no match for an existing property was found.">
                                                <span>{column.inputValue}</span>
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    {!isDefaultHeader(mappedColumns[index].predicate?.id || '') && (
                                        <Select
                                            aria-label="Column type"
                                            value={mappedColumns[index].type?.classId ?? ''}
                                            onChange={(key) => {
                                                const selectedType = TYPE_DROPDOWN_OPTIONS.find((dt) => dt.classId === key);
                                                if (selectedType) {
                                                    handleChangeColumnType(index, selectedType);
                                                }
                                            }}
                                            className="w-full"
                                        >
                                            <Label className="sr-only">Column type</Label>
                                            <Select.Trigger className="h-8 w-full text-sm">
                                                <Select.Value />
                                                <Select.Indicator />
                                            </Select.Trigger>
                                            <Select.Popover>
                                                <ListBox>
                                                    {TYPE_DROPDOWN_OPTIONS.map((option) => (
                                                        <ListBox.Item key={option.classId} id={option.classId} textValue={option.name}>
                                                            {option.name}
                                                            <ListBox.ItemIndicator />
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                    )}
                                </td>
                                <td>
                                    {booleanCellValidation.map((row) => row[index])?.every((cell) => cell) ? (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white">
                                            Valid
                                        </span>
                                    ) : (
                                        <Tooltip
                                            content={
                                                <>
                                                    {generateInvalidationMessagesForColumn(index).length > 0
                                                        ? generateInvalidationMessagesForColumn(index).slice(0, 5)
                                                        : ''}
                                                    {generateInvalidationMessagesForColumn(index).length > 5 && (
                                                        <div className="mt-1 italic">And more errors not shown...</div>
                                                    )}
                                                </>
                                            }
                                        >
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-red-600 text-white">
                                                {`${booleanCellValidation.map((row) => row[index]).filter((cell) => !cell).length} ${pluralize(
                                                    'Invalid value',
                                                    booleanCellValidation.map((row) => row[index]).filter((cell) => !cell).length,
                                                )}`}
                                            </span>
                                        </Tooltip>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default TypeMapping;
