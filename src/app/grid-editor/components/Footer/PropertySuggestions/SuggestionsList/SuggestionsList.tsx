import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FC, useState } from 'react';

import AllPropertiesModal from '@/app/grid-editor/components/Footer/PropertySuggestions/SuggestionsList/AllPropertiesModal';
import { useGridDispatch } from '@/app/grid-editor/context/GridContext';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Predicate, Template } from '@/services/backend/types';

type SuggestionsListProps = {
    template: Template;
    filteredProperties: Predicate[];
};

const MAX_VISIBLE = 6;

const SuggestionsList: FC<SuggestionsListProps> = ({ template, filteredProperties }) => {
    const dispatch = useGridDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (filteredProperties.length === 0) {
        return null;
    }

    const displayedProperties = filteredProperties.slice(0, MAX_VISIBLE);
    const hasMoreProperties = filteredProperties.length > MAX_VISIBLE;

    return (
        <>
            <div className="bg-surface border border-border rounded-[var(--radius)] shadow-sm overflow-hidden">
                <div className="bg-default/40 px-4 py-3 border-b border-border">
                    <h6 className="text-sm font-medium text-foreground m-0">
                        <Link
                            target="_blank"
                            href={reverse(ROUTES.TEMPLATE, { id: template.id })}
                            className="text-sm font-medium !text-foreground m-0"
                        >
                            {template.label}
                        </Link>
                    </h6>
                </div>
                <div className="divide-y divide-border">
                    {displayedProperties.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-4 py-2 cursor-pointer hover:bg-default/40 transition-colors duration-150 border-0 bg-transparent"
                            onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p } })}
                        >
                            <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE}>
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faPlus} className="text-muted mr-2 text-xs" />
                                    <span className="text-sm text-foreground">{p.label}</span>
                                </div>
                            </DescriptionTooltip>
                        </button>
                    ))}
                    {hasMoreProperties && (
                        <button
                            type="button"
                            className="w-full text-left px-4 py-2 cursor-pointer hover:bg-default/40 transition-colors duration-150 border-0 bg-transparent"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="flex items-center justify-center">
                                <FontAwesomeIcon icon={faChevronDown} className="text-muted mr-2 text-xs" />
                                <span className="text-sm text-muted font-medium">View {filteredProperties.length - MAX_VISIBLE} more properties</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
            <AllPropertiesModal
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(!isModalOpen)}
                template={template}
                properties={filteredProperties}
            />
        </>
    );
};

export default SuggestionsList;
