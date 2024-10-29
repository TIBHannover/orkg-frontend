import { cloneDeep, uniqBy } from 'lodash';
import { useSelector } from 'react-redux';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { PROPERTY_MAPPING, saveFeedback, SERVICE_MAPPING } from 'services/orkgNlp';
import useSWR from 'swr';

const useEntityRecognition = ({ activeNERService, title, abstract, resourceId }) => {
    const { nerResources, nerProperties, nerRawResponse } = useSelector((state) => state.viewPaper);

    const { data: statements } = useSWR(
        resourceId ? [{ subjectId: resourceId, returnContent: true, returnFormattedLabels: true }, statementsUrl, 'getStatements'] : null,
        ([params]) => getStatements(params),
    );

    const properties = uniqBy(statements?.map((statement) => statement.predicate) ?? [], 'id');

    const getSuggestions = ({ onlyUsedSuggestions = false }) => {
        const _nerEntities = {};
        if (activeNERService) {
            for (const key of Object.keys(nerResources)) {
                _nerEntities[key] = nerResources[key].filter((item) => {
                    const isExistingStatement = statements?.find(
                        (s) => s.object.label === item.label && s.predicate.label === nerProperties?.[key]?.label,
                    );

                    return (isExistingStatement && onlyUsedSuggestions) || (!isExistingStatement && !onlyUsedSuggestions);
                });
            }
        }

        return _nerEntities;
    };

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
                        const isExistingStatement = statements?.find(
                            (statement) => statement.object.label === entity && statement.predicate.label === nerProperties[propertyId].label,
                        );
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
                    const isExistingStatement = statements?.find(
                        (statement) => statement.object.label === entity && statement.predicate.label === nerProperties[propertyId].label,
                    );
                    response[index].entities.splice(index2);
                    response[index].entities.push({
                        entity,
                        feedback: isExistingStatement ? 'ACCEPT' : 'REJECT',
                    });
                }
            }
        }

        const nerSupportedProperties = properties.filter((property) => Object.values(PROPERTY_MAPPING).includes(property.id));

        // for resources/literals that are added to the NER supported properties (feedback is ADD)
        for (const propertyId of nerSupportedProperties) {
            for (const objectValue of statements
                .filter((statement) => statement.predicate.id === propertyId.id)
                .map((statement) => statement.object)) {
                const { label } = objectValue;
                const isAddedResource = !nerResources?.[propertyId.id]?.find((resource) => resource.label === label);
                if (isAddedResource) {
                    const { id } = propertyId;
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
