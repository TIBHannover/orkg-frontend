import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';

import AllPropertiesModal from '@/app/grid-editor/components/Footer/PropertySuggestions/SuggestionsList/AllPropertiesModal';
import { useGridDispatch } from '@/app/grid-editor/context/GridContext';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Predicate, Template } from '@/services/backend/types';

type SuggestionsListProps = {
    template: Template;
    filteredProperties: Predicate[];
};

const SuggestionsList: FC<SuggestionsListProps> = ({ template, filteredProperties }) => {
    const dispatch = useGridDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (filteredProperties.length === 0) {
        return null;
    }

    const displayedProperties = filteredProperties.slice(0, 6);
    const hasMoreProperties = filteredProperties.length > 6;

    return (
        <>
            <div className="tw:bg-white tw:border tw:border-gray-200 tw:rounded-lg tw:shadow-sm tw:overflow-hidden">
                <div className="tw:bg-gray-50 tw:px-4 tw:py-3 tw:border-b tw:border-gray-200">
                    <h6 className="tw:text-sm tw:font-medium tw:text-gray-700 tw:m-0">
                        <Link
                            target="_blank"
                            href={reverse(ROUTES.TEMPLATE, { id: template.id })}
                            className="tw:text-sm tw:font-medium tw:text-gray-700! tw:m-0"
                        >
                            {template.label}
                        </Link>
                    </h6>
                </div>
                <div className="tw:divide-y tw:divide-gray-100">
                    {displayedProperties.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            className="tw:w-full tw:text-left tw:px-4 tw:py-2 tw:cursor-pointer tw:hover:bg-gray-50 tw:transition-colors tw:duration-150 tw:border-0 tw:bg-transparent"
                            onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p } })}
                        >
                            <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE}>
                                <div className="tw:flex tw:items-center">
                                    <FontAwesomeIcon icon={faPlus} className="tw:text-gray-400 tw:mr-2 tw:text-xs" />
                                    <span className="tw:text-sm tw:text-gray-700">{p.label}</span>
                                </div>
                            </DescriptionTooltip>
                        </button>
                    ))}
                    {hasMoreProperties && (
                        <button
                            type="button"
                            className="tw:w-full tw:text-left tw:px-4 tw:py-2 tw:cursor-pointer tw:hover:bg-gray-50 tw:transition-colors tw:duration-150 tw:border-0 tw:bg-transparent tw:border-t tw:border-gray-100"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="tw:flex tw:items-center tw:justify-center">
                                <FontAwesomeIcon icon={faChevronDown} className="tw:text-gray-400 tw:mr-2 tw:text-xs" />
                                <span className="tw:text-sm tw:text-gray-600 tw:font-medium">
                                    View {filteredProperties.length - 6} more properties
                                </span>
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
