import { createSlice } from '@reduxjs/toolkit';
import env from '@beam-australia/react-env';
import { parse } from 'node-html-parser';
import { toast } from 'react-toastify';
import { guid } from 'utils';

/*
    This state is used mostly by handsontable package. and it require to disable immutableCheck of redux in development mode.
    Documentation: https://redux-toolkit.js.org/api/getDefaultMiddleware#included-default-middleware
*/
const initialState = {
    selectedTool: 'tableSelect', // possible values: 'tableSelect'
    pdf: null, // contains the raw uploaded file,
    pages: null, // contains the HTML content per page => array
    styles: null, // the styles needed to display the PDF,
    tableData: {}, // contains the table data when a table is being extracted
    parsedPdfData: null, // contains the parsed PDF data (from GROBID)
    tableRegions: {},
    cachedLabels: {}, // needed to convert IDs in the table to labels (e.g., P6000 > Machine),
    pdfParseIsFetching: false, // in case PDF is currently being parsed
    pdfParseFailed: false,
    pdfConvertIsFetching: false, // convert PDF is fetching
    pdfConvertFailed: false,
};

export const pdfAnnotationSlice = createSlice({
    name: 'pdfAnnotation',
    initialState,
    reducers: {
        selectTool: (state, { payload }) => {
            state.selectedTool = payload;
        },
        setTableData: (state, { payload }) => {
            state.tableData[payload.id] = payload.tableData;
        },
        updateTableData: (state, { payload: { id, dataChanges } }) => {
            // const newData = cloneDeep([...state.tableData[id].slice(0)]);
            for (const [row, column, , newValue] of dataChanges) {
                state.tableData[id][row][column] = newValue;
            }
            // state.tableData[id] = newData;
        },
        addTableRegion: (state, { payload }) => {
            state.tableRegions[guid()] = {
                region: payload.region,
                page: payload.page,
            };
        },
        deleteTableRegion: (state, { payload }) => {
            delete state.tableRegions[payload];
        },
        setLabelCache: (state, { payload }) => {
            state.cachedLabels[payload.id] = payload.label;
        },
        fetchPDFParseRequest: state => {
            state.pdfParseIsFetching = true;
            state.pdfParseFailed = false;
        },
        fetchPDFParseFailure: state => {
            state.pdfParseIsFetching = false;
            state.pdfParseFailed = true;
            state.parsedPdfData = document.createElement('div'); // create an empty parsing result
        },
        setParsedPdfData: (state, { payload }) => {
            state.pdfParseIsFetching = false;
            state.pdfParseFailed = false;
            state.parsedPdfData = payload;
        },
        setFile: (state, { payload }) => {
            state.pdfConvertIsFetching = false;
            state.pdfConvertFailed = false;
            state.pdf = payload.pdf;
            state.pages = payload.pages;
            state.styles = payload.styles;
        },
        fetchPDFConvertRequest: state => {
            state.pdfConvertIsFetching = true;
            state.pdfConvertFailed = false;
        },
        failedToConvertPdf: state => {
            state.pdfConvertIsFetching = false;
            state.pdfConvertFailed = true;
        },
        resetPdfAnnotation: state => {
            window.URL.revokeObjectURL(state.pdf);
            return initialState;
        },
    },
});

export const {
    selectTool,
    setTableData,
    updateTableData,
    addTableRegion,
    deleteTableRegion,
    setLabelCache,
    fetchPDFParseRequest,
    fetchPDFParseFailure,
    setParsedPdfData,
    setFile,
    fetchPDFConvertRequest,
    failedToConvertPdf,
    resetPdfAnnotation,
} = pdfAnnotationSlice.actions;

export default pdfAnnotationSlice.reducer;

/**
 * Converts PDF file into HTML
 *
 * @param {Object} pdf the uploaded pdf file object
 */
export const convertPdf = ({ files }) => dispatch => {
    dispatch(fetchPDFConvertRequest());

    if (files.length === 0) {
        return;
    }

    const pdf = files[0];

    const form = new FormData();
    form.append('pdf', pdf);

    fetch(`${env('ANNOTATION_SERVICE_URL')}convertPdf/`, {
        method: 'POST',
        body: form,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error while converting PDF to HTML');
            } else {
                return response.text();
            }
        })
        .then(data => {
            const parseData = parse(data, {
                style: true, // retrieve content in <style> (hurts performance but required)
            });
            const pages = parseData.querySelectorAll('.pf').map(page => page.outerHTML);
            const styles = parseData.querySelectorAll('style').map(style => style.outerHTML);

            dispatch(
                setFile({
                    pdf: window.URL.createObjectURL(pdf),
                    pages,
                    styles,
                }),
            );

            dispatch(parsePdf({ pdf }));
        })
        .catch(err => {
            console.log(err);
            toast.error('Unexpected error occurred, the PDF could not be converted. Please try it again');
            dispatch(failedToConvertPdf());
        });
};

/**
 * Parsing the PDF using Grobid, needed for getting individual references
 *
 * @param {Object} pdf the uploaded pdf file object
 */
export const parsePdf = ({ pdf }) => dispatch => {
    dispatch(fetchPDFParseRequest());

    const form = new FormData();
    form.append('input', pdf);

    fetch(`${env('GROBID_URL')}api/processFulltextDocument`, {
        method: 'POST',
        body: form,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching Grobid parse');
            } else {
                return response.text();
            }
        })
        .then(data => {
            dispatch(setParsedPdfData(data));
        })
        .catch(err => {
            console.log(err);
            toast.error('The references from the uploaded PDF could not be extracted');
            dispatch(fetchPDFParseFailure());
        });
};
