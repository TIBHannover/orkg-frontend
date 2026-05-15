import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '@heroui/react';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import { DEFAULT_HEADERS, MappedColumn } from '@/app/csv-import/steps/helpers';
import ActionButton from '@/components/ActionButton/ActionButton';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type PropertyMappingProps = {
    data: string[][];
    initialHeaders: string[];
    mappedColumns: MappedColumn[];
    setMappedColumns: Dispatch<SetStateAction<MappedColumn[]>>;
    setData: (data: string[][]) => void;
    runValidation: (data: string[][], mappedDataTypes: MappedColumn[]) => void;
    columnValidation: string | null;
};

const PropertyMapping: FC<PropertyMappingProps> = ({
    data,
    initialHeaders,
    mappedColumns,
    setMappedColumns,
    setData,
    runValidation,
    columnValidation,
}) => {
    const [isOpenConfirmPropertyModal, setIsOpenConfirmPropertyModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [currentColIndex, setCurrentColIndex] = useState(0);
    const [isEditingColumn, setIsEditingColumn] = useState<boolean[]>(Array(mappedColumns.length).fill(false));

    const handleSetHeader = (value: SingleValue<OptionType>, colIndex: number) => {
        const _mappedColumns = [...mappedColumns];
        _mappedColumns[colIndex] = {
            predicate: value,
            inputValue: value?.label || mappedColumns[colIndex].inputValue,
            type: mappedColumns[colIndex].type,
        };
        setMappedColumns(_mappedColumns);
        const updatedData = [...data];
        const id = value?.id || updatedData[0][colIndex];
        if (value && !DEFAULT_HEADERS.map((option) => option.id).includes(id)) {
            updatedData[0][colIndex] = `orkg:${value?.id}${_mappedColumns[colIndex].type ? `<${_mappedColumns[colIndex].type?.classId}>` : ''}`;
        } else {
            updatedData[0][colIndex] = value?.id || updatedData[0][colIndex];
        }
        setIsEditingColumn((prev) => [...prev.slice(0, colIndex), false, ...prev.slice(colIndex + 1)]);
        setData(updatedData);
        runValidation(updatedData, _mappedColumns);
    };

    const extractIDPredicate = (_predicate: { id: string; label: string }) => {
        if (_predicate.id.includes('orkg:')) {
            const splitResult = _predicate.label.split('orkg:')[1];
            return splitResult;
        }
        return '';
    };

    const handleEditHeader = (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, colIndex: number) => {
        if (selected && action.action === 'create-option') {
            setIsOpenConfirmPropertyModal(true);
            setPropertyLabel(selected.label);
            setCurrentColIndex(colIndex);
        } else {
            handleSetHeader(selected, colIndex);
        }
    };

    const handleCreate = (property: { description?: string; label?: string; id: string }) => {
        handleSetHeader(property as OptionType, currentColIndex);
    };

    return (
        <div>
            {isOpenConfirmPropertyModal && (
                <ConfirmCreatePropertyModal
                    isOpen={isOpenConfirmPropertyModal}
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmPropertyModal((v) => !v)}
                />
            )}
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
                            <th className="text-left">Initial column name</th>
                            <th className="text-left">Mapped property</th>
                            <th className="text-left">Property Validation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mappedColumns.map((column, index) => (
                            <tr key={index}>
                                <th scope="row" className="text-left">
                                    {index + 1}
                                </th>
                                <td>{initialHeaders[index]}</td>
                                {isEditingColumn[index] ? (
                                    <td>
                                        <Autocomplete
                                            entityType={ENTITIES.PREDICATE}
                                            onChange={(value, action) => handleEditHeader(value, action, index)}
                                            inputValue={!column?.predicate ? column.inputValue : undefined}
                                            defaultValueId={
                                                column.predicate?.id && column.predicate.id.startsWith('orkg:')
                                                    ? extractIDPredicate(column.predicate)
                                                    : undefined
                                            }
                                            value={column.predicate}
                                            additionalOptions={DEFAULT_HEADERS}
                                            size="sm"
                                            allowCreate
                                            autoFocus
                                            onInputChange={(value, action) => {
                                                if (action?.action !== 'input-blur' && action?.action !== 'menu-close') {
                                                    setMappedColumns((prevColumns) => {
                                                        const updatedColumns = [...prevColumns];
                                                        updatedColumns[index].inputValue = value;
                                                        return updatedColumns;
                                                    });
                                                }
                                            }}
                                            onBlur={() => setIsEditingColumn((prev) => [...prev.slice(0, index), false, ...prev.slice(index + 1)])}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                ) : (
                                    <td>
                                        <div className="flex justify-between">
                                            {column.predicate?.id ? (
                                                <DescriptionTooltip
                                                    id={column.predicate?.id}
                                                    _class={column.predicate?._class ?? ENTITIES.PREDICATE}
                                                    disabled={column.predicate?.hideLink}
                                                >
                                                    {column.predicate?.hideLink ? (
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

                                            <ActionButton
                                                title="Edit"
                                                icon={faPen}
                                                action={() => setIsEditingColumn((prev) => [...prev.slice(0, index), true, ...prev.slice(index + 1)])}
                                            />
                                        </div>
                                    </td>
                                )}

                                <td>
                                    {column?.predicate ? (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white">
                                            Mapped property
                                        </span>
                                    ) : (
                                        <Tooltip content="Please select a property, otherwise a new property will be created.">
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-red-600 text-white">
                                                Unmapped property
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
export default PropertyMapping;
