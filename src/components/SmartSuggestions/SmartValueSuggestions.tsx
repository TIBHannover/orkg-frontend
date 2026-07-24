import { faSpinner, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator, Tooltip } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { FC, useState } from 'react';

import useEntity from '@/components/DataBrowser/hooks/useEntity';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useLlmSuggestion from '@/components/SmartSuggestions/hooks/useLlmSuggestion';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { createResource, getResources } from '@/services/backend/resources';
import { createResourceStatement } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';

type SuggestedValue = Resource | { label: string };

type SmartValueSuggestionsProps = {
    paperTitle: string;
    abstract?: string;
    resourceId: string;
    predicateId: string;
    classId?: string;
    className?: string;
};

const SmartValueSuggestions: FC<SmartValueSuggestionsProps> = ({ paperTitle, abstract = '', resourceId, predicateId, classId, className = '' }) => {
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const { mutateStatements } = useEntity();

    const taskName = {
        [PREDICATES.HAS_RESEARCH_PROBLEM]: LLM_TASK_NAMES.RECOMMEND_RESEARCH_PROBLEMS,
        [PREDICATES.METHOD]: LLM_TASK_NAMES.RECOMMEND_METHODS,
        [PREDICATES.MATERIAL]: LLM_TASK_NAMES.RECOMMEND_MATERIALS,
    }[predicateId];

    const {
        data: recommendedValues = [],
        isLoading,
        isFailed,
        reload,
    } = useLlmSuggestion<SuggestedValue[]>({
        taskName,
        placeholders: { paperTitle, abstract },
        isEnabled: isOpenSmartTooltip,
        // classId is not sent to the LLM, but it decides which resources the suggestions resolve to,
        // so it has to be part of the key: otherwise two inputs with the same paper but a different
        // class would share a cache entry and show each other's resources
        extraKeyParams: { classId },
        transform: async (llmResponse) => {
            const values: string[] = llmResponse?.values.slice(0, 5) ?? [];
            const resources = await Promise.all(
                values.map(
                    (label) =>
                        getResources({
                            ...(classId ? { include: [classId] } : {}),
                            q: label,
                            exact: true,
                            size: 1,
                            returnContent: true,
                        }) as Promise<Resource[]>,
                ),
            );
            return resources.map((_resources, index) =>
                _resources[0] ? _resources[0] : { label: values[index].toLowerCase(), ...(classId ? { class: classId } : {}) },
            );
        },
    });

    const handleAddClick = async (value: SuggestedValue) => {
        if ('id' in value) {
            await createResourceStatement(resourceId, predicateId, value.id);
        } else {
            const newResourceId = await createResource({ label: value.label, classes: classId ? [classId] : [] });
            await createResourceStatement(resourceId, predicateId, newResourceId);
        }
        mutateStatements();
        setIsOpenSmartTooltip(false);
        sendEvent({ category: 'smart-suggestions', action: 'click-suggestion', name: taskName });
    };

    return (
        <SmartSuggestions
            triggerTooltip="Get value suggestions"
            tooltipContent={
                <>
                    {/* not a <p>: the HeroUI tooltip trigger renders a <div>, which is invalid inside a paragraph */}
                    <div className="m-0 mb-2">
                        Based on the paper{' '}
                        {!abstract ? (
                            <Tooltip delay={0}>
                                <Tooltip.Trigger className="inline">
                                    <span>
                                        abstract (<FontAwesomeIcon icon={faWarning} className="text-yellow-600" />){' '}
                                    </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow className="max-w-[300px]">
                                    <Tooltip.Arrow />
                                    The abstract is not found. To improve the suggestions, add the abstract in the &apos;Suggestions&apos; box on the
                                    right
                                </Tooltip.Content>
                            </Tooltip>
                        ) : (
                            'abstract'
                        )}{' '}
                        and title, the following values might be suitable
                    </div>
                    <Separator className="my-3" />
                    {isLoading && (
                        <div className="ml-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && recommendedValues.length > 0 && (
                        <div>
                            {recommendedValues.map((value) => (
                                <DescriptionTooltip key={value.label} _class={ENTITIES.RESOURCE} id={'id' in value ? value.id : undefined}>
                                    <Button
                                        size="sm"
                                        className="mr-2 mb-2 text-left rounded-full bg-smart-darker text-white hover:bg-smart border-0"
                                        onPress={() => handleAddClick(value)}
                                    >
                                        {value.label}
                                    </Button>
                                </DescriptionTooltip>
                            ))}
                        </div>
                    )}
                    {(isFailed || (recommendedValues.length === 0 && !isLoading)) && (
                        <em>
                            {isFailed ? 'Failed to fetch recommendations.' : 'No recommendations found'}{' '}
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={reload}
                                className="!p-0 !min-w-0 !h-auto text-white border-0 bg-transparent align-baseline underline"
                            >
                                Try again.
                            </Button>
                        </em>
                    )}
                </>
            }
            isOpenSmartTooltip={isOpenSmartTooltip}
            setIsOpenSmartTooltip={setIsOpenSmartTooltip}
            inputData={{ paperTitle }}
            outputData={recommendedValues}
            llmTask={taskName}
            handleReload={reload}
        >
            <SmartTriggerButton ariaLabel="Get value suggestions" className={className} />
        </SmartSuggestions>
    );
};

export default SmartValueSuggestions;
