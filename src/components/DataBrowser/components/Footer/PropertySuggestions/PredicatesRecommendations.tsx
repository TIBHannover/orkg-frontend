import { faChevronDown, faChevronUp, faPlus, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import usePredicatesRecommendation from '@/components/DataBrowser/hooks/usePredicatesRecommendation';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
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

    if (isDisabledFeature || !entity || recommendedPredicates.length === 0) {
        return null;
    }

    const handlePropertyClick = (property: { id: string; label: string }) => {
        dispatch({ type: 'ADD_PROPERTY', payload: { id: entity.id, predicate: property as Predicate } });
        try {
            saveFeedback({
                request: { title, abstract },
                response: { property },
                serviceName: SERVICE_MAPPING.PREDICATES_CLUSTERING,
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="mt-4 pt-3 border-t border-border">
            <div className="text-sm font-semibold mb-3 inline-flex items-center gap-1">
                Suggestions
                <Tooltip delay={0}>
                    <Tooltip.Trigger>
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help text-xs" />
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow className="max-w-[300px]">
                        <Tooltip.Arrow />
                        The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these
                        suggestions is optional.
                    </Tooltip.Content>
                </Tooltip>
            </div>
            <div className="flex flex-wrap min-w-0">
                <AnimatePresence mode="popLayout">
                    {_recommendedPredicates.map((p, index) => (
                        <motion.div
                            key={`${p.id}-${index}`}
                            className="flex items-center max-w-full min-w-0"
                            initial={{ opacity: 0, x: -30, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -30, scale: 0.8 }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                            layout
                        >
                            <button
                                type="button"
                                onClick={() => handlePropertyClick(p)}
                                className="mr-2 mb-2 relative pr-3 pl-9 py-1 rounded-full text-sm border border-border bg-surface text-foreground hover:bg-default/50 max-w-full text-left whitespace-normal min-h-8 transition-colors"
                            >
                                <span className="absolute left-0 top-0 h-full w-7 rounded-l-full flex items-center justify-center bg-smart text-white">
                                    <FontAwesomeIcon size="sm" icon={faPlus} />
                                </span>
                                <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE} showURL>
                                    {p.label}
                                </DescriptionTooltip>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {recommendedPredicates.length > MAX_PROPERTIES_ITEMS && (
                <div className="flex justify-center mt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted hover:text-foreground gap-1.5"
                        onPress={() => setShowMorePredicates((v) => !v)}
                    >
                        <FontAwesomeIcon icon={showMorePredicates ? faChevronUp : faChevronDown} />
                        {showMorePredicates ? 'Show less' : `Show ${recommendedPredicates.length - MAX_PROPERTIES_ITEMS} more`}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PredicatesRecommendations;
