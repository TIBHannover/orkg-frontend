import { Dispatch, FC, SetStateAction, useState } from 'react';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import Body from '@/app/csv-import/steps/components/Body';
import Header from '@/app/csv-import/steps/components/Header';
import { MappedColumn } from '@/app/csv-import/steps/helpers';
import Alert from '@/components/Ui/Alert/Alert';
import Table from '@/components/Ui/Table/Table';

type CheckFileProps = {
    data: string[][];
    allCellsValid: boolean;
    initialHeaders: string[];
    booleanCellValidation: boolean[][];
    cellValidation: (boolean | ZodError<unknown> | null | undefined)[][];
    mappedColumns: MappedColumn[];
    setData: (data: string[][]) => void;
    runValidation: (data: string[][], columnTypes: MappedColumn[]) => void;
    debugMode: boolean;
};

const ColumnWidth = '250px';

const CheckFile: FC<CheckFileProps> = ({
    data,
    allCellsValid,
    initialHeaders,
    booleanCellValidation,
    cellValidation,
    mappedColumns,
    setData,
    runValidation,
    debugMode,
}) => {
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);

    const generateInvalidationMessage = () => {
        return booleanCellValidation
            .map((row, i) =>
                row.map((cell, j) =>
                    cell === false ? (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={`error-${i}-${j}`}>
                            <strong>Row {i + 1}</strong> - <b>{initialHeaders[j] || `Column ${j + 1}`}</b>: {fromError(cellValidation[i][j]).message}
                        </div>
                    ) : null,
                ),
            )
            .flat()
            .filter((v) => v !== null)
            .slice(0, 5);
    };

    const onEdit = (rowIndex: number, colIndex: number) => {
        setEditingCell({ rowIndex, colIndex });
    };

    const handleCellChange = (value: string, rowIndex: number, colIndex: number) => {
        const updatedData = [...data];
        updatedData[rowIndex + 1][colIndex] = value;
        setData(updatedData);
        runValidation(updatedData, mappedColumns);
    };

    const handleBlur = () => {
        setEditingCell(null);
    };

    return (
        <div>
            {data && data.length > 0 && (
                <>
                    {!allCellsValid && (
                        <Alert color="danger" className="mt-3" fade={false}>
                            Some cells contain invalid data. Please review the highlighted errors in the table below.
                            {generateInvalidationMessage().length > 0 && (
                                <>
                                    <div className="mt-2 mb-1">
                                        <strong>Examples of errors:</strong>
                                    </div>
                                    {generateInvalidationMessage()}
                                    {booleanCellValidation.flat().filter((cell) => cell === false).length > 5 && (
                                        <div className="mt-1 font-italic">And more errors not shown...</div>
                                    )}
                                </>
                            )}
                        </Alert>
                    )}

                    <div className="tw:overflow-auto tw:bg-[var(--color-light-lighter)] tw:text-sm tw:max-h-[500px] tw:border-2 tw:border-[var(--color-secondary)] tw:rounded">
                        <Table size="sm" bordered hover className="m-0 p-0">
                            <thead className="tw:sticky tw:top-0 tw:z-8 tw:!bg-white">
                                <tr>
                                    <th className="tw:w-[50px] tw:min-w-[50px] tw:max-w-[65px] tw:sticky tw:left-0 tw:!bg-white">#</th>
                                    {mappedColumns.map((column, i) => (
                                        <th key={i} style={{ width: ColumnWidth, minWidth: ColumnWidth, maxWidth: ColumnWidth }}>
                                            <Header debugMode={debugMode} data={data} i={i} column={column} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <Body
                                data={data}
                                mappedColumns={mappedColumns}
                                booleanCellValidation={booleanCellValidation}
                                cellValidation={cellValidation}
                                editingCell={editingCell}
                                onEdit={onEdit}
                                handleCellChange={handleCellChange}
                                handleBlur={handleBlur}
                                debugMode={debugMode}
                            />
                        </Table>
                    </div>
                </>
            )}
        </div>
    );
};
export default CheckFile;
