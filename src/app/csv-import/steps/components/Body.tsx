import { faCheck, faPen, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import ResourceCell from '@/app/csv-import/steps/components/ResourceCell';
import { MappedColumn } from '@/app/csv-import/steps/helpers';
import ActionButton from '@/components/ActionButton/ActionButton';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Ui/Button/Button';
import InputGroup from '@/components/Ui/Input/InputGroup';

type BodyProps = {
    data: string[][];
    mappedColumns: MappedColumn[];
    booleanCellValidation: boolean[][];
    cellValidation: (boolean | ZodError<unknown> | null | undefined)[][];
    editingCell: { rowIndex: number; colIndex: number } | null;
    onEdit: (rowIndex: number, colIndex: number) => void;
    handleCellChange: (value: string, rowIndex: number, colIndex: number) => void;
    handleBlur: () => void;
    debugMode: boolean;
};

const Body: FC<BodyProps> = ({
    data,
    mappedColumns,
    booleanCellValidation,
    cellValidation,
    editingCell,
    onEdit,
    handleCellChange,
    handleBlur,
    debugMode,
}) => {
    return (
        <tbody>
            {data.slice(1).map((row, i) => (
                <tr key={i}>
                    <th scope="row" className="tw:sticky tw:left-0 tw:!bg-white tw:z-5">
                        {i + 1}
                    </th>
                    {row.map((value, j) => (
                        <td key={j} className={`tw:relative tw:group ${booleanCellValidation[i][j] ? '' : 'bg-danger bg-opacity-10'}`}>
                            {debugMode && (
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>{value}</div>
                                </div>
                            )}
                            {!debugMode && (
                                <div>
                                    {editingCell && editingCell.rowIndex === i && editingCell.colIndex === j ? (
                                        <div className="d-flex flex-column flex-grow-1" style={{ maxWidth: '250px' }}>
                                            <InputGroup size="sm" className="flex-grow-1 flex-nowrap">
                                                <InputField
                                                    inputValue={row[j]}
                                                    setInputValue={(v: string) => handleCellChange(v, i, j)}
                                                    dataType={mappedColumns[j].type.type}
                                                    isValid
                                                    inputFormType={mappedColumns[j].type.inputFormType}
                                                />
                                                <Button size="sm" type="submit" color="secondary" className="px-2" onClick={handleBlur} title="Close">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </Button>
                                            </InputGroup>
                                        </div>
                                    ) : (
                                        <div onDoubleClick={() => onEdit(i, j)}>
                                            <ResourceCell data={value} columnDataType={mappedColumns[j].type.type} />
                                        </div>
                                    )}
                                    <div className="tw:absolute tw:right-0 tw:top-[3px] tw:px-2 tw:hidden tw:group-hover:block">
                                        {!booleanCellValidation[i][j] && (
                                            <ActionButton title={fromError(cellValidation[i][j])?.message} icon={faWarning} action={undefined} />
                                        )}
                                        <ActionButton title="Edit" icon={faPen} action={() => onEdit(i, j)} />
                                    </div>
                                </div>
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};
export default Body;
