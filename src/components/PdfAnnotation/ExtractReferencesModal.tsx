import { Alert, Button, Form, Label, ListBox, Modal, Select, toast } from '@heroui/react';
import { cloneDeep } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import { citationKeyToInternalId, formatReferenceValue, getAllReferences } from '@/components/PdfAnnotation/helpers';
import { ReferenceType } from '@/components/PdfAnnotation/types';
import { PREDICATES } from '@/constants/graphSettings';
import { getThing, thingsUrl } from '@/services/backend/things';
import { updateTableData } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

type ExtractReferencesModalProps = {
    id: string;
    isOpen: boolean;
    toggle: () => void;
};

const ColumnLabel: FC<{ column: string }> = ({ column }) => {
    const { data: entity } = useSWR(column && column.startsWith('orkg:') ? [column.replace('orkg:', ''), thingsUrl, 'getThing'] : null, ([params]) =>
        getThing(params),
    );
    return <span>{entity?.label ?? column}</span>;
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
        const [_columns] = [tableData[0]];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setColumns(_columns);
        const [firstColumn] = _columns;
        setSelectedColumn(firstColumn);
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
        const [tableHead, ...tableBody] = _tableData;
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

        toggle();
        if (foundCount > 0) {
            toast.success(`Successfully extracted ${foundCount} out of ${tableBody.length} references`);
        } else {
            toast.danger('No references could be extracted automatically, please add them manually');
        }
    };

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Reference extraction</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        <Alert>
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Description>
                                    References used within a table can be extracted. The extracted data will be added to the table
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                        <Form className="space-y-3">
                            <Select
                                fullWidth
                                name="columnSelect"
                                value={selectedColumn}
                                onChange={(value) => setSelectedColumn((value as string) ?? '')}
                            >
                                <Label htmlFor="columnSelect">Select the column that contains the citation key</Label>
                                <Select.Trigger id="columnSelect">
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        {columns.map((column: string) => (
                                            <ListBox.Item key={`column${column}`} id={column} textValue={column}>
                                                <ColumnLabel column={column} />
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>

                            <Select
                                fullWidth
                                name="columnFormatting"
                                value={formattingType}
                                onChange={(value) => setFormattingType((value as ReferenceType) ?? 'numerical')}
                            >
                                <Label htmlFor="columnFormatting">Select the reference formatting</Label>
                                <Select.Trigger id="columnFormatting">
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="numerical" textValue="Numerical ([1]; [2])">
                                            Numerical ([1]; [2])
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id="author-names" textValue="Author last name (Doe, 2020; Doe et al., 2020)">
                                            Author last name (Doe, 2020; Doe et al., 2020)
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="primary" onPress={handleExtractReferences}>
                            Extract references
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ExtractReferencesModal;
