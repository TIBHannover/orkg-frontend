import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { AnimationContainer, ShowMoreButton, ValueItem } from 'components/ViewPaper/SmartSuggestions/styled';
import usePredicatesRecommendation from 'components/ViewPaper/hooks/usePredicatesRecommendation';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { ListGroup } from 'reactstrap';
import { SERVICE_MAPPING, saveFeedback } from 'services/orkgNlp';
import { createPropertyAction as createProperty } from 'slices/statementBrowserSlice';

const MAX_PROPERTIES_ITEMS = 8;

function PredicatesRecommendations({ title = '', abstract = '' }) {
    const [showMorePredicates, setShowMorePredicates] = useState(false);
    const dispatch = useDispatch();
    const selectedResource = useSelector((state) => state.statementBrowser.selectedResource);

    const { recommendedPredicates } = usePredicatesRecommendation({ title, abstract });
    const _recommendedPredicates = showMorePredicates ? recommendedPredicates : recommendedPredicates.slice(0, MAX_PROPERTIES_ITEMS);

    const handlePropertyClick = (property) => {
        dispatch(
            createProperty({
                resourceId: selectedResource,
                existingPredicateId: property.id,
                label: property.label,
                isTemplate: false,
                createAndSelect: true,
            }),
        );
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
            {recommendedPredicates.length > 0 && <h6 className="mt-1">Properties</h6>}
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
                                    <Icon icon={faAngleDoubleLeft} className="text-smart me-2" /> {p.label}
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
}

PredicatesRecommendations.propTypes = {
    title: PropTypes.string,
    abstract: PropTypes.string,
};

export default PredicatesRecommendations;
