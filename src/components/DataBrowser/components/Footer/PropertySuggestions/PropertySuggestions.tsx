import { groupBy } from 'lodash';

import PredicatesRecommendations from '@/components/DataBrowser/components/Footer/PropertySuggestions/PredicatesRecommendations';
import SuggestionsList from '@/components/DataBrowser/components/Footer/PropertySuggestions/SuggestionsList/SuggestionsList';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import ListGroup from '@/components/Ui/List/ListGroup';

const PropertySuggestions = () => {
    const { templates } = useTemplates();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const scopedNewProperties = entity && entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];
    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allProperties = templates?.map((t) => getListPropertiesFromTemplate(t))?.flat() ?? [];
    const properties = allProperties.filter((p) => !existingProperties.includes(p.id));

    if (properties.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="h6 mt-2">Properties from templates</div>
            <ListGroup>
                {templates?.map((t) => (
                    <SuggestionsList key={t.id} template={t} />
                ))}
            </ListGroup>

            <PredicatesRecommendations />
        </div>
    );
};

export default PropertySuggestions;
