import { Alert } from '@heroui/react';
import { FC, useState } from 'react';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import Body from '@/app/csv-import/steps/components/Body';
import Header from '@/app/csv-import/steps/components/Header';
import { MappedColumn } from '@/app/csv-import/steps/helpers';

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
                            <strong>Row {i + 1}</strong>- <b>{initialHeaders[j] || `Column ${j + 1}`}</b>: {fromError(cellValidation[i][j]).message}
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
                        <Alert status="warning" className="mt-2 mb-6">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Invalid data detected</Alert.Title>
                                <Alert.Description>
                                    Some cells contain invalid data. Please review the highlighted errors in the table below.
                                    {generateInvalidationMessage().length > 0 && (
                                        <>
                                            <div className="mt-2 mb-1">
                                                <strong>Examples of errors:</strong>
                                            </div>
                                            {generateInvalidationMessage()}
                                            {booleanCellValidation.flat().filter((cell) => cell === false).length > 5 && (
                                                <div className="mt-1 italic">And more errors not shown...</div>
                                            )}
                                        </>
                                    )}
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    <div className="overflow-auto bg-surface text-sm max-h-[500px] border-2 border-secondary rounded">
                        <table className="w-full border-separate border-spacing-0 text-xs [&_th]:border-b [&_th]:border-separator [&_th]:px-2 [&_th]:py-1.5 [&_td]:border-b [&_td]:border-separator [&_td]:px-3 [&_td]:py-2">
                            <thead className="sticky top-0 z-8 bg-white">
                                <tr>
                                    <th className="w-[50px] min-w-[50px] max-w-[65px] sticky left-0 bg-white text-left">#</th>
                                    {mappedColumns.map((column, i) => (
                                        <th
                                            key={i}
                                            className="text-left"
                                            style={{ width: ColumnWidth, minWidth: ColumnWidth, maxWidth: ColumnWidth }}
                                        >
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
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
export default CheckFile;
