import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InputGroup } from '@heroui/react';
import { groupBy } from 'lodash';
import { useState } from 'react';

import PredicatesRecommendations from '@/components/DataBrowser/components/Footer/PropertySuggestions/PredicatesRecommendations';
import SuggestionsList from '@/components/DataBrowser/components/Footer/PropertySuggestions/SuggestionsList/SuggestionsList';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';

const PropertySuggestions = () => {
    const { templates } = useTemplates();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const [search, setSearch] = useState('');
    const scopedNewProperties = entity && entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];
    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allProperties = templates?.map((t) => getListPropertiesFromTemplate(t))?.flat() ?? [];
    const properties = allProperties.filter((p) => !existingProperties.includes(p.id));
    const hasSearchResults = !search.trim() || properties.some((p) => p.label?.toLowerCase().includes(search.toLowerCase().trim()));

    if (properties.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mt-2 px-3 py-2 bg-surface text-accent rounded-t border border-border border-b-0 font-semibold text-[0.95rem]">
                <span>Properties from templates</span>
                <InputGroup className="max-w-xs">
                    <InputGroup.Prefix>
                        <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                        type="text"
                        placeholder="Search properties..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search properties"
                    />
                </InputGroup>
            </div>
            {!hasSearchResults ? (
                <div className="px-3 py-2 text-sm text-muted border border-border border-t-0 rounded-b">No properties match your search</div>
            ) : (
                <div className="border border-border border-t-0 rounded-b overflow-hidden bg-surface">
                    {templates?.map((t) => (
                        <SuggestionsList key={t.id} template={t} search={search} />
                    ))}
                </div>
            )}
            <PredicatesRecommendations />
        </div>
    );
};

export default PropertySuggestions;
