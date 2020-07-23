import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { setTableData } from 'actions/pdfAnnotation';
import { toast } from 'react-toastify';
import { readString } from 'react-papaparse';
import { useSelector, useDispatch } from 'react-redux';
import { zip, omit, isString } from 'lodash';
import { PREDICATES, MISC } from 'constants/graphSettings';
import { saveFullPaper, getStatementsBySubject } from 'network';

function useExtractionModal(props) {
    const [loading, setLoading] = useState(false);
    const [importedData, setImportedData] = useState(null);
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
            let fullData = [];

            if (csv.length) {
                fullData = readString(csv, {})['data']; //.join('\n')
            }

            dispatch(setTableData(props.id, fullData));
        };

        setLoading(true);

        const { x, y, w, h } = props.region;

        const form = new FormData();
        form.append('pdf', pdf);
        form.append('region', pxToPoint(y) + ',' + pxToPoint(x) + ',' + pxToPoint(y + h) + ',' + pxToPoint(x + w));
        form.append('page_number', props.pageNumber);

        fetch(process.env.REACT_APP_ANNOTATION_SERVICE_URL + 'extractTable/', {
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

    /**
     * Download the table as CSV
     */
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

    const confirmationModal = papers => {
        return (
            <div>
                A contribution will be added for the following papers
                <ListGroup className="mt-4">
                    {papers.map(paper => {
                        return <ListGroupItem key={paper.id}>{paper.title}</ListGroupItem>;
                    })}
                </ListGroup>
            </div>
        );
    };

    const handleImportData = async () => {
        importTableData();
    };

    const predefinedColumns = [
        'paper:title',
        'paper:authors',
        'paper:publication_month',
        'paper:publication_year',
        'paper:doi',
        'paper:research',
        'contribution:research_problem'
    ];

    const importTableData = async () => {
        const header = tableData[0];
        const createdContributions = [];
        const papers = [];

        if (!header.includes('paper:title')) {
            alert('Paper titles are missing. Make sure to add metadata for each paper (using the "Extract references" button)');
            return;
        }

        for (const value of header) {
            // ensure all predicates are mapped
            if (!predefinedColumns.includes(value) && !value.startsWith('orkg:')) {
                alert(
                    "Make sure all header labels are using ORKG properties (the values in the first row should be black instead of grey). In case you don't want to import a column, remove it before importing"
                );
                return;
            }
        }

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
            let researchField = getFirstValue(rowObject, 'paper:research_field', MISC.RESEARCH_FIELD_MAIN);
            let researchProblem = getFirstValue(rowObject, 'contribution:research_problem');

            if (!title) {
                continue;
            }

            rowObject = omit(rowObject, predefinedColumns);

            const contributionStatements = { [PREDICATES.HAS_RESEARCH_PROBLEM]: [] };

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

                contributionStatements[PREDICATES.HAS_RESEARCH_PROBLEM] = [problemObject];
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

            const paper = {
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
            };

            papers.push(paper);
        }

        const confirm = await Confirm({
            title: 'Are you sure?',
            message: confirmationModal(papers),
            cancelColor: 'light'
        });

        if (confirm) {
            setLoading(true);

            for (const paper of papers) {
                try {
                    const _paper = await saveFullPaper({ paper: paper }, true);
                    const paperStatements = await getStatementsBySubject({ id: _paper.id });

                    for (const statement of paperStatements) {
                        if (statement.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                            createdContributions.push({
                                paperId: _paper.id,
                                contributionId: statement.object.id
                            });
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                    toast.error('Something went wrong while adding the paper: ' + paper.paper.title);
                }
            }
            setLoading(false);
            setImportedData(createdContributions);
            toast.success(`Successfully imported papers into the ORKG`);
        }
    };

    const getFirstValue = (object, key, defaultValue = '') => {
        return key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue;
    };

    const transposeTable = () => {
        const transposed = zip(...tableData);
        dispatch(setTableData(props.id, transposed));
    };

    return [loading, importedData, extractionSuccessful, editorRef, transposeTable, handleCsvDownload, handleImportData];
}
export default useExtractionModal;
