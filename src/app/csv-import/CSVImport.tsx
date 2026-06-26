'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Checkbox } from '@heroui/react';
import { useEffect, useState } from 'react';
import { ZodError } from 'zod';

import CheckFile from '@/app/csv-import/steps/CheckFile';
import {
    determineColumnType,
    findTypeByIdOrName,
    isDefaultHeader,
    MappedColumn,
    matchHeaderByLabel,
    parseCellString,
} from '@/app/csv-import/steps/helpers';
import MapProperties from '@/app/csv-import/steps/MapProperties';
import MapTypes from '@/app/csv-import/steps/MapTypes';
import UploadForm from '@/app/csv-import/steps/UploadForm';
import { validateColumns, validateCsvStructure, validateRequiredFields, validateValueOfCell } from '@/app/csv-import/steps/validation';
import ConfirmBulkImport from '@/components/ConfirmBulkImport/ConfirmBulkImport';
import Tooltip from '@/components/FloatingUI/Tooltip';
import StepContainer from '@/components/StepContainer';
import DATA_TYPES from '@/constants/DataTypes';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getPredicate, getPredicates } from '@/services/backend/predicates';

const TYPE_DROPDOWN_OPTIONS = DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE && dt.classId !== CLASSES.LIST);

type CsvImportProps = {
    data: string[][];
    setData: (data: string[][]) => void;
    onFinish: (papers: string[], contributions: string[]) => void;
    showUploadForm?: boolean;
};

const CsvImport = ({ data, setData, onFinish, showUploadForm = true }: CsvImportProps) => {
    const [initialHeaders, setInitialHeaders] = useState<string[]>([]);
    const [mappedColumns, setMappedColumns] = useState<MappedColumn[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [columnValidation, setColumnValidation] = useState<string | null>(null);
    const [structuralValidation, setStructuralValidation] = useState<string | null>(null);
    const [cellValidation, setCellValidation] = useState<(boolean | ZodError<unknown> | null | undefined)[][]>([]);

    const handleUpdateData = (newData: string[][]) => {
        setData(newData);
    };

    const escapeCsvValue = (value: string): string => {
        const str = String(value);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const generateCsvContent = (csvData: string[][]): string => {
        return csvData.map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    };

    const handleCsvDownload = () => {
        const csvContent = generateCsvContent(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'ORKG UPDATED DATA.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const runValidation = (_data: string[][], columnTypes: (MappedColumn | null)[]) => {
        setColumnValidation(validateColumns(_data));

        const _cellValidations = _data.slice(1).map((row) => {
            const requiredFieldsError = validateRequiredFields(row, columnTypes);

            return row.map((cell, colIndex) => {
                const currentColumn = columnTypes[colIndex];
                if (!currentColumn) return false;

                if (requiredFieldsError && (currentColumn.predicate?.id === 'title' || currentColumn.predicate?.id === PREDICATES.HAS_DOI)) {
                    return requiredFieldsError;
                }

                return validateValueOfCell(cell, currentColumn, true);
            });
        });
        setCellValidation(_cellValidations);
    };

    const mapPropertyToExistingByLabel = async (propertyLabel: string) => {
        try {
            const fetchedPredicate = await getPredicates({ q: propertyLabel, exact: true });
            if (fetchedPredicate.page.total_elements) {
                return fetchedPredicate.content[0];
            }
        } catch (error) {
            console.error('Error fetching predicate:', error);
        }
        return null;
    };

    const mapPropertyToExistingById = async (propertyId: string) => {
        try {
            const predicate = await getPredicate(propertyId);
            return predicate;
        } catch (error) {
            console.error('Error fetching predicate:', error);
        }
        return null;
    };

    const handleOnFileLoaded = async ({ _data }: { _data?: string[][] }) => {
        const _d = _data ?? data;
        const structuralError = validateCsvStructure(_d);
        setStructuralValidation(structuralError);

        if (structuralError) {
            setInitialHeaders([]);
            setMappedColumns([]);
            handleUpdateData([]);
            setColumnValidation(null);
            setCellValidation([]);
            setIsFinished(false);
            return;
        }

        setInitialHeaders(_d[0]);
        const newData = [..._d];
        const rows = _d.slice(1);
        const types = newData[0].map((header, colIndex) => {
            const { hasTypeInfo, typeStr } = parseCellString(header);
            if (hasTypeInfo && typeStr) {
                const typeObj = findTypeByIdOrName(typeStr);
                if (typeObj) {
                    return typeObj;
                }
            }
            return determineColumnType(
                rows.map((row) => row[colIndex]),
                TYPE_DROPDOWN_OPTIONS,
            );
        });
        const _mappingColumns = await Promise.all(
            newData[0].map(async (header, colIndex) => {
                const { label, entityId } = parseCellString(header);
                let matchedProperty = matchHeaderByLabel(label);

                if (!matchedProperty) {
                    if (entityId) {
                        const fetchedProperty = await mapPropertyToExistingById(entityId);
                        matchedProperty = fetchedProperty || null;
                    } else {
                        const fetchedProperty = await mapPropertyToExistingByLabel(label);
                        matchedProperty = fetchedProperty || null;
                    }
                }

                return {
                    predicate: matchedProperty ?? null,
                    inputValue: label,
                    type: types[colIndex],
                };
            }),
        );

        newData[0] = _mappingColumns.map(
            (header) =>
                `${header.predicate?.id ? `${isDefaultHeader(header.predicate.id) ? '' : 'orkg:'}${header.predicate.id}` : header.inputValue}${
                    (header.predicate && !isDefaultHeader(header.predicate.id)) || (!header.predicate && header.type)
                        ? `<${header.type?.classId}>`
                        : ''
                }`,
        );
        setIsFinished(false);
        setMappedColumns(_mappingColumns);
        handleUpdateData(newData);
        runValidation(newData, _mappingColumns);
    };

    useEffect(() => {
        if (!showUploadForm && mappedColumns.length === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleOnFileLoaded({});
        }
    }, [mappedColumns, showUploadForm]);

    const booleanCellValidation = cellValidation.map((row) => row.map((cell) => (typeof cell === 'boolean' ? cell : !cell)));

    const allCellsValid = booleanCellValidation.every((row) => row.every((cell) => cell));

    const stepCounter = showUploadForm ? 0 : -1;
    return (
        <div>
            {showUploadForm && (
                <StepContainer
                    step={`${stepCounter + 1}`}
                    title={
                        <>
                            CSV import
                            <Tooltip content="Open help center">
                                <span className="ml-4">
                                    <a
                                        href="https://www.orkg.org/help-center/article/16/Import_CSV_files_in_ORKG"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FontAwesomeIcon
                                            icon={faQuestionCircle}
                                            style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }}
                                            className="text-secondary p-0"
                                        />
                                    </a>
                                </span>
                            </Tooltip>
                        </>
                    }
                    bottomLine
                    active
                    hasBorder={!showUploadForm}
                >
                    <UploadForm handleOnFileLoaded={handleOnFileLoaded} />
                    {structuralValidation && (
                        <Alert status="danger" className="mt-4">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>CSV Structure Error</Alert.Title>
                                <Alert.Description>{structuralValidation}</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}
                </StepContainer>
            )}
            <StepContainer
                step={`${stepCounter + 2}`}
                title="Map properties"
                topLine={showUploadForm}
                bottomLine
                active={mappedColumns.length > 0 && data && data.length > 0}
                hasBorder={!showUploadForm}
            >
                <MapProperties
                    columnValidation={columnValidation}
                    data={data}
                    initialHeaders={initialHeaders}
                    mappedColumns={mappedColumns}
                    setMappedColumns={setMappedColumns}
                    setData={handleUpdateData}
                    runValidation={runValidation}
                />
            </StepContainer>
            <StepContainer
                step={`${stepCounter + 3}`}
                title="Map column types"
                topLine
                bottomLine
                active={mappedColumns.length > 0 && data && data.length > 0}
                hasBorder={!showUploadForm}
            >
                <MapTypes
                    columnValidation={columnValidation}
                    data={data}
                    mappedColumns={mappedColumns}
                    setMappedColumns={setMappedColumns}
                    setData={handleUpdateData}
                    runValidation={runValidation}
                    cellValidation={cellValidation}
                    booleanCellValidation={booleanCellValidation}
                />
            </StepContainer>
            <StepContainer
                step={`${stepCounter + 4}`}
                title={
                    <div className="flex justify-between">
                        Check file{' '}
                        {data && data.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Checkbox id="csv-debug-mode" isSelected={debugMode} onChange={setDebugMode}>
                                    <Checkbox.Content className="text-sm font-normal">
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        Debug mode
                                    </Checkbox.Content>
                                </Checkbox>
                                <Button variant="secondary" size="sm" onPress={handleCsvDownload}>
                                    Export as CSV
                                </Button>
                            </div>
                        )}
                    </div>
                }
                topLine
                bottomLine
                active={mappedColumns.length > 0 && data && data.length > 0}
                hasBorder={!showUploadForm}
            >
                <CheckFile
                    data={data}
                    allCellsValid={allCellsValid}
                    initialHeaders={initialHeaders}
                    booleanCellValidation={booleanCellValidation}
                    cellValidation={cellValidation}
                    mappedColumns={mappedColumns}
                    setData={handleUpdateData}
                    runValidation={runValidation}
                    debugMode={debugMode}
                />
            </StepContainer>
            <StepContainer
                step={`${stepCounter + 5}`}
                title="Import papers"
                topLine
                active={mappedColumns.length > 0 && data && data.length > 0 && allCellsValid && !columnValidation}
                hasBorder={!showUploadForm}
            >
                {!isFinished ? (
                    <Button variant="primary" onPress={() => setIsOpenConfirmModal(true)}>
                        Preview & import
                    </Button>
                ) : (
                    <Button variant="primary" isDisabled>
                        Import finished
                    </Button>
                )}

                {isOpenConfirmModal && (
                    <ConfirmBulkImport
                        data={data}
                        isOpen={isOpenConfirmModal}
                        toggle={() => setIsOpenConfirmModal((v) => !v)}
                        onFinish={(papers: string[], contributions: string[]) => {
                            setIsFinished(true);
                            onFinish?.(papers, contributions);
                        }}
                    />
                )}
            </StepContainer>
        </div>
    );
};

export default CsvImport;
