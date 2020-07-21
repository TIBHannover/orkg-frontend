import { updateTableData } from 'actions/pdfAnnotation';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { isString } from 'lodash';

function useTableEditor(props) {
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

    const mergeCellValues = (key, selection) => {
        if (selection.length > 0) {
            const firstSelection = selection[0];
            const selectionStart = firstSelection.start;
            const selectionEnd = firstSelection.end;
            const colAmount = selectionEnd.col - selectionStart.col + 1;

            for (let i = 0; i < colAmount; i++) {
                const col = selectionStart.col + i;
                const tableUpdates = [];
                let newValue = tableData[selectionStart.row][col];
                const rowAmount = selectionEnd.row - selectionStart.row;

                for (let i = 1; i <= rowAmount; i++) {
                    tableUpdates.push([selectionStart.row + i, col, null, '']);
                    newValue += ' ' + tableData[selectionStart.row + i][col];
                }

                tableUpdates.push([selectionStart.row, col, null, newValue]);
                dispatch(updateTableData(props.id, tableUpdates));
            }
        }
    };

    const splitIntoSeveralColumns = (key, selection) => {
        const separator = prompt('By which character should the values be splitted?', ',');

        if (selection.length === 0 || !separator) {
            return;
        }

        const tableInstance = props.setRef.current.hotInstance;
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

        dispatch(updateTableData(props.id, tableUpdates));
        toast.success('Columns successfully splitted');
    };

    return { mergeCellValues, splitIntoSeveralColumns, removeEmptyRows };
}

export default useTableEditor;
