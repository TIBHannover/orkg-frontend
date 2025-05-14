import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Dispatch, FC, SetStateAction } from 'react';
import { Alert, Input, Table } from 'reactstrap';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import { isDefaultHeader, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import DATA_TYPES, { DataType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const TYPE_DROPDOWN_OPTIONS = DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE && dt.classId !== CLASSES.LIST);

type TypeMappingProps = {
    data: string[][];
    mappedColumns: MappedColumn[];
    setMappedColumns: Dispatch<SetStateAction<MappedColumn[]>>;
    setData: Dispatch<SetStateAction<string[][]>>;
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
        setData((prevData) => {
            const updatedData = [...prevData];
            const { label } = parseCellString(updatedData[0][colIndex]);
            updatedData[0][colIndex] = `${label}${_mappedColumns[colIndex].type ? `<${_mappedColumns[colIndex].type?.classId}>` : ''}`;
            return updatedData;
        });
    };

    const generateInvalidationMessagesForColumn = (index: number) => {
        return booleanCellValidation
            .map((row, i) => {
                return row.map((cell, j) => {
                    // Check if the current cell is invalid
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
            {columnValidation && <Alert color="danger">{columnValidation}</Alert>}

            <div className="tw:overflow-auto tw:bg-[var(--color-light-lighter)] tw:text-sm tw:max-h-[500px] tw:border-2 tw:border-[var(--color-secondary)] tw:rounded">
                <Table bordered hover striped>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 8, backgroundColor: 'white' }}>
                        <tr>
                            <th>#</th>
                            <th>Mapped property</th>
                            <th>Column type</th>
                            <th>Data Validation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedColumns.map((column, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>

                                <td>
                                    <div className="d-flex justify-content-between">
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
                                        <Input
                                            onChange={(e) => {
                                                const selectedType = TYPE_DROPDOWN_OPTIONS.find(
                                                    (dt) =>
                                                        dt.classId.toLowerCase() === e.target.value.toLowerCase() ||
                                                        dt.name.toLowerCase() === e.target.value.toLowerCase(),
                                                );
                                                if (selectedType) {
                                                    handleChangeColumnType(index, selectedType);
                                                }
                                            }}
                                            value={mappedColumns[index].type?.classId ?? ''}
                                            name="columnType"
                                            type="select"
                                            bsSize="sm"
                                        >
                                            {TYPE_DROPDOWN_OPTIONS.map((option) => (
                                                <option key={option.classId} value={option.classId}>
                                                    {option.name}
                                                </option>
                                            ))}
                                        </Input>
                                    )}
                                </td>
                                <td>
                                    {booleanCellValidation.map((row) => row[index])?.every((cell) => cell) ? (
                                        <span className="badge bg-success">Valid</span>
                                    ) : (
                                        <Tooltip
                                            content={
                                                <>
                                                    {generateInvalidationMessagesForColumn(index).length > 0
                                                        ? generateInvalidationMessagesForColumn(index).slice(0, 5)
                                                        : ''}
                                                    {generateInvalidationMessagesForColumn(index).length > 5 && (
                                                        <div className="mt-1 font-italic">And more errors not shown...</div>
                                                    )}
                                                </>
                                            }
                                        >
                                            <span className="badge bg-danger">
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
                </Table>
            </div>
        </div>
    );
};
export default TypeMapping;
