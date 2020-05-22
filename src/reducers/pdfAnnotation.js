import * as type from '../actions/types';
import dotProp from 'dot-prop-immutable';
import assign from 'lodash/assign';
import { Cookies } from 'react-cookie';

const initialState = {
    selectedTool: null, // possible values: 'tableSelect'
    pdf: null, // contains the raw uploaded file,
    pages: null, // contains the HTML content per page => array
    styles: null, // the styles needed to display the PDF,
    tableData: null, // contains the table data when a table is being extracted
    parsedPdfData: null // contains the parsed PDF data (from GROBID)
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.PDF_ANNOTATION_SELECT_TOOL: {
            const { payload } = action;

            return {
                ...state,
                selectedTool: payload.tool
            };
        }

        case type.PDF_ANNOTATION_SET_FILE: {
            const { payload } = action;

            return {
                ...state,
                pdf: payload.pdf,
                pages: payload.pages,
                styles: payload.styles
            };
        }

        case type.PDF_ANNOTATION_SET_TABLE_DATA: {
            const { payload } = action;

            return {
                ...state,
                tableData: payload.tableData
            };
        }

        case type.PDF_ANNOTATION_UPDATE_TABLE_DATA: {
            const { payload } = action;

            const newData = state.tableData.slice(0);
            console.log('payload.dataChanges', payload.dataChanges);
            for (const [row, column, oldValue, newValue] of payload.dataChanges) {
                newData[row][column] = newValue;
            }

            return Object.assign({}, state, {
                tableData: newData
            });
        }

        case type.PDF_ANNOTATION_SET_PARSED_PDF_DATA: {
            const { payload } = action;
            console.log('payload', payload.parsedPdfData);
            return {
                ...state,
                parsedPdfData: payload.parsedPdfData
            };
        }

        default: {
            return state;
        }
    }
};
