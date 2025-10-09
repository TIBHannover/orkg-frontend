import { GridApi } from 'ag-grid-community';

/**
 * Check if the user is currently in edit mode or interacting with UI elements
 * where keyboard shortcuts should not interfere
 */
export const isInEditMode = (): boolean => {
    const focusedElement = document.activeElement;
    return !!(
        focusedElement &&
        (focusedElement.tagName === 'INPUT' ||
            focusedElement.tagName === 'TEXTAREA' ||
            (focusedElement as HTMLElement).contentEditable === 'true' ||
            // Check for react-select components (autocomplete dropdown)
            focusedElement.closest('.react-select__control') ||
            focusedElement.closest('.react-select__menu') ||
            focusedElement.closest('.react-select__option') ||
            focusedElement.closest('.react-select__input') ||
            // Check for CustomCellEditor component
            focusedElement.closest('.custom-cell-editor') ||
            // Check for any modal or dropdown that might be open
            focusedElement.closest('[role="listbox"]') ||
            focusedElement.closest('[role="option"]') ||
            focusedElement.closest('[role="combobox"]') ||
            focusedElement.closest('.modal'))
    );
};

/**
 * Get the focused cell information from AG Grid
 * @returns Object with colId and rowIndex, or null if no valid cell is focused
 */
export const getFocusedCellInfo = (api: GridApi | undefined) => {
    if (!api) return null;

    const focusedCell = api.getFocusedCell();
    if (!focusedCell || !focusedCell.column) return null;

    const colId = focusedCell.column.getColId();
    const { rowIndex } = focusedCell;

    // Skip if it's the predicate column
    if (colId === 'predicate') return null;

    return { colId, rowIndex };
};
