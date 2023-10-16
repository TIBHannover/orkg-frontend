import { faLightbulb, faSpinner, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import SmartSuggestions from 'components/SmartSuggestions/SmartSuggestions';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { getResources, getResourcesByClass } from 'services/backend/resources';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import useValueForm from 'components/StatementBrowser/ValueForm/hooks/useValueForm';
import Tippy from '@tippyjs/react';
import { getLlmResponse } from 'services/orkgNlp';
import LLM_TASK_NAMES from 'constants/llmTasks';

export const SmartValueSuggestions = ({ paperTitle, abstract = '', resourceId, propertyId, classId = null }) => {
    const { handleAddValue, property } = useValueForm({
        resourceId,
        propertyId,
        syncBackend: true,
    });

    const [recommendedValues, setRecommendedValues] = useState([]);
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const { trackEvent } = useMatomo();

    const taskName = {
        [PREDICATES.HAS_RESEARCH_PROBLEM]: LLM_TASK_NAMES.RECOMMEND_RESEARCH_PROBLEMS,
        [PREDICATES.METHOD]: LLM_TASK_NAMES.RECOMMEND_METHODS,
        [PREDICATES.MATERIAL]: LLM_TASK_NAMES.RECOMMEND_MATERIALS,
    }[property.existingPredicateId];

    const getChatResponse = useCallback(async () => {
        setIsLoading(true);
        setIsFailed(false);

        try {
            const llmResponse = await getLlmResponse({
                taskName,
                placeholders: { paperTitle, abstract },
            });
            const values = llmResponse?.values.slice(0, 5) ?? [];
            const resourcePromises = values.map(label =>
                classId
                    ? getResourcesByClass({
                          id: classId,
                          q: label,
                          exact: true,
                          items: 1,
                          returnContent: true,
                      })
                    : getResources({
                          q: label,
                          exact: true,
                          items: 1,
                          returnContent: true,
                      }),
            );
            const resources = (await Promise.all(resourcePromises)).map((_resources, index) =>
                _resources[0]
                    ? { id: _resources[0].id, label: _resources[0].label, ...(classId ? { class: classId } : {}) }
                    : { label: values[index].toLowerCase(), ...(classId ? { class: classId } : {}) },
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

    const handleAddClick = value => {
        handleAddValue(ENTITIES.RESOURCE, { id: value.id, label: value.label, class: value.class, selected: !!value.id });
        setIsOpenSmartTooltip(false);
        trackEvent({ category: 'smart-suggestions', action: 'click-suggestion', name: taskName });
    };

    return (
        <SmartSuggestions
            tooltipContent={
                <>
                    <p className="m-0 mb-2">
                        Based on the paper{' '}
                        {!abstract ? (
                            <Tippy content="The abstract is not found. To improve the suggestions, add the abstract in the 'Suggestions' box on the right">
                                <span>
                                    abstract (<Icon icon={faWarning} className="text-warning" />){' '}
                                </span>
                            </Tippy>
                        ) : (
                            'abstract'
                        )}{' '}
                        and title, the following values might be suitable
                    </p>
                    <hr />
                    {isLoading && (
                        <div className="ms-2 mb-2">
                            <Icon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && recommendedValues.length > 0 && (
                        <div>
                            {recommendedValues.map(value => (
                                <DescriptionTooltip key={value.label} _class={ENTITIES.RESOURCE} id={value.id}>
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
            <Tippy content="Get value suggestions">
                <button className="btn btn-smart px-3 btn-sm" onClick={() => setIsOpenSmartTooltip(v => !v)}>
                    <Icon icon={faLightbulb} style={{ fontSize: '120%' }} />
                </button>
            </Tippy>
        </SmartSuggestions>
    );
};

SmartValueSuggestions.propTypes = {
    paperTitle: PropTypes.string.isRequired,
    abstract: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    classId: PropTypes.string,
};

export default SmartValueSuggestions;
