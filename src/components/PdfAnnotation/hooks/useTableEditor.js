import { updateTableData, setTableData } from 'slices/pdfAnnotationSlice';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep } from 'lodash';

function useTableEditor(tableId, tableRef) {
    const dispatch = useDispatch();
    const tableData = useSelector(state => state.pdfAnnotation.tableData[tableId]);

    const removeEmptyRows = () => {
        const tableInstance = tableRef.current.hotInstance;
        const rowAmount = tableInstance.countRows();

        const toRemove = [];
        for (let i = 0; i < rowAmount; i++) {
            if (tableInstance.isEmptyRow(i)) {
                toRemove.push([i, 1]);
            }
        }
        const _tableData = cloneDeep(tableData);
        for (const toRemoveRow of toRemove) {
            _tableData.splice(toRemoveRow[0], toRemoveRow[1]);
        }
        dispatch(setTableData({ id: tableId, tableData: _tableData }));
    };

    const renderTable = () => {
        const tableInstance = tableRef.current.hotInstance;
        tableInstance.render();
    };

    const mergeCellValues = (key, selection) => {
        if (selection.length > 0) {
            const firstSelection = selection[0];
            const selectionStart = firstSelection.start;
            const selectionEnd = firstSelection.end;
            const colAmount = selectionEnd.col - selectionStart.col + 1;

            for (let i = 0; i < colAmount; i++) {
                const col = selectionStart.col + i;
                const tableUpdates = [];
                const _tableData = cloneDeep(tableData);
                let newValue = _tableData[selectionStart.row][col];
                const rowAmount = selectionEnd.row - selectionStart.row;

                for (let i = 1; i <= rowAmount; i++) {
                    tableUpdates.push([selectionStart.row + i, col, null, '']);
                    newValue += ` ${_tableData[selectionStart.row + i][col]}`;
                }

                tableUpdates.push([selectionStart.row, col, null, newValue]);

                // TODO: follow up with handontable issue https://forum.handsontable.com/t/gh-5727-contextmenu-callback-the-runhooks-method-cannot-be-called/4134/11
                setTimeout(() => {
                    dispatch(updateTableData({ id: tableId, dataChanges: tableUpdates }));
                }, 100);
            }
        }
    };

    // disabled function for now, 'tableInstance.alter' cannot be used correctly in combination with redux
    // the logic to add an extra column should be written as part of 'tableUpdates' which is dispatched to redux
    /* const splitIntoSeveralColumns = (key, selection) => {
        const separator = prompt('By which character should the values be splitted?', ',');

        if (selection.length === 0 || !separator) {
            return;
        }

        const tableInstance = tableRef.current.hotInstance;
        const firstSelection = selection[0];
        const selectionStart = firstSelection.start;
        const selectionEnd = firstSelection.end;
        const selectedCol = selectionStart.col;
        const tableUpdates = [];
        let newColumns = 0;

        // only support this when a single colum is selected
        if (selectionStart.col !== selectionEnd.col) {
            toast.error('Error, splitting by value is only possible when a single column is selected');
            return;
        }

        for (const [rowIndex, row] of tableData.entries()) {
            const value = row[selectedCol];

            if (!isString(value)) {
                continue;
            }
            const splittedValues = value.split(separator);

            if (!splittedValues) {
                continue;
            }

            for (const [index, atomicValue] of splittedValues.entries()) {
                const currentColumn = selectedCol + index;

                if (index > newColumns) {
                    tableInstance.alter('insert_col', currentColumn, 1);

                    // copy the header labels to the new columns
                    tableUpdates.push([0, currentColumn, null, tableData[0][selectedCol]]);
                    newColumns += 1;
                }

                // exclude headers
                if (rowIndex === 0) {
                    continue;
                }

                tableUpdates.push([rowIndex, currentColumn, null, atomicValue]);
            }
        }

        if (newColumns === 0) {
            toast.warning('Separator not found, no columns are splitted');
            return;
        }

        // TODO: follow up with handontable issue https://forum.handsontable.com/t/gh-5727-contextmenu-callback-the-runhooks-method-cannot-be-called/4134/11
        setTimeout(function() {
            dispatch(updateTableData(tableId, tableUpdates));
        }, 100);

        toast.success('Columns successfully splitted');
    }; */

    return { mergeCellValues, removeEmptyRows, renderTable };
}

export default useTableEditor;
