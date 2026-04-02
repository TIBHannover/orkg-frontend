import { useMemo } from 'react';

import { useGridState } from '@/app/grid-editor/context/GridContext';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';

const usePropertySuggestions = () => {
    const { templates } = useTemplates();
    const { newProperties } = useGridState();
    const { rowData } = useGridEditor();

    const existingProperties = useMemo(() => {
        const predicateIds = [...new Set(rowData.map((row) => row.predicate?.id).filter(Boolean))];
        return [...new Set([...predicateIds, ...newProperties.map((p) => p.id)])];
    }, [rowData, newProperties]);

    const hasAvailableProperties = useMemo(
        () =>
            templates?.some((template) => {
                const allProperties = getListPropertiesFromTemplate(template);
                return allProperties.some((p) => !existingProperties.includes(p.id));
            }),
        [templates, existingProperties],
    );

    return { hasAvailableProperties, templates, existingProperties };
};

export default usePropertySuggestions;
