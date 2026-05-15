import { faChevronDown, faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { Button, ButtonGroup, Dropdown } from '@heroui/react';
import Handsontable from 'handsontable/base';
import { registerAllModules } from 'handsontable/registry';
import { mainTheme, registerTheme } from 'handsontable/themes';
import DOMPurify from 'isomorphic-dompurify';
import { RefObject } from 'react';
import { useDispatch } from 'react-redux';

import EditorComponent from '@/components/PdfAnnotation/EditorComponent';
import useTableEditor from '@/components/PdfAnnotation/hooks/useTableEditor';
import RendererComponent from '@/components/PdfAnnotation/RendererComponent';
import { saveTableState, updateTableData } from '@/slices/pdfAnnotationSlice';

// Extend Handsontable instance type to include custom property
interface ExtendedHandsontable extends Handsontable {
    isSurveyTable?: boolean;
}

// register Handsontable's modules
registerAllModules();

const theme = registerTheme(mainTheme);

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
            <div className="flex items-center mb-2 [&_button]:px-3">
                <ButtonGroup size="sm">
                    <Button variant="ghost" onPress={undo} isDisabled={!canUndo}>
                        <FontAwesomeIcon icon={faUndo} /> Undo
                    </Button>
                    <Button variant="ghost" onPress={redo} isDisabled={!canRedo}>
                        <FontAwesomeIcon icon={faRedo} /> Redo
                    </Button>
                </ButtonGroup>
                <ButtonGroup size="sm" className=" ml-2">
                    <Button variant="ghost" onPress={() => mergeCellValues(undefined, undefined)}>
                        Merge cells
                    </Button>
                    <Button variant="ghost" onPress={() => splitIntoColumns(undefined, undefined)}>
                        Split columns
                    </Button>
                    <Button variant="ghost" onPress={() => transposeTable()}>
                        Transpose
                    </Button>
                </ButtonGroup>
                <Dropdown className="ml-2">
                    <Button variant="ghost" size="sm">
                        Insert <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
                    </Button>
                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item key="row-above" onAction={() => insertRowAbove(undefined, undefined)} textValue="Insert row above">
                                Insert row above
                            </Dropdown.Item>
                            <Dropdown.Item key="row-below" onAction={() => insertRowBelow(undefined, undefined)} textValue="Insert row below">
                                Insert row below
                            </Dropdown.Item>
                            <Dropdown.Item key="col-left" onAction={() => insertColumnLeft(undefined, undefined)} textValue="Insert column left">
                                Insert column left
                            </Dropdown.Item>
                            <Dropdown.Item key="col-right" onAction={() => insertColumnRight(undefined, undefined)} textValue="Insert column right">
                                Insert column right
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
                <Dropdown className="ml-2">
                    <Button variant="ghost" size="sm">
                        Remove <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
                    </Button>
                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item key="empty-rows" onAction={() => removeEmptyRows()} textValue="Remove empty rows">
                                Remove empty rows
                            </Dropdown.Item>
                            <Dropdown.Item key="remove-row" onAction={() => removeRow(undefined, undefined)} textValue="Remove row">
                                Remove row
                            </Dropdown.Item>
                            <Dropdown.Item key="remove-col" onAction={() => removeColumn(undefined, undefined)} textValue="Remove column">
                                Remove column
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
                <ButtonGroup size="sm" className=" ml-2">
                    {isSurveyTable && (
                        <Button size="sm" variant="ghost" onPress={toggleExtractReferencesModal}>
                            Extract references
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onPress={handleCsvDownload}>
                        Download CSV
                    </Button>
                </ButtonGroup>
            </div>
            <HotTable
                sanitizer={(content, source) => {
                    if (source === 'CopyPaste.paste') {
                        return DOMPurify.sanitize(content, {
                            ADD_TAGS: ['meta'],
                            ADD_ATTR: ['content'],
                            FORCE_BODY: true,
                        });
                    }

                    return DOMPurify.sanitize(content);
                }}
                theme={theme}
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
                        // eslint-disable-next-line react-hooks/immutability
                        instance.isSurveyTable = isSurveyTable;

                        // Opt the body-level Handsontable portal (host of context menu, dropdown menus,
                        // filters, comments) out of React Aria's ariaHideOutside so it stays interactive
                        // when this HotTable is rendered inside a HeroUI Modal.
                        const portal = instance.rootPortalElement;
                        if (portal) {
                            portal.setAttribute('data-react-aria-top-layer', 'true');
                            portal.removeAttribute('aria-hidden');
                            portal.inert = false;
                        }
                    }
                }}
            />
        </div>
    );
};

export default TableEditor;
