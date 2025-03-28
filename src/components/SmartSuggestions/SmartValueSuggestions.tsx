import { faLightbulb, faSpinner, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

import useEntity from '@/components/DataBrowser/hooks/useEntity';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { createResource, getResources } from '@/services/backend/resources';
import { createResourceStatement } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';
import { getLlmResponse } from '@/services/orkgNlp';

type SmartValueSuggestionsProps = {
    paperTitle: string;
    abstract?: string;
    resourceId: string;
    predicateId: string;
    classId?: string;
};

const SmartValueSuggestions: FC<SmartValueSuggestionsProps> = ({ paperTitle, abstract = '', resourceId, predicateId, classId }) => {
    const [recommendedValues, setRecommendedValues] = useState<(Resource | { label: string })[]>([]);
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const { trackEvent } = useMatomo();
    const { mutateStatements } = useEntity();

    const taskName = {
        [PREDICATES.HAS_RESEARCH_PROBLEM]: LLM_TASK_NAMES.RECOMMEND_RESEARCH_PROBLEMS,
        [PREDICATES.METHOD]: LLM_TASK_NAMES.RECOMMEND_METHODS,
        [PREDICATES.MATERIAL]: LLM_TASK_NAMES.RECOMMEND_MATERIALS,
    }[predicateId];

    const getChatResponse = useCallback(async () => {
        setIsLoading(true);
        setIsFailed(false);

        try {
            const llmResponse = await getLlmResponse({
                taskName,
                placeholders: { paperTitle, abstract },
            });
            const values: string[] = llmResponse?.values.slice(0, 5) ?? [];
            const resourcePromises = values.map((label) =>
                classId
                    ? (getResources({
                          include: [classId],
                          q: label,
                          exact: true,
                          size: 1,
                          returnContent: true,
                      }) as Promise<Resource[]>)
                    : (getResources({
                          q: label,
                          exact: true,
                          size: 1,
                          returnContent: true,
                      }) as Promise<Resource[]>),
            );
            const resources = (await Promise.all(resourcePromises)).map((_resources, index) =>
                _resources[0] ? _resources[0] : { label: values[index].toLowerCase(), ...(classId ? { class: classId } : {}) },
            );
            setRecommendedValues(resources);
        } catch (e) {
            setRecommendedValues([]);
            setIsFailed(true);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [abstract, classId, paperTitle, taskName]);

    useEffect(() => {
        if (!isOpenSmartTooltip) {
            return;
        }
        getChatResponse();
    }, [getChatResponse, isOpenSmartTooltip]);

    const handleAddClick = async (value: Resource | { label: string }) => {
        if ('id' in value) {
            await createResourceStatement(resourceId, predicateId, value.id);
        } else {
            const newResourceId = await createResource(value.label, classId ? [classId] : []);
            await createResourceStatement(resourceId, predicateId, newResourceId.id);
        }
        mutateStatements();
        setIsOpenSmartTooltip(false);
        trackEvent({ category: 'smart-suggestions', action: 'click-suggestion', name: taskName });
    };

    return (
        <Tooltip content="Get value suggestions">
            <SmartSuggestions
                tooltipContent={
                    <>
                        <p className="m-0 mb-2">
                            Based on the paper{' '}
                            {!abstract ? (
                                <Tooltip content="The abstract is not found. To improve the suggestions, add the abstract in the 'Suggestions' box on the right">
                                    <span>
                                        abstract (<FontAwesomeIcon icon={faWarning} className="text-warning" />){' '}
                                    </span>
                                </Tooltip>
                            ) : (
                                'abstract'
                            )}{' '}
                            and title, the following values might be suitable
                        </p>
                        <hr />
                        {isLoading && (
                            <div className="ms-2 mb-2">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        )}
                        {!isLoading && !isFailed && recommendedValues.length > 0 && (
                            <div>
                                {recommendedValues.map((value) => (
                                    <DescriptionTooltip key={value.label} _class={ENTITIES.RESOURCE} id={'id' in value ? value.id : undefined}>
                                        <Button
                                            color="smart-darker"
                                            className="me-2 mb-2 text-start rounded-pill"
                                            size="sm"
                                            onClick={() => handleAddClick(value)}
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
                                <Button color="link" size="sm" className="text-white p-0 border-0 align-baseline" onClick={getChatResponse}>
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
                handleReload={getChatResponse}
            >
                <button type="button" className="btn btn-smart px-3 btn-sm" onClick={() => setIsOpenSmartTooltip((v) => !v)}>
                    <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '120%' }} />
                </button>
            </SmartSuggestions>
        </Tooltip>
    );
};

export default SmartValueSuggestions;
