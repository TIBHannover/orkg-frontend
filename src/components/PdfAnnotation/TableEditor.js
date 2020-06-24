import React from 'react';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import { updateTableData } from '../../actions/pdfAnnotation';
import { useSelector, useDispatch } from 'react-redux';
import EditorComponent from './EditorComponent';
import Handsontable from 'handsontable';
import { isString } from 'lodash';

const TableEditor = props => {
    const dispatch = useDispatch();
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const cachedLabels = useSelector(state => state.pdfAnnotation.cachedLabels);

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

    const renderer = function(instance, td, row, col, prop, value, cellProperties) {
        // I tried it with a nice RendererComponent, but after a lot of trying this just isn't supported well in Hansontable
        // (e.g., having auto resized column etc. will not work. Something that is crucial for tables with an unknown column amount)
        // So in the end, just using vanilla JS seems to be the only possible solution

        let label = '';

        if (value && isString(value) && (value.startsWith('orkg:') || value.startsWith('paper:') || value.startsWith('contribution:'))) {
            value = value.replace(/^(orkg:)/, '');
            label = cachedLabels[value] ?? value;
            if (row !== 0) {
                td.classList.add('text-primary');
            } else {
                td.classList.add('font-weight-bold');
            }
        } else {
            label = value;
            if (row === 0 && td.classList) {
                td.classList.add('font-italic', 'text-muted');
            }
        }

        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, label, cellProperties]);

        return td;
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
            renderer={renderer}
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
        >
            <EditorComponent hot-editor id={props.id} />
            {/*
                Unfortunately, HotColumn isn't very well supported and it breaks quite a lot of default functionality (e.g., adding columns via the content menu)
                Requires: 
                const columns = tableData.length > 0 ? tableData[0] : [];
                const instance = props.setRef?.current?.hotInstance;
                
                Then the mapping
                columns.map(column => (
                <HotColumn>
                    <RendererComponent hot-renderer instance={instance} />
                </HotColumn>
            ))*/}
        </HotTable>
    );
};

TableEditor.propTypes = {
    setRef: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
};

export default TableEditor;
