'use client';

import {
    AllCommunityModule,
    CellEditingStartedEvent,
    ColDef,
    ColumnMovedEvent,
    ModuleRegistry,
    SuppressKeyboardEventParams,
    themeQuartz,
    ValueGetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import CustomCellEditor, { ROW_HEIGHT } from '@/app/grid-editor/components/CustomCellEditor/CustomCellEditor';
import Footer from '@/app/grid-editor/components/Footer/Footer';
import HeaderCell from '@/app/grid-editor/components/HeaderCell/HeaderCell';
import NoRowsOverlay from '@/app/grid-editor/components/MainGrid/NoRowsOverlay';
import PropertyCell from '@/app/grid-editor/components/PropertyCell/PropertyCell';
import PropertyCellEditor from '@/app/grid-editor/components/PropertyCellEditor/PropertyCellEditor';
import TableLoadingIndicator from '@/app/grid-editor/components/TableLoadingIndicator';
import ValueCell from '@/app/grid-editor/components/ValueCell/ValueCell';
import { TData } from '@/app/grid-editor/context/GridContext';
import useBlankNodeHandler from '@/app/grid-editor/hooks/useBlankNodeHandler';
import useConstraints from '@/app/grid-editor/hooks/useConstraints';
import useCopyPaste from '@/app/grid-editor/hooks/useCopyPaste';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import useScrollToNewProperty from '@/app/grid-editor/hooks/useScrollToNewProperty';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const MainGrid = () => {
    const gridRef = useRef<AgGridReact<TData>>(null);
    const { entityIds, entities, setEntityIds } = useEntities();
    const { isLoadingStatements, rowData } = useGridEditor();
    const { canAddValue: canAddValueFn, getRanges } = useConstraints();
    const { handleBlankNode } = useBlankNodeHandler();
    // Copy-paste functionality
    useCopyPaste({
        gridRef,
    });

    // Handler to check if user can edit when entering edit mode
    const onCellEditingStarted = async (params: CellEditingStartedEvent<TData>) => {
        const { data, colDef, value } = params;
        // Check if cell is empty (no existing statement)
        const isEmpty = !value || !value.object || !value.object.id;
        if (isEmpty && colDef.field && data) {
            // Cell is empty, checking if user can add new value...
            const canAddValue = canAddValueFn(data.predicate.id, colDef.field);
            if (!canAddValue) {
                params.api.stopEditing();
                toast.error('This property reached the maximum number of values set by template');
                return;
            }
            // Check if we should add a blank node
            const ranges = getRanges(data.predicate.id, colDef.field);
            const wasBlankNodeCreated = await handleBlankNode(ranges, colDef.field, data.predicate.id);
            if (wasBlankNodeCreated) {
                params.api.stopEditing();
            }
        }
    };

    // Handler for when columns are moved/reordered
    const onColumnMoved = (params: ColumnMovedEvent<TData>) => {
        // Only update the order when the column move operation is finished
        if (!params.finished) return;
        const columnApi = params.api;
        // Use getAllDisplayedColumns to get columns in their current display order
        const allColumns = columnApi.getAllDisplayedColumns();
        if (allColumns) {
            // Extract entity IDs from column fields, excluding the 'predicate' column
            const newEntityIds = allColumns.map((col) => col.getColDef().field).filter((field) => field && field !== 'predicate') as string[];
            // Only update if the order has actually changed
            if (JSON.stringify(entityIds) !== JSON.stringify(newEntityIds)) {
                setEntityIds(newEntityIds);
            }
        }
    };

    // Suppress keyboard events when they come from react-select (autocomplete)
    const suppressKeyboardEvent = (params: SuppressKeyboardEventParams<TData>) => {
        const { event } = params;
        const target = event.target as HTMLElement;
        const isFromModal = target.closest('.modal');

        if (isFromModal) return true;

        // Only suppress if we're editing and the event comes from react-select
        if (!params.editing) return false;

        if (!event) return false;

        const isFromReactSelect =
            target.closest('.react-select__control') ||
            target.closest('.react-select__menu') ||
            target.closest('.react-select__input') ||
            target.closest('.react-select__option');

        const isInput = target.closest('input');
        const isTextarea = target.closest('textarea');

        // Suppress Enter and navigation keys when they come from react-select, inputs, textareas, or modals
        if (
            (isFromReactSelect || isInput || isTextarea || isFromModal) &&
            (event.key === 'Enter' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')
        ) {
            return true; // Suppress the event
        }
        return false; // Don't suppress other events
    };

    const prepareColDefs = useCallback(
        (ids: string[]) => {
            return [
                {
                    field: 'predicate' as const,
                    headerName: 'Property',
                    valueGetter: (params: ValueGetterParams<TData>) => params.data?.predicate,
                    pinned: 'left',
                    lockPosition: 'left',
                    cellRenderer: PropertyCell,
                    suppressMovable: true,
                    cellStyle: { backgroundColor: 'var(--tw-color-light)', lineHeight: '1.5' },
                    headerStyle: { backgroundColor: 'var(--tw-color-light)', fontWeight: 700 },
                    editable: true,
                    cellEditor: PropertyCellEditor,
                    suppressKeyboardEvent,
                    // Render the editor in a popup to avoid clipping by cell overflow styles
                    cellEditorPopup: true,
                    cellEditorPopupPosition: 'over',
                },
                ...ids.map((id) => ({
                    field: id as string,
                    headerName: `${entities?.find((entity) => entity.id === id)?.label} (${id})`,
                    headerComponentParams: {
                        entity: entities?.find((entity) => entity.id === id),
                    },
                    valueGetter: (params: ValueGetterParams<TData>) => params.data?.statements[id],
                    cellRendererParams: {
                        gridRef,
                    },
                    headerStyle: { backgroundColor: 'var(--tw-color-dark)', color: 'white' },
                    cellRenderer: ValueCell,
                    cellEditor: CustomCellEditor,
                    suppressKeyboardEvent,
                    // Render the editor in a popup to avoid clipping by cell overflow styles
                    cellEditorPopup: true,
                    cellEditorPopupPosition: 'over',
                    editable: true,
                    headerComponent: HeaderCell,
                })),
            ] as ColDef<TData>[];
        },
        [gridRef, entities],
    );

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState<ColDef<TData>[]>(prepareColDefs(entityIds ?? []));

    useEffect(() => {
        setColDefs(prepareColDefs(entityIds ?? []));
    }, [entityIds, prepareColDefs]);

    // Use hook to scroll to newly added property
    useScrollToNewProperty(gridRef, rowData);

    return (
        <>
            {isLoadingStatements && <TableLoadingIndicator contributionAmount={entityIds?.length ?? 0} />}
            {!isLoadingStatements && entityIds && entityIds.length > 0 && (
                // Data Grid with sticky header
                <div className="tw:px-4">
                    <div style={{ height: '600px' }} className="box rounded">
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={colDefs}
                            theme={themeQuartz}
                            rowHeight={ROW_HEIGHT}
                            getRowId={(params) => params.data.id}
                            onCellEditingStarted={onCellEditingStarted}
                            onColumnMoved={onColumnMoved}
                            suppressDragLeaveHidesColumns
                            noRowsOverlayComponent={NoRowsOverlay}
                            defaultColDef={{
                                editable: true,
                                filter: false,
                                flex: 1,
                                minWidth: 300,
                                sortable: false,
                                wrapText: true,
                                autoHeight: false,
                                wrapHeaderText: true,
                                autoHeaderHeight: true,
                                lockPinned: true,
                                cellStyle: { lineHeight: '1.5' },
                            }}
                        />
                    </div>
                    <div className="tw:mt-2">
                        <Footer gridRef={gridRef} />
                    </div>
                </div>
            )}
            {!isLoadingStatements && (!entityIds || entityIds.length === 0) && (
                <Container className="tw:mt-2">
                    <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                        This tool allows you to edit multiple entities at the same time in a convenient table format. Simply select entities and their
                        properties will appear as columns, making it easy to compare and modify data across entities. All changes are{' '}
                        <strong>saved automatically</strong> as you edit. This view is just a working tool - it doesn't create any new content types
                        (like comparisons or reviews), it's simply a two-dimensional table view of your existing entities for efficient batch editing.
                    </Container>

                    <Alert color="info">
                        Start adding entities by clicking the button <em>Select entities</em> on the top right
                    </Alert>
                </Container>
            )}
        </>
    );
};

export default MainGrid;
