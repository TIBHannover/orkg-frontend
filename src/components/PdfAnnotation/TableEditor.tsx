import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import Handsontable from 'handsontable/base';
import { registerAllModules } from 'handsontable/registry';
import { RefObject } from 'react';
import { useDispatch } from 'react-redux';

import EditorComponent from '@/components/PdfAnnotation/EditorComponent';
import useTableEditor from '@/components/PdfAnnotation/hooks/useTableEditor';
import RendererComponent from '@/components/PdfAnnotation/RendererComponent';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import { saveTableState, updateTableData } from '@/slices/pdfAnnotationSlice';

// Extend Handsontable instance type to include custom property
interface ExtendedHandsontable extends Handsontable {
    isSurveyTable?: boolean;
}

// register Handsontable's modules
registerAllModules();

type TableEditorProps = {
    hotTableComponentRef: RefObject<HotTableRef>;
    id: string;
    tableData: (string | number | null)[][];
    toggleExtractReferencesModal: () => void;
    handleCsvDownload: () => void;
};

const TableEditor = ({ hotTableComponentRef, id, tableData, toggleExtractReferencesModal, handleCsvDownload }: TableEditorProps) => {
    const {
        transposeTable,
        removeEmptyRows,
        mergeCellValues,
        removeRow,
        removeColumn,
        insertRowAbove,
        insertRowBelow,
        insertColumnLeft,
        insertColumnRight,
        splitIntoColumns,
        undo,
        redo,
        canUndo,
        canRedo,
        updateLastSelection,
        isSurveyTable,
    } = useTableEditor(id, hotTableComponentRef);
    const dispatch = useDispatch();

    return (
        <div>
            <div className="d-flex align-items-center mb-2 tw:[&_button]:!px-3">
                <ButtonGroup size="sm">
                    <Button color="light" onClick={undo} disabled={!canUndo}>
                        <FontAwesomeIcon icon={faUndo} /> Undo
                    </Button>
                    <Button color="light" onClick={redo} disabled={!canRedo}>
                        <FontAwesomeIcon icon={faRedo} /> Redo
                    </Button>
                </ButtonGroup>
                <ButtonGroup size="sm" className=" ms-2">
                    <Button color="light" onClick={() => mergeCellValues(undefined, undefined)}>
                        Merge cells
                    </Button>
                    <Button color="light" onClick={() => splitIntoColumns(undefined, undefined)}>
                        Split columns
                    </Button>
                    <Button color="light" onClick={() => transposeTable()}>
                        Transpose
                    </Button>
                </ButtonGroup>
                <UncontrolledButtonDropdown size="sm" className="ms-2">
                    <DropdownToggle caret color="light" size="sm">
                        Insert
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => insertRowAbove(undefined, undefined)}>Insert row above</DropdownItem>
                        <DropdownItem onClick={() => insertRowBelow(undefined, undefined)}>Insert row below</DropdownItem>
                        <DropdownItem onClick={() => insertColumnLeft(undefined, undefined)}>Insert column left</DropdownItem>
                        <DropdownItem onClick={() => insertColumnRight(undefined, undefined)}>Insert column right</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <UncontrolledButtonDropdown size="sm" className="ms-2">
                    <DropdownToggle caret color="light" size="sm">
                        Remove
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => removeEmptyRows()}>Remove empty rows</DropdownItem>
                        <DropdownItem onClick={() => removeRow(undefined, undefined)}>Remove row</DropdownItem>
                        <DropdownItem onClick={() => removeColumn(undefined, undefined)}>Remove column</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <ButtonGroup size="sm" className=" ms-2">
                    {isSurveyTable && (
                        <Button size="sm" color="light" onClick={toggleExtractReferencesModal}>
                            Extract references
                        </Button>
                    )}
                    <Button size="sm" color="light" onClick={handleCsvDownload}>
                        Download CSV
                    </Button>
                </ButtonGroup>
            </div>
            <HotTable
                themeName="ht-theme-main"
                rowHeaders
                colHeaders={false}
                height="auto"
                width="100%"
                autoWrapRow
                autoWrapCol
                autoColumnSize={false}
                autoRowSize={false}
                licenseKey="non-commercial-and-evaluation" // for non-commercial use only
                ref={hotTableComponentRef}
                data={tableData}
                beforeChange={(changes) => {
                    dispatch(saveTableState({ id }));
                    dispatch(
                        updateTableData({
                            id,
                            dataChanges: changes,
                        }),
                    );
                    return false;
                }}
                afterSelectionEnd={(r, c, r2, c2) => {
                    updateLastSelection({ start: { row: r, col: c }, end: { row: r2, col: c2 } });
                }}
                contextMenu={{
                    items: {
                        undo: {
                            name: 'Undo',
                            callback: undo,
                            disabled: () => !canUndo,
                        },
                        redo: {
                            name: 'Redo',
                            callback: redo,
                            disabled: () => !canRedo,
                        },
                        '---------': { key: '---------', name: '---------' },
                        merge_cell_values: {
                            name: 'Merge cell values',
                            callback: mergeCellValues,
                        },
                        remove_empty_rows: {
                            name: 'Remove empty rows',
                            callback: removeEmptyRows,
                        },
                        split_into_columns: {
                            name: 'Split into several columns',
                            callback: splitIntoColumns,
                        },
                        '---------2': { key: '---------2', name: '---------' },
                        row_above: {
                            name: 'Insert row above',
                            callback: insertRowAbove,
                        },
                        row_below: {
                            name: 'Insert row below',
                            callback: insertRowBelow,
                        },
                        '---------3': { key: '---------3', name: '---------' },
                        col_left: {
                            name: 'Insert column left',
                            callback: insertColumnLeft,
                        },
                        col_right: {
                            name: 'Insert column right',
                            callback: insertColumnRight,
                        },
                        '---------4': { key: '---------4', name: '---------' },
                        remove_row: {
                            name: 'Remove row',
                            callback: removeRow,
                        },
                        remove_col: {
                            name: 'Remove column',
                            callback: removeColumn,
                        },
                    },
                }}
                stretchH="all"
                renderer={RendererComponent}
                editor={EditorComponent}
                afterInit={() => {
                    // Store isSurveyTable on the instance for access in editor
                    const instance = hotTableComponentRef.current?.hotInstance as ExtendedHandsontable | undefined;
                    if (instance) {
                        instance.isSurveyTable = isSurveyTable;
                    }
                }}
            />
        </div>
    );
};

export default TableEditor;
