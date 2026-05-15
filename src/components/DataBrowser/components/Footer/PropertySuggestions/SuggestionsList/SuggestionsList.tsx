import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import { FC, useMemo } from 'react';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { Predicate, Template } from '@/services/backend/types';

type SuggestionsListProps = {
    template: Template;
    search: string;
};

const SuggestionsList: FC<SuggestionsListProps> = ({ template, search }) => {
    const dispatch = useDataBrowserDispatch();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const scopedNewProperties = entity && entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];

    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allProperties = getListPropertiesFromTemplate(template);
    const properties = allProperties.filter((p) => !existingProperties.includes(p.id));

    const filteredProperties = useMemo(() => {
        if (!search.trim()) return properties;
        const q = search.toLowerCase().trim();
        return properties.filter((p) => p.label?.toLowerCase().includes(q));
    }, [properties, search]);

    if (!entity || properties.length === 0) {
        return null;
    }

    if (search.trim() && filteredProperties.length === 0) {
        return null;
    }

    return (
        <>
            <div className="bg-surface text-accent px-4 py-2 border-b border-border font-medium">{template.label}</div>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3 border-l border-border">
                {filteredProperties.map((p) => (
                    <DescriptionTooltip key={p.id} id={p.id} _class={ENTITIES.PREDICATE}>
                        <button
                            type="button"
                            className="block w-full px-4 py-2 text-left bg-transparent border-0 border-r border-b border-border rounded-none text-inherit hover:bg-default/40"
                            onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p as Predicate, id: entity.id } })}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1 text-muted" /> {p.label}
                        </button>
                    </DescriptionTooltip>
                ))}
            </div>
        </>
    );
};

export default SuggestionsList;
