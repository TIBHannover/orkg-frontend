import SuggestionsList from '@/app/grid-editor/components/Footer/PropertySuggestions/SuggestionsList/SuggestionsList';
import usePropertySuggestions from '@/app/grid-editor/hooks/usePropertySuggestions';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { Predicate } from '@/services/backend/types';

const PropertySuggestions = () => {
    const { hasAvailableProperties, templates, existingProperties } = usePropertySuggestions();
    if (!hasAvailableProperties) {
        return null;
    }

    return (
        <div className="mt-4">
            <div className="text-lg font-semibold mb-3 text-foreground">Properties from templates</div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
