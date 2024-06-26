import useInsertData from 'components/ViewPaper/hooks/useInsertData';
import { cloneDeep } from 'lodash';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PROPERTY_MAPPING, saveFeedback, SERVICE_MAPPING } from 'services/orkgNlp';

const useEntityRecognition = ({ activeNERService, title, abstract }) => {
    const { nerResources, nerProperties, nerRawResponse } = useSelector((state) => state.viewPaper);
    const { properties, values } = useSelector((state) => state.statementBrowser);
    const { getExistingStatement } = useInsertData();

    const getSuggestions = useCallback(
        ({ onlyUsedSuggestions = false }) => {
            const _nerEntities = {};
            if (activeNERService) {
                for (const key of Object.keys(nerResources)) {
                    _nerEntities[key] = nerResources[key].filter((item) => {
                        const isExistingStatement = getExistingStatement({
                            object: {
                                label: item.label,
                            },
                            property: {
                                label: nerProperties?.[key]?.label,
                            },
                        });
                        return (isExistingStatement && onlyUsedSuggestions) || (!isExistingStatement && !onlyUsedSuggestions);
                    });
                }
            }

            return _nerEntities;
        },
        [getExistingStatement, nerProperties, nerResources, activeNERService],
    );

    const suggestions = getSuggestions({ onlyUsedSuggestions: false });
    const usedSuggestions = getSuggestions({ onlyUsedSuggestions: true });

    const handleSaveFeedback = () => {
        // create the response object in the require format for the feedback endpoint
        // for resources coming from the NER service, feedback either ACCEPT or REJECT
        const response = cloneDeep(nerRawResponse);
        if (activeNERService === SERVICE_MAPPING.CS_NER) {
            for (const type of Object.keys(nerRawResponse)) {
                const concepts = nerRawResponse[type];
                for (const [index, concept] of concepts.entries()) {
                    for (const [index2, entity] of concept.entities.entries()) {
                        const propertyId = Object.keys(nerProperties).find((_propertyId) => nerProperties[_propertyId].concept === concept.concept);
                        const isExistingStatement = getExistingStatement({
                            object: {
                                label: entity,
                            },
                            property: {
                                label: nerProperties[propertyId].label,
                            },
                        });
                        response[type][index].entities.splice(index2);
                        response[type][index].entities.push({
                            entity,
                            feedback: isExistingStatement ? 'ACCEPT' : 'REJECT',
                        });
                    }
                }
            }
        } else {
            // Agri NER doesn't have title and abstract concepts
            for (const [index, concept] of nerRawResponse.entries()) {
                for (const [index2, entity] of concept.entities.entries()) {
                    const propertyId = Object.keys(nerProperties).find((_propertyId) => nerProperties[_propertyId].concept === concept.concept);
                    const isExistingStatement = getExistingStatement({
                        object: {
                            label: entity,
                        },
                        property: {
                            label: nerProperties[propertyId].label,
                        },
                    });
                    response[index].entities.splice(index2);
                    response[index].entities.push({
                        entity,
                        feedback: isExistingStatement ? 'ACCEPT' : 'REJECT',
                    });
                }
            }
        }

        const nerSupportedProperties = Object.keys(properties.byId).filter((propertyId) =>
            Object.values(PROPERTY_MAPPING).includes(properties.byId[propertyId].existingPredicateId),
        );

        // for resources/literals that are added to the NER supported properties (feedback is ADD)
        for (const propertyId of nerSupportedProperties) {
            for (const valueId of properties.byId[propertyId].valueIds) {
                const label = values.byId[valueId]?.label;
                const isAddedResource = !nerResources?.[properties.byId[propertyId].existingPredicateId]?.find(
                    (resource) => resource.label === label,
                );
                if (isAddedResource) {
                    const id = properties.byId[propertyId].existingPredicateId;
                    const nerConcept = Object.entries(PROPERTY_MAPPING).find(([, value]) => value === id)?.[0];
                    const existingIndex = response.title.findIndex((type) => type.concept === nerConcept);
                    const entity = {
                        entity: label,
                        feedback: 'ADD',
                    };

                    if (existingIndex !== -1) {
                        response.title[existingIndex].entities.push(entity);
                    } else {
                        response.title.push({
                            concept: nerConcept,
                            entities: [entity],
                        });
                    }
                }
            }
        }

        try {
            saveFeedback({
                request: {
                    title,
                    abstract,
                },
                response,
                serviceName: activeNERService,
            });
        } catch (e) {
            console.log(e);
        }
    };

    return { suggestions, usedSuggestions, handleSaveFeedback };
};

export default useEntityRecognition;
