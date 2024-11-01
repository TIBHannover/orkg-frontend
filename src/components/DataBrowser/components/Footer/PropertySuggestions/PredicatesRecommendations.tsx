import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import usePredicatesRecommendation from 'components/DataBrowser/hooks/usePredicatesRecommendation';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from 'components/Utils/Tooltip';
import { AnimationContainer, ShowMoreButton, ValueItem } from 'components/ViewPaper/SmartSuggestions/styled';
import { ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ListGroup } from 'reactstrap';
import { Predicate } from 'services/backend/types';
import { SERVICE_MAPPING, saveFeedback } from 'services/orkgNlp';

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
                <TransitionGroup component={null} height="30px">
                    {_recommendedPredicates.map((p, index) => (
                        <AnimationContainer
                            key={index}
                            classNames="slide-left"
                            className="py-2 d-flex align-items-center px-2"
                            timeout={{ enter: 600, exit: 600 }}
                        >
                            <ValueItem action style={{ fontSize: '90%', cursor: 'pointer' }} onClick={() => handlePropertyClick(p)}>
                                <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE} showURL>
                                    <FontAwesomeIcon icon={faPlus} className="text-smart me-2" /> {p.label}
                                </DescriptionTooltip>
                            </ValueItem>
                        </AnimationContainer>
                    ))}
                </TransitionGroup>
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
