import { cloneDeep } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import ColumnOption from '@/components/PdfAnnotation/ColumnOption';
import { citationKeyToInternalId, formatReferenceValue, getAllReferences } from '@/components/PdfAnnotation/helpers';
import { ReferenceType } from '@/components/PdfAnnotation/types';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { PREDICATES } from '@/constants/graphSettings';
import { updateTableData } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

type ExtractReferencesModalProps = {
    id: string;
    isOpen: boolean;
    toggle: () => void;
};

const ExtractReferencesModal: FC<ExtractReferencesModalProps> = ({ id, isOpen, toggle }) => {
    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [formattingType, setFormattingType] = useState<ReferenceType>('numerical');
    const [parsedPdfData, setParsePdfData] = useState<Document | undefined>(undefined);
    const tableData = useSelector((state: RootStore) => state.pdfAnnotation.tableData[id]);
    const pdfData = useSelector((state: RootStore) => state.pdfAnnotation.parsedPdfData);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!tableData || tableData.length === 0) {
            return;
        }
        const _columns = tableData[0];
        setColumns(_columns);
        setSelectedColumn(_columns[0]); // select the first option
    }, [tableData, setColumns, setSelectedColumn]);

    useEffect(() => {
        if (!pdfData) {
            return;
        }
        const parsePdf = async () => setParsePdfData(await new window.DOMParser().parseFromString(pdfData, 'text/xml'));
        parsePdf();
    }, [pdfData]);

    const handleExtractReferences = () => {
        if (!parsedPdfData) {
            return;
        }
        const idMapping = citationKeyToInternalId(parsedPdfData);
        const allReferences = getAllReferences(parsedPdfData, formattingType);
        const _tableData = cloneDeep([...tableData]);
        const tableHead = _tableData[0];
        const tableBody = _tableData.slice(1);
        const columnIndex = tableHead.indexOf(selectedColumn);
        const paperColumns = [
            'title',
            ...[
                PREDICATES.HAS_AUTHORS,
                PREDICATES.HAS_PUBLICATION_MONTH,
                PREDICATES.HAS_PUBLICATION_YEAR,
                PREDICATES.HAS_DOI,
                PREDICATES.HAS_RESEARCH_FIELD,
            ].map((column) => `orkg:${column}`),
        ];
        const paperColumnsIndex: Record<string, number> = {};

        const tableUpdates = [];

        for (const column of paperColumns) {
            if (tableHead.indexOf(column) === -1) {
                tableUpdates.push([0, tableHead.length, null, column]);
                tableHead.push(column);
                paperColumnsIndex[column] = tableHead.length - 1;
            } else {
                paperColumnsIndex[column] = tableHead.indexOf(column);
            }
        }

        let foundCount = 0;
        for (const [index, row] of tableBody.entries()) {
            const value = formatReferenceValue(row[columnIndex], formattingType);
            const rowNumber = index + 1;
            if (value) {
                let internalId = '';
                if (formattingType === 'numerical') {
                    internalId = idMapping[value];
                } else {
                    internalId = value;
                }

                // Only process if the citation has been found
                if (internalId) {
                    const reference = allReferences[internalId];

                    if (reference) {
                        foundCount += 1;
                        tableUpdates.push([rowNumber, paperColumnsIndex.title, null, reference.title]);
                        tableUpdates.push([
                            rowNumber,
                            paperColumnsIndex[`orkg:${PREDICATES.HAS_PUBLICATION_MONTH}`],
                            null,
                            reference.publicationMonth,
                        ]);
                        tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_PUBLICATION_YEAR}`], null, reference.publicationYear]);
                        tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_DOI}`], null, reference.doi]);
                        tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_AUTHORS}`], null, reference.authors.join(';')]);
                        tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_RESEARCH_FIELD}`], null, '']);
                    }
                } else {
                    tableUpdates.push([rowNumber, paperColumnsIndex.title, null, '']);
                    tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_PUBLICATION_MONTH}`], null, '']);
                    tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_PUBLICATION_YEAR}`], null, '']);
                    tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_DOI}`], null, '']);
                    tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_AUTHORS}`], null, '']);
                    tableUpdates.push([rowNumber, paperColumnsIndex[`orkg:${PREDICATES.HAS_RESEARCH_FIELD}`], null, '']);
                }
            }
        }

        dispatch(updateTableData({ id, dataChanges: tableUpdates }));

        // close the modal
        toggle();
        if (foundCount > 0) {
            toast.success(`Successfully extracted ${foundCount} out of ${tableBody.length} references`);
        } else {
            toast.error('No references could be extracted automatically, please add them manually');
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Reference extraction</ModalHeader>
            <ModalBody>
                <Alert color="info">References used within a table can be extracted. The extracted data will be added to the table</Alert>
                <Form>
                    <FormGroup>
                        <Label for="columnSelect">Select the column that contains the citation key</Label>
                        <Input type="select" value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} id="columnSelect">
                            {columns.map((column: string) => (
                                <ColumnOption key={`column${column}`} column={column} />
                            ))}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Label for="columnFormatting">Select the reference formatting</Label>
                        <Input
                            type="select"
                            value={formattingType}
                            onChange={(e) => setFormattingType(e.target.value as ReferenceType)}
                            id="columnFormatting"
                        >
                            <option value="numerical">Numerical ([1]; [2])</option>
                            <option value="author-names">Author last name (Doe, 2020; Doe et al., 2020)</option>
                            {/*
                            <option value="author-names2">Author last name (Doe, 2020; Doe and Reed, 2020; Doe et al., 2020)</option>
                            <option value="author-names3">
                                Author last name (Doe, 2020; Doe and Reed, 2020; Doe and Reed and Li 2020; Doe et al. 2020)
                            </option>
                            */}
                        </Input>
                    </FormGroup>
                </Form>
            </ModalBody>

            <ModalFooter>
                <Button color="primary" onClick={handleExtractReferences}>
                    Extract references
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ExtractReferencesModal;
