import { faCheck, faPen, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC } from 'react';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

import ResourceCell from '@/app/csv-import/steps/components/ResourceCell';
import { MappedColumn } from '@/app/csv-import/steps/helpers';
import ActionButton from '@/components/ActionButton/ActionButton';
import InputField from '@/components/InputField/InputField';

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
                    <th scope="row" className="sticky left-0 bg-white z-5 text-left">
                        {i + 1}
                    </th>
                    {row.map((value, j) => {
                        const isInvalid = !booleanCellValidation[i][j];
                        const isEditing = Boolean(editingCell && editingCell.rowIndex === i && editingCell.colIndex === j);
                        return (
                            <td
                                key={j}
                                className={`relative group align-top ${isInvalid ? 'bg-danger/10 shadow-[inset_3px_0_0_0_var(--danger)] pe-8' : ''}`}
                                aria-invalid={isInvalid || undefined}
                            >
                                {debugMode && (
                                    <div className="flex justify-between items-center">
                                        <div>{value}</div>
                                    </div>
                                )}
                                {!debugMode && (
                                    <div>
                                        {isEditing ? (
                                            <div className="flex flex-col grow" style={{ maxWidth: '250px' }}>
                                                <div className="flex items-stretch min-h-8 grow flex-nowrap">
                                                    <InputField
                                                        inputValue={row[j]}
                                                        setInputValue={(v: string) => handleCellChange(v, i, j)}
                                                        dataType={mappedColumns[j].type.type}
                                                        isValid
                                                        inputFormType={mappedColumns[j].type.inputFormType}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        type="submit"
                                                        variant="secondary"
                                                        isIconOnly
                                                        className="!h-9 !rounded-s-none -ms-px px-2"
                                                        onPress={handleBlur}
                                                        aria-label="Close"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div onDoubleClick={() => onEdit(i, j)}>
                                                <ResourceCell data={value} columnDataType={mappedColumns[j].type.type} />
                                            </div>
                                        )}
                                        {!isEditing && (
                                            <>
                                                {isInvalid && (
                                                    <Tooltip delay={200}>
                                                        <Tooltip.Trigger>
                                                            <span
                                                                className="absolute right-1.5 top-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger/15 text-danger ring-1 ring-inset ring-danger/30 cursor-help text-xs"
                                                                aria-label="Validation error"
                                                            >
                                                                <FontAwesomeIcon icon={faWarning} />
                                                            </span>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content showArrow className="max-w-xs">
                                                            <Tooltip.Arrow />
                                                            {fromError(cellValidation[i][j])?.message}
                                                        </Tooltip.Content>
                                                    </Tooltip>
                                                )}
                                                <div
                                                    className={`absolute top-[3px] px-2 hidden group-hover:block ${
                                                        isInvalid ? 'right-7' : 'right-0'
                                                    }`}
                                                >
                                                    <ActionButton title="Edit" icon={faPen} action={() => onEdit(i, j)} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    );
};
export default Body;
