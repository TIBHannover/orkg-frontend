import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { updateTableData } from '../../actions/pdfAnnotation';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';

const ExtractReferencesModal = props => {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState('');
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const parsedPdfData = useSelector(state => state.pdfAnnotation.parsedPdfData);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!tableData || tableData.length === 0) {
            return;
        }

        const columns = tableData[0];

        setColumns(columns);
        setSelectedColumn(columns[0]); // select the first option
    }, [tableData, setColumns, setSelectedColumn]);

    const handleSelectColumn = e => {
        setSelectedColumn(e.target.value);
    };

    // builds an object to convert citation keys used in the paper's text (e.g., [10]) and maps them to the internal IDs
    const citationKeyToInternalId = () => {
        const references = parsedPdfData.querySelectorAll('ref[type="bibr"]');

        const mapping = {};

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
        const idMapping = citationKeyToInternalId();
        const allReferences = getAllReferences();
        const tableHead = tableData[0];
        const tableBody = tableData.slice(1);
        const columnIndex = tableHead.indexOf(selectedColumn);
        const paperColumns = [
            'paper:title',
            'paper:authors',
            'paper:publication_month',
            'paper:publication_year',
            //'paper:research_field',
            //'contribution:research_problem',
            'paper:doi'
        ];
        const paperColumnsIndex = {};

        for (const column of paperColumns) {
            if (tableHead.indexOf(column) === -1) {
                dispatch(updateTableData(props.id, [[0, tableHead.length, null, column]]));
                paperColumnsIndex[column] = tableHead.length - 1;
            } else {
                paperColumnsIndex[column] = tableHead.indexOf(column);
            }
        }

        const tableUpdates = [];
        let foundCount = 0;
        for (const [index, row] of tableBody.entries()) {
            const value = row[columnIndex];
            const rowNumber = index + 1;

            const internalId = idMapping[value];

            // only continue if the citation has been found
            if (internalId) {
                const reference = allReferences[internalId];

                if (reference) {
                    foundCount++;
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:title'], null, reference['title']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_month'], null, reference['publicationMonth']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_year'], null, reference['publicationYear']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:doi'], null, reference['doi']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:authors'], null, reference['authors'].join(';')]);
                }
            }

            dispatch(updateTableData(props.id, tableUpdates));
        }

        // close the modal
        props.toggle();
        if (foundCount > 0) {
            toast.success(`Successfully extracted ${foundCount} out of ${tableBody.length} references`);
        } else {
            toast.error('No references could be extracted automatically, please add them manually');
        }
    };

    const getAllReferences = () => {
        const references = parsedPdfData.querySelectorAll('back [type="references"] biblStruct');
        const referencesParsed = {};

        for (const reference of references) {
            const id = reference.getAttribute('xml:id');

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

            referencesParsed[id] = {
                title,
                doi,
                publicationMonth,
                publicationYear,
                authors
            };
        }

        return referencesParsed;
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
                firstName = _firstName.innerHTML + ' ';
            }

            const _middleName = author.querySelector('forename[type="middle"]');
            if (_middleName) {
                middleName = _middleName.innerHTML + ' ';
            }

            const _lastName = author.querySelector('surname');
            if (_lastName) {
                lastName = _lastName.innerHTML;
            }

            authorsParsed.push(firstName + middleName + lastName);
        }

        return authorsParsed;
    };

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Reference extraction</ModalHeader>
            <ModalBody>
                <Alert color="info">References used within a table can be extracted. The extracted data will be added to the table</Alert>
                <Form>
                    <FormGroup>
                        <Label for="exampleSelectMulti">Select the column that contains the citation key</Label>
                        <Input type="select" value={selectedColumn} onChange={handleSelectColumn}>
                            {columns.map(column => (
                                <option>{column}</option>
                            ))}
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
    data: PropTypes.object.isRequired
};

export default ExtractReferencesModal;
