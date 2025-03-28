import { faLightbulb, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { functions, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import { ENTITIES } from '@/constants/graphSettings';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { createPredicate, getPredicates } from '@/services/backend/predicates';
import { getLlmResponse } from '@/services/orkgNlp';

const SmartPropertySuggestions = ({ properties, handleCreate }) => {
    const [recommendedProperties, setRecommendedProperties] = useState([]);
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const { trackEvent } = useMatomo();

    const getChatResponse = useCallback(async () => {
        if (!properties || properties.length === 0) {
            return;
        }
        setIsLoading(true);
        setIsFailed(false);

        try {
            const llmResponse = await getLlmResponse({
                taskName: LLM_TASK_NAMES.RECOMMEND_PROPERTIES,
                placeholders: { properties },
            });
            const propertyPromises = llmResponse?.properties.map((propertyLabel) =>
                getPredicates({ q: propertyLabel, exact: true, size: 1, returnContent: true }),
            );
            const fetchedProperties = (await Promise.all(propertyPromises)).map((_properties, index) =>
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

    const handleProblemClick = async (property) => {
        const selectedProperty = property;
        if (!property.id) {
            const _property = await createPredicate(property.label);
            selectedProperty.id = _property.id;
        }
        trackEvent({ category: 'smart-suggestions', action: 'click-suggestion', name: LLM_TASK_NAMES.RECOMMEND_PROPERTIES });
        handleCreate(selectedProperty);
        setIsOpenSmartTooltip(false);
    };

    return (
        <Tooltip content="Get suggestions for new properties">
            <SmartSuggestions
                tooltipContent={
                    <>
                        <p className="m-0 mb-2">Based on the already used properties, the following properties might be relevant</p>
                        <hr />
                        {isLoading && (
                            <div className="ms-2 mb-2">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        )}
                        {!isLoading && !isFailed && recommendedProperties.length > 0 && (
                            <div>
                                {recommendedProperties.map((property) => (
                                    <DescriptionTooltip key={property.label} _class={ENTITIES.PREDICATE} id={property.id}>
                                        <Button
                                            color="smart-darker"
                                            onClick={() => handleProblemClick(property)}
                                            className="me-2 mb-2 text-start rounded-pill"
                                            size="sm"
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
                                <Button color="link" size="sm" className="text-white p-0 border-0 align-baseline" onClick={getChatResponse}>
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
                <button
                    type="button"
                    className="btn btn-smart px-3 btn-sm"
                    style={{ marginLeft: 1 }}
                    onClick={() => setIsOpenSmartTooltip((v) => !v)}
                >
                    <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '120%' }} />
                </button>
            </SmartSuggestions>
        </Tooltip>
    );
};

SmartPropertySuggestions.propTypes = {
    properties: PropTypes.array.isRequired,
    handleCreate: PropTypes.func.isRequired,
};

// use memo to prevent rerendering when the PaperHeaderBar appears/disappears on scroll
export default memo(SmartPropertySuggestions, (prevProps, nextProps) =>
    isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps))),
);
