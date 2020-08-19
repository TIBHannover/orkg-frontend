import * as type from './types.js';
import { guid } from '../utils';
import { parse } from 'node-html-parser';
import { toast } from 'react-toastify';

export const selectTool = tool => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SELECT_TOOL,
        payload: {
            tool
        }
    });
};

export const setTableData = (id, tableData) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_TABLE_DATA,
        payload: {
            tableData,
            id
        }
    });
};

export const updateTableData = (id, dataChanges) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_UPDATE_TABLE_DATA,
        payload: {
            dataChanges,
            id
        }
    });
};

export const setParsedPdfData = parsedPdfData => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_FETCH_PDF_PARSE_SUCCESS,
        payload: {
            parsedPdfData
        }
    });
};

export const addTableRegion = ({ region, page }) => dispatch => {
    const id = guid();

    dispatch({
        type: type.PDF_ANNOTATION_SET_TABLE_REGION,
        payload: {
            region,
            page,
            id
        }
    });
};

export const deleteTableRegion = id => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_DELETE_TABLE_REGION,
        payload: {
            id
        }
    });
};

export const failedToConvertPdf = () => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_FETCH_PDF_CONVERT_FAILURE
    });
};

export const setLabelCache = ({ id, label }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_SET_LABEL_CACHE,
        payload: {
            id,
            label
        }
    });
};

export const setFile = ({ pages, pdf, styles }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_FETCH_PDF_CONVERT_SUCCESS,
        payload: {
            pages,
            pdf,
            styles
        }
    });
};

export const resetPdfAnnotation = () => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_RESET_DATA
    });
};

/**
 * Converts PDF file into HTML
 *
 * @param {Object} pdf the uploaded pdf file object
 */
export const convertPdf = ({ files }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_FETCH_PDF_CONVERT_REQUEST
    });

    if (files.length === 0) {
        return;
    }

    const pdf = files[0];

    const form = new FormData();
    form.append('pdf', pdf);

    fetch(process.env.REACT_APP_ANNOTATION_SERVICE_URL + 'convertPdf/', {
        method: 'POST',
        body: form
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error while converting PDF to HTML`);
            } else {
                return response.text();
            }
        })
        .then(function(data) {
            const parseData = parse(data, {
                style: true // retrieve content in <style> (hurts performance but required)
            });
            const pages = parseData.querySelectorAll('.pf');
            const styles = parseData.querySelectorAll('style');

            dispatch(
                setFile({
                    pdf,
                    pages,
                    styles
                })
            );

            dispatch(parsePdf({ pdf }));
        })
        .catch(err => {
            console.log(err);
            toast.error(`Unexpected error occurred, the PDF could not be converted. Please try it again`);
            dispatch(failedToConvertPdf());
        });
};

/**
 * Parsing the PDF using Grobid, needed for getting individual references
 *
 * @param {Object} pdf the uploaded pdf file object
 */
export const parsePdf = ({ pdf }) => dispatch => {
    dispatch({
        type: type.PDF_ANNOTATION_FETCH_PDF_PARSE_REQUEST
    });

    const form = new FormData();
    form.append('input', pdf);

    fetch(process.env.REACT_APP_GROBID_URL + 'api/processFulltextDocument', {
        method: 'POST',
        body: form
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching Grobid parse`);
            } else {
                return response.text();
            }
        })
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml')) // parse as xml
        .then(function(data) {
            dispatch(setParsedPdfData(data));
        })
        .catch(err => {
            console.log(err);
            toast.error(`The references from the uploaded PDF could not be extracted`);
            dispatch({
                type: type.PDF_ANNOTATION_FETCH_PDF_PARSE_FAILURE
            });
        });
};
