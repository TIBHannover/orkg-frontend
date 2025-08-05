import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import usePredicatesRecommendation from '@/components/DataBrowser/hooks/usePredicatesRecommendation';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ListGroup from '@/components/Ui/List/ListGroup';
import Tooltip from '@/components/Utils/Tooltip';
import { ShowMoreButton, ValueItem } from '@/components/ViewPaper/SmartSuggestions/styled';
import { ENTITIES } from '@/constants/graphSettings';
import { Predicate } from '@/services/backend/types';
import { saveFeedback, SERVICE_MAPPING } from '@/services/orkgNlp';

const MAX_PROPERTIES_ITEMS = 8;

const PredicatesRecommendations = () => {
    const [showMorePredicates, setShowMorePredicates] = useState(false);
    const dispatch = useDataBrowserDispatch();
    const { entity } = useEntity();
    const { context } = useDataBrowserState();
    const { title, abstract } = context;
    const { isDisabledFeature, recommendedPredicates } = usePredicatesRecommendation();
    const _recommendedPredicates = showMorePredicates ? recommendedPredicates : recommendedPredicates.slice(0, MAX_PROPERTIES_ITEMS);

    if (isDisabledFeature || !entity) {
        return null;
    }

    const handlePropertyClick = (property: { id: string; label: string }) => {
        dispatch({ type: 'ADD_PROPERTY', payload: { id: entity.id, predicate: property as Predicate } });
        try {
            saveFeedback({
                request: {
                    title,
                    abstract,
                },
                response: { property },
                serviceName: SERVICE_MAPPING.PREDICATES_CLUSTERING,
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            {recommendedPredicates.length > 0 && (
                <h6 className="mt-1">
                    <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                        Suggestions
                    </Tooltip>
                </h6>
            )}
            <ListGroup>
                <AnimatePresence mode="popLayout">
                    {_recommendedPredicates.map((p, index) => (
                        <motion.div
                            key={`${p.id}-${index}`}
                            className="py-2 d-flex align-items-center px-2"
                            initial={{ opacity: 0, x: -30, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -30, scale: 0.8 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                                ease: 'easeOut',
                            }}
                            layout
                        >
                            <ValueItem action style={{ fontSize: '90%', cursor: 'pointer' }} onClick={() => handlePropertyClick(p)}>
                                <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE} showURL>
                                    <FontAwesomeIcon icon={faPlus} className="text-smart me-2" /> {p.label}
                                </DescriptionTooltip>
                            </ValueItem>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </ListGroup>
            {recommendedPredicates.length > MAX_PROPERTIES_ITEMS && (
                <div className="text-center">
                    <ShowMoreButton
                        onClick={() => setShowMorePredicates((v) => !v)}
                        color="link"
                        size="sm"
                        className="p-0 ms-2 mt-2 mb-3"
                        style={{ outline: 0 }}
                    >
                        {showMorePredicates ? 'Show less suggestions' : 'Show more suggestions'}
                    </ShowMoreButton>
                </div>
            )}
        </div>
    );
};

export default PredicatesRecommendations;
