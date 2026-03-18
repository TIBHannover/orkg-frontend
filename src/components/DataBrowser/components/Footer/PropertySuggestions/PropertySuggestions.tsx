import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import { useState } from 'react';

import PredicatesRecommendations from '@/components/DataBrowser/components/Footer/PropertySuggestions/PredicatesRecommendations';
import SuggestionsList from '@/components/DataBrowser/components/Footer/PropertySuggestions/SuggestionsList/SuggestionsList';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ListGroup from '@/components/Ui/List/ListGroup';

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
            <div className="tw:flex tw:items-center tw:justify-between tw:flex-wrap tw:gap-3 tw:mt-2 tw:px-3 tw:py-2 tw:bg-light-lighter tw:text-primary tw:rounded-t tw:border tw:border-light-darker tw:border-b-0 tw:font-semibold tw:text-[0.95rem]">
                <span>Properties from templates</span>
                <InputGroup size="sm" className="tw:mb-0 tw:max-w-xs">
                    <span className="input-group-text tw:bg-gray-100 tw:text-gray-500 tw:border-gray-300">
                        <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <Input
                        type="text"
                        placeholder="Search properties..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="tw:border-gray-300 tw:text-sm tw:focus:ring-2 tw:focus:ring-primary tw:focus:border-primary"
                    />
                </InputGroup>
            </div>
            {!hasSearchResults ? (
                <div className="tw:px-3 tw:py-2 tw:text-sm tw:text-gray-500 tw:border tw:border-light-darker tw:border-t-0 tw:rounded-b">
                    No properties match your search
                </div>
            ) : (
                <ListGroup className="tw:rounded-none">
                    {templates?.map((t) => (
                        <SuggestionsList key={t.id} template={t} search={search} />
                    ))}
                </ListGroup>
            )}

            <PredicatesRecommendations />
        </div>
    );
};

export default PropertySuggestions;
