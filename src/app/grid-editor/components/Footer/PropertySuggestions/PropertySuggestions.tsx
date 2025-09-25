import { AgGridReact } from 'ag-grid-react';
import { RefObject } from 'react';

import SuggestionsList from '@/app/grid-editor/components/Footer/PropertySuggestions/SuggestionsList/SuggestionsList';
import usePropertySuggestions from '@/app/grid-editor/hooks/usePropertySuggestions';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { Predicate } from '@/services/backend/types';

type PropertySuggestionsProps = {
    gridRef: RefObject<AgGridReact | null>;
};

const PropertySuggestions = ({ gridRef }: PropertySuggestionsProps) => {
    const { hasAvailableProperties, templates, existingProperties } = usePropertySuggestions({ gridRef });
    if (!hasAvailableProperties) {
        return null;
    }

    return (
        <div className="tw:mt-4">
            <div className="tw:text-lg tw:font-semibold tw:mb-3 tw:text-gray-800">Properties from templates</div>
            <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:lg:grid-cols-4 tw:gap-4">
                {templates?.map((template) => {
                    const allProperties = getListPropertiesFromTemplate(template);
                    const filteredProperties = allProperties.filter((p) => !existingProperties.includes(p.id)) as Predicate[];
                    return <SuggestionsList key={template.id} template={template} filteredProperties={filteredProperties} />;
                })}
            </div>
        </div>
    );
};

export default PropertySuggestions;
