import { AgGridReact } from 'ag-grid-react';
import { RefObject, useEffect, useState } from 'react';

import { TData, useGridState } from '@/app/grid-editor/context/GridContext';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';

type UsePropertySuggestionsProps = {
    gridRef: RefObject<AgGridReact | null>;
};

const usePropertySuggestions = ({ gridRef }: UsePropertySuggestionsProps) => {
    const { templates } = useTemplates();
    const { newProperties } = useGridState();
    const [, forceUpdate] = useState(0);

    // Set up event listeners to force re-render when grid data changes
    useEffect(() => {
        if (gridRef?.current?.api) {
            const gridApi = gridRef.current.api;

            const onDataChanged = () => {
                forceUpdate((prev) => prev + 1);
            };

            // Listen for grid data changes
            gridApi.addEventListener('rowDataUpdated', onDataChanged);
            gridApi.addEventListener('cellValueChanged', onDataChanged);
            gridApi.addEventListener('modelUpdated', onDataChanged);

            return () => {
                gridApi.removeEventListener('rowDataUpdated', onDataChanged);
                gridApi.removeEventListener('cellValueChanged', onDataChanged);
                gridApi.removeEventListener('modelUpdated', onDataChanged);
            };
        }
    }, [gridRef]);

    // Calculate existing properties from AG Grid API (source of truth)
    const getExistingProperties = (): string[] => {
        if (!gridRef?.current?.api) {
            return newProperties.map((p) => p.id);
        }

        const gridApi = gridRef.current.api;
        const rowData: TData[] = [];

        // Get all row data from the grid API
        gridApi.forEachNode((node) => {
            if (node.data) {
                rowData.push(node.data);
            }
        });

        // Extract predicate IDs from the grid data and deduplicate
        const predicateIds = [...new Set(rowData.map((row: TData) => row.predicate?.id).filter(Boolean))];

        // Combine with new properties and deduplicate
        const allExistingProperties = [...new Set([...predicateIds, ...newProperties.map((p) => p.id)])];

        return allExistingProperties;
    };

    const existingProperties = getExistingProperties();

    // Check if any template has available properties
    const hasAvailableProperties = templates?.some((template) => {
        const allProperties = getListPropertiesFromTemplate(template);
        const filteredProperties = allProperties.filter((p) => !existingProperties.includes(p.id));
        return filteredProperties.length > 0;
    });

    return { hasAvailableProperties, templates, existingProperties };
};

export default usePropertySuggestions;
