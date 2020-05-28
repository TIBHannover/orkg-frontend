import React from 'react';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import { updateTableData } from '../../actions/pdfAnnotation';
import { useSelector, useDispatch } from 'react-redux';

const TableEditor = props => {
    const dispatch = useDispatch();
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);

    const removeEmptyRows = () => {
        const tableInstance = props.setRef.current.hotInstance;
        const rowAmount = tableInstance.countRows();

        const toRemove = [];
        for (let i = 0; i < rowAmount; i++) {
            if (tableInstance.isEmptyRow(i)) {
                toRemove.push([i, 1]);
            }
        }
        tableInstance.alter('remove_row', toRemove);
    };

    const mergeCells = (key, selection) => {
        if (selection.length > 0) {
            const firstSelection = selection[0];
            const selectionStart = firstSelection.start;
            const selectionEnd = firstSelection.end;

            // only support merging in the same column for now
            if (selectionStart.col === selectionEnd.col) {
                const tableUpdates = [];
                let newValue = tableData[selectionStart.row][selectionStart.col];
                const rowAmount = selectionEnd.row - selectionStart.row;

                for (let i = 1; i <= rowAmount; i++) {
                    tableUpdates.push([selectionStart.row + i, selectionEnd.col, null, '']);
                    newValue += ' ' + tableData[selectionStart.row + i][selectionStart.col];
                }

                tableUpdates.push([selectionStart.row, selectionStart.col, null, newValue]);
                dispatch(updateTableData(props.id, tableUpdates));
            }
        }
    };

    return (
        <HotTable
            data={tableData}
            rowHeaders={true}
            width="100%"
            height="auto"
            /*colHeaders={col => {
                return `<div contenteditable="true">${columns[col]}</div>`;
            }}*/
            licenseKey="non-commercial-and-evaluation"
            contextMenu={{
                items: [
                    'row_above',
                    'row_below',
                    '---------',
                    'col_left',
                    'col_right',
                    '---------',
                    'remove_row',
                    'remove_col',
                    '---------',
                    'undo',
                    'redo',
                    {
                        name: 'Merge cells',
                        callback: mergeCells
                    },
                    {
                        name: 'Remove empty rows',
                        callback: removeEmptyRows
                    }
                ]
            }}
            stretchH={'all'}
            ref={props.setRef}
            beforeChange={changes => dispatch(updateTableData(props.id, changes))}
        />
    );
};

TableEditor.propTypes = {
    setRef: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
};

export default TableEditor;
