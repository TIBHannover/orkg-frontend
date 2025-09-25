import { AgGridReact } from 'ag-grid-react';
import { useEffect } from 'react';

import { TData, useGridState } from '@/app/grid-editor/context/GridContext';

const useScrollToNewProperty = (gridRef: React.RefObject<AgGridReact | null>, rowData: TData[]) => {
    const { newProperties } = useGridState();

    useEffect(() => {
        if (newProperties.length > 0 && gridRef.current && rowData.length > 0) {
            const lastProperty = newProperties[newProperties.length - 1];
            const rowId = `new-${lastProperty.id}`;

            // Small delay to ensure the grid has rendered the new row
            setTimeout(() => {
                const api = gridRef.current?.api;
                if (api) {
                    const rowNode = api.getRowNode(rowId);
                    if (rowNode) {
                        api.ensureIndexVisible(rowNode.rowIndex!, 'middle');
                    }
                }
            }, 100);
        }
    }, [newProperties, rowData, gridRef]);
};

export default useScrollToNewProperty;
