import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import ExtractReferencesModal from './ExtractReferencesModal';
import Confirm from 'reactstrap-confirm';
import { setTableData } from '../../actions/pdfAnnotation';
import { toast } from 'react-toastify';
import { readString } from 'react-papaparse';
import { useSelector, useDispatch } from 'react-redux';
import { zip, omit, isString } from 'lodash';
import { saveFullPaper, getStatementsBySubject } from 'network';

const ExtractionModal = props => {
    const [loading, setLoading] = useState(false);
    const [extractReferencesModalOpen, setExtractReferencesModalOpen] = useState(false);
    const [importData, setImportData] = useState(null);
    const editorRef = React.createRef();
    const dispatch = useDispatch();
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const extractionSuccessful = tableData && tableData.length > 0;

    useEffect(() => {
        // only extract the table if it hasn't been extracted yet
        if (tableData) {
            return;
        }

        const csvTableToObject = csv => {
            const fullData = readString(csv.join('\n'), {})['data'];

            dispatch(setTableData(props.id, fullData));
        };

        setLoading(true);

        const { x, y, w, h } = props.region;

        const form = new FormData();
        form.append('pdf', pdf);
        form.append('region', pxToPoint(y) + ',' + pxToPoint(x) + ',' + pxToPoint(y + h) + ',' + pxToPoint(x + w));
        form.append('pageNumber', props.pageNumber);

        fetch('http://localhost:9000/extractTable', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.json();
                }
            })
            .then(function(data) {
                csvTableToObject(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    }, [props.region, props.pageNumber, props.id, pdf, dispatch, tableData]);

    const pxToPoint = x => (x * 72) / 96;

    const handleCsvDownload = () => {
        if (editorRef.current) {
            const exportPlugin = editorRef.current.hotInstance.getPlugin('exportFile');

            exportPlugin.downloadFile('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                fileExtension: 'csv',
                filename: 'extracted_table',
                mimeType: 'text/csv',
                rowDelimiter: '\r\n'
            });
        }
    };

    const toggleExtractReferencesModal = () => {
        setExtractReferencesModalOpen(!extractReferencesModalOpen);
    };

    const handleImportData = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'For each row in the table, a new paper is added to the ORKG directly. Do you want to start the import right now? ',
            cancelColor: 'light'
        });

        if (confirm) {
            importTableData();
            /*if (!editorRef.current) {
                return;
            }

            const exportPlugin = editorRef.current.hotInstance.getPlugin('exportFile');

            const csv = exportPlugin.exportAsBlob('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                rowDelimiter: '\r\n'
            });

            setLoading(true);

            const form = new FormData();
            form.append('csv', csv);

            fetch('http://localhost:9000/importCsv', {
                method: 'POST',
                body: form
            })
                .then(response => {
                    if (!response.ok) {
                        console.log('err');
                    } else {
                        return response.json();
                    }
                })
                .then(function(importData) {
                    setLoading(false);
                    setImportData(importData);

                    toast.success(`Successfully imported papers into the ORKG`);
                })
                .catch(err => {
                    console.log(err);
                });*/
        }
    };

    const importTableData = async () => {
        console.log('tableData', tableData);

        const researchProblemPredicate = process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM;
        const header = tableData[0];
        let createdContributions = [];

        if (!header.includes('paper:title')) {
            alert('Paper titles are missing. Make sure to add metadata for each paper (using the "Extract references" button)');
            return;
        }

        setLoading(true);

        for (const [index, row] of tableData.entries()) {
            if (index === 0) {
                continue;
            }

            // make use of an array for cells, in case multiple columns exist with the same label
            let rowObject = {};
            for (const [index, headerItem] of header.entries()) {
                if (!(headerItem in rowObject)) {
                    rowObject[headerItem] = [];
                }
                rowObject[headerItem].push(row[index]);
            }

            const title = getFirstValue(rowObject, 'paper:title');
            const authors = getFirstValue(rowObject, 'paper:authors')
                .split(';')
                .map(name => ({ label: name }));
            const publicationMonth = getFirstValue(rowObject, 'paper:publication_month');
            const publicationYear = getFirstValue(rowObject, 'paper:publication_year');
            const doi = getFirstValue(rowObject, 'paper:doi');
            let researchField = getFirstValue(rowObject, 'paper:research_field', process.env.REACT_APP_RESEARCH_FIELD_MAIN);
            let researchProblem = getFirstValue(rowObject, 'contribution:research_problem');

            if (!title) {
                continue;
            }

            rowObject = omit(rowObject, [
                'paper:title',
                'paper:authors',
                'paper:publication_month',
                'paper:publication_year',
                'paper:doi',
                'paper:research',
                'contribution:research_problem'
            ]);

            let contributionStatements = {};

            // replace :orkg prefix in research field
            if (isString(researchField) && researchField.startsWith('orkg:')) {
                researchField = researchField.replace(/^(orkg:)/, '');
            }

            // add research problem
            if (researchProblem && isString(researchProblem)) {
                let problemObject = {};
                if (researchProblem.startsWith('orkg:')) {
                    researchProblem = researchProblem.replace(/^(orkg:)/, '');
                    problemObject = {
                        '@id': researchProblem
                    };
                }

                contributionStatements[researchProblemPredicate] = [problemObject];
            }

            for (const property in rowObject) {
                for (let value of rowObject[property]) {
                    // don't add empty values and don't add if a property is not mapped
                    if (!value || !isString(property) || !property.startsWith('orkg:')) {
                        continue;
                    }

                    const isResource = isString(value) && value.startsWith('orkg:');
                    const propertyId = property.replace(/^(orkg:)/, '');
                    value = isResource ? value.replace(/^(orkg:)/, '') : value;

                    if (!(propertyId in contributionStatements)) {
                        contributionStatements[propertyId] = [];
                    }

                    if (isResource) {
                        contributionStatements[propertyId].push({
                            '@id': value
                        });
                    } else {
                        contributionStatements[propertyId].push({
                            text: value
                        });
                    }
                }
            }

            const paperObj = {
                paper: {
                    title,
                    doi,
                    authors,
                    publicationMonth,
                    publicationYear,
                    researchField,
                    url: '',
                    publishedIn: '',
                    contributions: [
                        {
                            name: 'Contribution',
                            values: contributionStatements
                        }
                    ]
                }
            };

            try {
                const paper = await saveFullPaper(paperObj, true);
                const paperStatements = await getStatementsBySubject({ id: paper.id });

                for (const statement of paperStatements) {
                    if (statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION) {
                        createdContributions.push({
                            paperId: paper.id,
                            contributionId: statement.object.id
                        });
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
                toast.error('Something went wrong while adding the paper: ' + title);
            }
        }
        const comparisonUrl = '/comparison?contributions=' + createdContributions.map(entry => entry.contributionId);
        alert(comparisonUrl);
        console.log(comparisonUrl);
        setLoading(false);

        toast.success(`Successfully imported papers into the ORKG`);
    };

    const getFirstValue = (object, key, defaultValue = '') => {
        return key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue;
    };

    const transposeTable = () => {
        const transposed = zip(...tableData);
        dispatch(setTableData(props.id, transposed));
    };

    return (
        <>
            <Modal isOpen={props.isOpen} toggle={props.toggle} style={{ maxWidth: '95%' }}>
                <ModalHeader toggle={props.toggle}>Table extraction</ModalHeader>

                {loading && (
                    <ModalBody>
                        <div className="text-center" style={{ fontSize: 40 }}>
                            <Icon icon={faSpinner} spin />
                        </div>
                    </ModalBody>
                )}

                {!loading && !importData && (
                    <>
                        <ModalBody>
                            {extractionSuccessful && (
                                <>
                                    <TableEditor setRef={editorRef} id={props.id} />
                                    <div className="mt-3">
                                        <Button size="sm" color="darkblue" onClick={toggleExtractReferencesModal}>
                                            Extract references
                                        </Button>{' '}
                                        <Button size="sm" color="darkblue" onClick={transposeTable}>
                                            Transpose
                                        </Button>{' '}
                                        <Button size="sm" color="darkblue" onClick={handleCsvDownload}>
                                            Download CSV
                                        </Button>
                                    </div>
                                </>
                            )}

                            {!extractionSuccessful && (
                                <Alert color="danger" fade={false}>
                                    No table found in the specified region. Please select a different region
                                </Alert>
                            )}
                        </ModalBody>

                        {extractionSuccessful && (
                            <ModalFooter>
                                <Button color="primary" onClick={handleImportData}>
                                    Import data
                                </Button>
                            </ModalFooter>
                        )}
                    </>
                )}

                {importData && (
                    <ModalBody>
                        Import results:{' '}
                        <ul>
                            {importData.map((result, i) => (
                                <li key={i}>{result}</li>
                            ))}
                        </ul>
                    </ModalBody>
                )}
            </Modal>

            <ExtractReferencesModal isOpen={extractReferencesModalOpen} toggle={toggleExtractReferencesModal} id={props.id} />
        </>
    );
};

ExtractionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    pageNumber: PropTypes.number.isRequired,
    pdf: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    region: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired
    })
};

export default ExtractionModal;
