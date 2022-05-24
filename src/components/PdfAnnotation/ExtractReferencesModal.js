import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { updateTableData } from 'slices/pdfAnnotationSlice';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep, isString } from 'lodash';

const ExtractReferencesModal = props => {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [formattingType, setFormattingType] = useState('numerical');
    const [parsedPdfData, setParsePdfData] = useState({});
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const pdfData = useSelector(state => state.pdfAnnotation.parsedPdfData);
    const cachedLabels = useSelector(state => state.pdfAnnotation.cachedLabels);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!tableData || tableData.length === 0) {
            return;
        }

        const columns = tableData[0];

        setColumns(columns);
        setSelectedColumn(columns[0]); // select the first option
    }, [tableData, setColumns, setSelectedColumn]);

    useEffect(() => {
        const parsePdf = async () => setParsePdfData(await new window.DOMParser().parseFromString(pdfData, 'text/xml'));
        parsePdf();
    }, [pdfData]);

    // builds an object to convert citation keys used in the paper's text (e.g., [10]) and maps them to the internal IDs
    const citationKeyToInternalId = () => {
        const mapping = {};
        const references = parsedPdfData.querySelectorAll('ref[type="bibr"]');

        for (const reference of references) {
            const internalId = reference.getAttribute('target');

            if (!internalId) {
                continue;
            }

            const internalIdClean = internalId.replace('#', '');
            const citationKey = reference.innerHTML;
            const citationKeyClean = citationKey.replace('[', '').replace(']', '');

            if (!isNaN(citationKeyClean)) {
                mapping[citationKeyClean] = internalIdClean;
            }
        }
        return mapping;
    };

    const handleExtractReferences = () => {
        props.clearImportError();
        const idMapping = citationKeyToInternalId();
        const allReferences = getAllReferences();
        const _tableData = cloneDeep([...tableData]);
        const tableHead = _tableData[0];
        const tableBody = _tableData.slice(1);
        const columnIndex = tableHead.indexOf(selectedColumn);
        const paperColumns = [
            'paper:title',
            'paper:authors',
            'paper:publication_month',
            'paper:publication_year',
            'paper:doi',
            'paper:research_field',
            'contribution:research_problem',
        ];
        const paperColumnsIndex = {};

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
            const value = formatReferenceValue(row[columnIndex]);

            if (!value) {
                continue;
            }

            const rowNumber = index + 1;

            let internalId = '';
            if (formattingType === 'numerical') {
                internalId = idMapping[value];
            } else {
                internalId = value;
            }

            // only continue if the citation has been found
            if (!internalId) {
                continue;
            }

            const reference = allReferences[internalId];

            if (reference) {
                foundCount++;
                tableUpdates.push([rowNumber, paperColumnsIndex['paper:title'], null, reference.title]);
                tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_month'], null, reference.publicationMonth]);
                tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_year'], null, reference.publicationYear]);
                tableUpdates.push([rowNumber, paperColumnsIndex['paper:doi'], null, reference.doi]);
                tableUpdates.push([rowNumber, paperColumnsIndex['paper:authors'], null, reference.authors.join(';')]);
            }
        }

        dispatch(updateTableData({ id: props.id, dataChanges: tableUpdates }));

        // close the modal
        props.toggle();
        if (foundCount > 0) {
            toast.success(`Successfully extracted ${foundCount} out of ${tableBody.length} references`);
        } else {
            toast.error('No references could be extracted automatically, please add them manually');
        }
    };

    const formatReferenceValue = value => {
        if (formattingType === 'numerical' && isString(value)) {
            value = value.match(/\[\d+\]/i);

            if (!value || value.length === 0) {
                return;
            }
            value = value[0];
            value = value.replace('[', '').replace(']', '');
            return value;
        }
        if (formattingType === 'author-names' && isString(value)) {
            value = value.replace(/\s/g, ''); // remove spaces
            value = value.replace('&amp;', '&');
            value = value.replace('(', '');
            value = value.replace(')', '');
            value = value.replace('.', '');
            value = value.replace(',', '');
            value = value.toLowerCase();
            return value;
        }
    };

    const getAllReferences = () => {
        const references = parsedPdfData.querySelectorAll('back [type="references"] biblStruct');
        const referencesParsed = {};

        for (const reference of references) {
            let title = '';
            let doi = '';
            let publicationMonth = '';
            let publicationYear = '';
            let authors = [];

            // title
            const _title = reference.querySelector('analytic title') || reference.querySelector('monogr title');
            if (_title) {
                title = _title.innerHTML;
            }

            // doi
            const _doi = reference.querySelector('idno[type="DOI"]');
            if (_doi) {
                doi = _doi.innerHTML;
            }

            // publication month & year
            const publishedDate = reference.querySelector('monogr imprint date[when]');
            if (publishedDate) {
                const parsedData = publishedDate.getAttribute('when').split('-');

                if (parsedData.length > 0) {
                    publicationYear = parseInt(parsedData[0]);
                }
                if (parsedData.length > 1) {
                    publicationMonth = parseInt(parsedData[1]);
                }
            }

            // authors
            authors = parseAuthors(reference);

            let id = '';
            if (formattingType === 'numerical') {
                id = reference.getAttribute('xml:id');
            } else {
                id = generateCitationKeyFromAuthors(reference) + publicationYear;
            }

            referencesParsed[id] = {
                title,
                doi,
                publicationMonth,
                publicationYear,
                authors,
            };
        }

        return referencesParsed;
    };

    const generateCitationKeyFromAuthors = reference => {
        const authors = reference.querySelectorAll('analytic author');

        let key = '';

        for (const [index, author] of authors.entries()) {
            let lastName = '';

            const _lastName = author.querySelector('surname');
            if (_lastName) {
                lastName = _lastName.innerHTML;
            }

            if (index === 0) {
                key = lastName;

                if (formattingType === 'author-names') {
                    if (authors.length >= 2) {
                        key += 'etal';
                    }
                    break;
                }
            } else if (index === 1 && authors.length === 2) {
                key = `${key}and${lastName}`;
            } else if (index === 2) {
                key += 'etal';
                break;
            }
        }
        key = isString(key) && key.toLowerCase();

        return key;
    };

    const parseAuthors = reference => {
        const authors = reference.querySelectorAll('analytic author');

        const authorsParsed = [];

        for (const author of authors) {
            let firstName = '';
            let middleName = '';
            let lastName = '';

            const _firstName = author.querySelector('forename[type="first"]');
            if (_firstName) {
                firstName = `${_firstName.innerHTML} `;
            }

            const _middleName = author.querySelector('forename[type="middle"]');
            if (_middleName) {
                middleName = `${_middleName.innerHTML} `;
            }

            const _lastName = author.querySelector('surname');
            if (_lastName) {
                lastName = _lastName.innerHTML;
            }

            authorsParsed.push(firstName + middleName + lastName);
        }

        return authorsParsed;
    };

    const getColumnLabel = column => {
        if (column && isString(column) && column.startsWith('orkg:')) {
            column = column.replace(/^(orkg:)/, '');
        }

        return cachedLabels[column] ?? column;
    };

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Reference extraction</ModalHeader>
            <ModalBody>
                <Alert color="info">References used within a table can be extracted. The extracted data will be added to the table</Alert>
                <Form>
                    <FormGroup>
                        <Label for="columnSelect">Select the column that contains the citation key</Label>
                        <Input type="select" value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)} id="columnSelect">
                            {columns.map((column, i) => (
                                <option key={column + i}>{getColumnLabel(column)}</option>
                            ))}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Label for="columnFormatting">Select the reference formatting</Label>
                        <Input type="select" value={formattingType} onChange={e => setFormattingType(e.target.value)} id="columnFormatting">
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

ExtractReferencesModal.propTypes = {
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    clearImportError: PropTypes.func.isRequired,
};

export default ExtractReferencesModal;
