import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { functions, isEqual, omit } from 'lodash';
import { FC, memo, useCallback, useEffect, useState } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import { ENTITIES } from '@/constants/graphSettings';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { createPredicate, getPredicates } from '@/services/backend/predicates';
import { Predicate } from '@/services/backend/types';
import { getLlmResponse } from '@/services/orkgNlp';

type SuggestedProperty = {
    id?: string;
    label: string;
};

type SmartPropertySuggestionsProps = {
    properties: string[];
    handleCreate: (property: Predicate) => void;
    className?: string;
};

const SmartPropertySuggestions: FC<SmartPropertySuggestionsProps> = ({ properties, handleCreate, className = '' }) => {
    const [recommendedProperties, setRecommendedProperties] = useState<SuggestedProperty[]>([]);
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const getChatResponse = useCallback(async () => {
        if (!properties || properties.length === 0) {
            return;
        }
        setIsLoading(true);
        setIsFailed(false);

        try {
            const llmResponse = await getLlmResponse({
                taskName: LLM_TASK_NAMES.RECOMMEND_PROPERTIES,
                placeholders: { properties } as unknown as { [key: string]: string },
            });
            const propertyPromises: Promise<{ id: string; label: string }[]>[] = llmResponse?.properties.map((propertyLabel: string) =>
                getPredicates({ q: propertyLabel, exact: true, size: 1, returnContent: true }),
            );
            const fetchedProperties: SuggestedProperty[] = (await Promise.all(propertyPromises)).map((_properties, index) =>
                _properties[0] ? { id: _properties[0].id, label: _properties[0].label } : { label: llmResponse?.properties[index].toLowerCase() },
            );
            setRecommendedProperties(fetchedProperties);
        } catch (e) {
            setRecommendedProperties([]);
            setIsFailed(true);
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    }, [properties]);

    useEffect(() => {
        if (!isOpenSmartTooltip) {
            setRecommendedProperties([]);
            return;
        }
        getChatResponse();
    }, [getChatResponse, isOpenSmartTooltip]);

    const handleProblemClick = async (property: SuggestedProperty) => {
        let selectedId = property.id;
        if (!selectedId) {
            selectedId = await createPredicate(property.label);
        }
        sendEvent({ category: 'smart-suggestions', action: 'click-suggestion', name: LLM_TASK_NAMES.RECOMMEND_PROPERTIES });
        handleCreate({ id: selectedId, label: property.label } as Predicate);
        setIsOpenSmartTooltip(false);
    };

    return (
        <Tooltip content="Get suggestions for new properties">
            <SmartSuggestions
                tooltipContent={
                    <>
                        <p className="m-0 mb-2">Based on the already used properties, the following properties might be relevant</p>
                        <Separator className="my-3" />
                        {isLoading && (
                            <div className="ml-2 mb-2">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        )}
                        {!isLoading && !isFailed && recommendedProperties.length > 0 && (
                            <div>
                                {recommendedProperties.map((property) => (
                                    <DescriptionTooltip key={property.label} _class={ENTITIES.PREDICATE} id={property.id}>
                                        <Button
                                            size="sm"
                                            onPress={() => handleProblemClick(property)}
                                            className="mr-2 mb-2 text-left rounded-full bg-smart-darker text-white hover:bg-smart border-0"
                                        >
                                            {property.label}
                                        </Button>
                                    </DescriptionTooltip>
                                ))}
                            </div>
                        )}
                        {(isFailed || (recommendedProperties.length === 0 && !isLoading && properties.length > 0)) && (
                            <em>
                                {isFailed ? 'Failed to fetch recommendations.' : 'No recommendations found'}{' '}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={getChatResponse}
                                    className="!p-0 !min-w-0 !h-auto text-white border-0 bg-transparent align-baseline underline"
                                >
                                    Try again.
                                </Button>
                            </em>
                        )}
                        {(!properties || properties.length === 0) && (
                            <em>No properties added yet, first add properties yourself to use this functionality</em>
                        )}
                    </>
                }
                isOpenSmartTooltip={isOpenSmartTooltip}
                setIsOpenSmartTooltip={setIsOpenSmartTooltip}
                inputData={{ properties }}
                outputData={recommendedProperties}
                llmTask={LLM_TASK_NAMES.RECOMMEND_PROPERTIES}
                handleReload={getChatResponse}
            >
                <SmartTriggerButton ariaLabel="Suggest properties" onPress={() => setIsOpenSmartTooltip((v) => !v)} className={className} />
            </SmartSuggestions>
        </Tooltip>
    );
};

export default memo(SmartPropertySuggestions, (prevProps, nextProps) =>
    isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps))),
);
