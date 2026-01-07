'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
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

    // Function to properly escape CSV values
    const escapeCsvValue = (value: string): string => {
        // Convert to string if not already
        const str = String(value);

        // If the value contains double quotes, commas, newlines, or carriage returns, it needs to be quoted
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
            // Escape double quotes by doubling them and wrap the entire value in quotes
            return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
    };

    // Function to generate properly escaped CSV content
    const generateCsvContent = (csvData: string[][]): string => {
        return csvData.map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\n');
    };

    // Function to handle CSV download
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
            // Validate required fields (title/doi) once per row
            const requiredFieldsError = validateRequiredFields(row, columnTypes);

            return row.map((cell, colIndex) => {
                const currentColumn = columnTypes[colIndex];
                if (!currentColumn) return false;

                // If there's a required fields error and this is a title or doi column, return that error
                if (requiredFieldsError && (currentColumn.predicate?.id === 'title' || currentColumn.predicate?.id === PREDICATES.HAS_DOI)) {
                    return requiredFieldsError;
                }

                // Otherwise, validate the individual cell
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
        // First, validate the CSV structure
        const _d = _data ?? data;
        const structuralError = validateCsvStructure(_d);
        setStructuralValidation(structuralError);

        if (structuralError) {
            // If there are structural issues, stop processing and clear existing data
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
        // Step 1: determine column types either from header<type> or by auto-detection
        const rows = _d.slice(1);
        const types = newData[0].map((header, colIndex) => {
            const { hasTypeInfo, typeStr } = parseCellString(header);
            if (hasTypeInfo && typeStr) {
                // If a type is specified in the header (e.g., <string>), use it directly
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
        // Step 2: map columns by trimming of a <type>, if provided
        const _mappingColumns = await Promise.all(
            newData[0].map(async (header, colIndex) => {
                const { label, entityId } = parseCellString(header);
                let matchedProperty = matchHeaderByLabel(label); // if label fits with the default properties

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
                                <span className="ms-3">
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
                        <div className="mt-3">
                            <div className="alert alert-danger" role="alert">
                                <strong>CSV Structure Error:</strong> {structuralValidation}
                            </div>
                        </div>
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
                    <div className="d-flex justify-content-between">
                        Check file{' '}
                        {data && data.length > 0 && (
                            <div className="d-flex align-items-center">
                                <FormGroup check className="me-2 d-flex align-items-center" style={{ fontSize: '14px' }}>
                                    <Label check>
                                        <Input type="checkbox" onChange={() => setDebugMode((v) => !v)} checked={debugMode} /> Debug mode
                                    </Label>
                                </FormGroup>
                                <Button className="text-decoration-none btn-sm btn-secondary btn" onClick={handleCsvDownload}>
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
                    <Button color="primary" onClick={() => setIsOpenConfirmModal(true)}>
                        Preview & import
                    </Button>
                ) : (
                    <Button color="primary" disabled>
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
