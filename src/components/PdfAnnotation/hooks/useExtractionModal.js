import { createRef, useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import Confirm from 'components/Confirmation/Confirmation';
import { setTableData } from 'slices/pdfAnnotationSlice';
import { toast } from 'react-toastify';
import { usePapaParse } from 'react-papaparse';
import { useSelector, useDispatch } from 'react-redux';
import { zip, omit, isString, cloneDeep } from 'lodash';
import { PREDICATES, RESOURCES } from 'constants/graphSettings';
import { getStatementsBySubject } from 'services/backend/statements';
import { saveFullPaper } from 'services/backend/papers';
import { extractTable } from 'services/orkgNlp/index';

function useExtractionModal(props) {
    const [loading, setLoading] = useState(false);
    const [importError, setImportError] = useState(false);
    const [importedData, setImportedData] = useState(null);
    const editorRef = createRef();
    const dispatch = useDispatch();
    const { readString } = usePapaParse();
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const extractionSuccessful = tableData && tableData.length > 0;

    const pxToPoint = x => (x * 72) / 96;

    useEffect(() => {
        const performTableExtraction = async () => {
            // only extract the table if it hasn't been extracted yet
            if (tableData) {
                return;
            }

            setLoading(true);

            const { x, y, w, h } = props.region;

            const form = new FormData();
            form.append('file', await fetch(pdf).then(content => content.blob()));
            form.append(
                'payload',
                JSON.stringify({ page_number: props.pageNumber, region: [pxToPoint(y), pxToPoint(x), pxToPoint(y + h), pxToPoint(x + w)] }),
            );
            extractTable(form)
                .then(data => {
                    dispatch(
                        setTableData({
                            id: props.id,
                            tableData: zip(...Object.values(data.payload.table)).map(i => i.map(j => (j !== 'nan' ? j : ''))),
                        }),
                    );
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                });
        };
        performTableExtraction();
    }, [props.region, props.pageNumber, props.id, pdf, dispatch, tableData, readString]);

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
                rowDelimiter: '\r\n',
            });
        }
    };

    const confirmationModal = papers => (
        <div>
            A contribution will be added for the following papers
            <ListGroup className="mt-4">
                {papers.map((paper, index) => (
                    <ListGroupItem key={`paper${index}`}>{paper.title}</ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );

    const predefinedColumns = [
        'paper:title',
        'paper:authors',
        'paper:publication_month',
        'paper:publication_year',
        'paper:doi',
        'paper:research_field',
        'contribution:research_problem',
    ];

    const getFirstValue = (object, key, defaultValue = '') => (key in object && object[key].length && object[key][0] ? object[key][0] : defaultValue);

    const clearImportError = () => setImportError(null);

    const importTableData = async () => {
        clearImportError();
        const header = tableData[0];
        const createdContributions = [];
        const papers = [];

        if (!header.includes('paper:title')) {
            setImportError('Paper titles are missing. Make sure to add metadata for each paper (using the "Extract references" button)');
            return;
        }

        for (const [index, value] of header.entries()) {
            // ensure all predicates are mapped
            if (!value || (!predefinedColumns.includes(value) && !value.startsWith('orkg:'))) {
                setImportError(
                    <>
                        Make sure all header labels are using ORKG properties (the values in the first row should be black instead of grey). In case
                        you don't want to import a column, remove it before importing.
                        <br />
                        <ul className="mb-0">
                            <li>
                                The column <b>{value || `number ${1 + index}`}</b> is not mapped to an ORKG property.
                            </li>
                        </ul>
                    </>,
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
            for (const [index2, headerItem] of header.entries()) {
                if (!(headerItem in rowObject)) {
                    rowObject[headerItem] = [];
                }
                rowObject[headerItem].push(row[index2]);
            }

            const title = getFirstValue(rowObject, 'paper:title');
            const authors = getFirstValue(rowObject, 'paper:authors')
                .split(';')
                .map(name => ({ label: name }));
            const publicationMonth = getFirstValue(rowObject, 'paper:publication_month');
            const publicationYear = getFirstValue(rowObject, 'paper:publication_year');
            const doi = getFirstValue(rowObject, 'paper:doi');
            let researchField = getFirstValue(rowObject, 'paper:research_field', RESOURCES.RESEARCH_FIELD_MAIN);
            let researchProblem = getFirstValue(rowObject, 'contribution:research_problem');

            if (!title) {
                setImportError(
                    <>
                        Please notice that the lines without a title will not be imported, You can use the options <i>'Merge cell values'</i> and
                        <i> 'Remove empty rows'</i> of cells context menu to fix the data.
                        <br />
                        <ul className="mb-0">
                            <li>
                                The line <b>{`number ${1 + index}`}</b> will not be imported.
                            </li>
                        </ul>
                    </>,
                );
                return;
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
                        '@id': researchProblem,
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
                            '@id': value,
                        });
                    } else {
                        contributionStatements[propertyId].push({
                            text: value,
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
                publishedIn: null,
                contributions: [
                    {
                        name: 'Contribution',
                        values: contributionStatements,
                    },
                ],
            };

            papers.push(paper);
        }

        const confirm = await Confirm({
            title: 'Are you sure?',
            message: confirmationModal(papers),
        });

        if (confirm) {
            setLoading(true);

            for (const paper of papers) {
                try {
                    const _paper = await saveFullPaper({ paper }, true);
                    const paperStatements = await getStatementsBySubject({ id: _paper.id });

                    for (const statement of paperStatements) {
                        if (statement.predicate.id === PREDICATES.HAS_CONTRIBUTION) {
                            createdContributions.push({
                                paperId: _paper.id,
                                contributionId: statement.object.id,
                            });
                            break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                    toast.error(`Something went wrong while adding the paper: ${paper.paper.title}`);
                }
            }
            setLoading(false);
            setImportedData(createdContributions);
            toast.success('Successfully imported papers into the ORKG');
        }
    };

    const handleImportData = async () => {
        importTableData();
    };

    const transposeTable = () => {
        const transposed = zip(...cloneDeep(tableData));
        dispatch(setTableData({ id: props.id, tableData: transposed }));
    };

    return [
        loading,
        importedData,
        extractionSuccessful,
        editorRef,
        transposeTable,
        handleCsvDownload,
        handleImportData,
        importError,
        clearImportError,
    ];
}
export default useExtractionModal;
