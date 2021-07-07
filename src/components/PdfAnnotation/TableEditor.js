import PropTypes from 'prop-types';
import 'handsontable/dist/handsontable.full.css';
import { HotTable } from '@handsontable/react';
import { updateTableData } from 'actions/pdfAnnotation';
import { useSelector, useDispatch } from 'react-redux';
import EditorComponent from './EditorComponent';
import Handsontable from 'handsontable';
import { isString } from 'lodash';
import useTableEditor from './hooks/useTableEditor';

const TableEditor = props => {
    const dispatch = useDispatch();
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const cachedLabels = useSelector(state => state.pdfAnnotation.cachedLabels);
    const { removeEmptyRows, mergeCellValues, splitIntoSeveralColumns, renderTable } = useTableEditor(props.id, props.setRef);

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
                        name: 'Merge cell values',
                        callback: mergeCellValues
                    },
                    {
                        name: 'Split into several columns',
                        callback: splitIntoSeveralColumns
                    },
                    {
                        name: 'Remove empty rows',
                        callback: removeEmptyRows
                    }
                ]
            }}
            stretchH="all"
            ref={props.setRef}
            beforeChange={changes => dispatch(updateTableData(props.id, changes))}
            afterRemoveCol={() => renderTable()}
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
    setRef: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired
};

export default TableEditor;
