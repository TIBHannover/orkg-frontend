import { useCallback } from 'react';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { saveFeedback, SERVICE_MAPPING } from 'services/orkgNlp';

const useFeedbacks = () => {
    const { title, abstract, predicatesRawResponse } = useSelector(state => state.addPaper);

    const handleSavePredicatesRecommendationFeedback = useCallback(
        properties => {
            // create the response object in the require format for the feedback endpoint
            // for predicates coming from the NLP service, feedback either ACCEPT or REJECT
            const response = cloneDeep(predicatesRawResponse);
            const propertyIds = properties.allIds.map(propertyId => {
                const property = properties.byId[propertyId];
                return property.existingPredicateId;
            });
            for (const [i, predicate] of predicatesRawResponse.predicates.entries()) {
                response.predicates[i].feedback = propertyIds.includes(predicate.id) ? 'ACCEPT' : 'REJECT';
            }

            try {
                saveFeedback({
                    request: {
                        title,
                        abstract,
                    },
                    response,
                    serviceName: SERVICE_MAPPING.PREDICATES_CLUSTERING,
                });
            } catch (e) {
                console.log(e);
            }
        },
        [abstract, predicatesRawResponse, title],
    );

    return {
        handleSavePredicatesRecommendationFeedback,
    };
};

export default useFeedbacks;
