import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import { FC, useMemo } from 'react';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
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
            <ListGroupItem className="tw:rounded-none! tw:-mt-px! tw:bg-light-lighter! tw:text-primary!">{template.label}</ListGroupItem>

            <div className="tw:grid tw:grid-cols-1 tw:gap-0 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:border-l tw:border-black/12.5">
                {filteredProperties.map((p) => (
                    <DescriptionTooltip key={p.id} id={p.id} _class={ENTITIES.PREDICATE}>
                        <button
                            type="button"
                            className="tw:block tw:w-full tw:px-4 tw:py-2 tw:text-left tw:bg-transparent tw:border-0 tw:border-r tw:border-b tw:border-black/12.5 tw:rounded-none tw:text-inherit tw:hover:bg-gray-100"
                            onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p as Predicate, id: entity.id } })}
                        >
                            <div className="tw:flex">
                                <div className="tw:grow">
                                    <FontAwesomeIcon icon={faPlus} className="me-1 text-muted" /> {p.label}
                                </div>
                            </div>
                        </button>
                    </DescriptionTooltip>
                ))}
            </div>
        </>
    );
};

export default SuggestionsList;
