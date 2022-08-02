import useInsertData from 'components/AddPaper/hooks/useInsertData';
import { cloneDeep } from 'lodash';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { saveFeedback } from 'services/orkgNlp';

const useEntityRecognition = () => {
    const { nerResources, nerProperties, nerRawResponse, title, abstract } = useSelector(state => state.addPaper);
    const { getExistingStatement } = useInsertData();

    const getSuggestions = useCallback(
        ({ onlyUsedSuggestions = false }) => {
            const _nerEntities = {};
            for (const key of Object.keys(nerResources)) {
                _nerEntities[key] = nerResources[key].filter(item => {
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
            return _nerEntities;
        },
        [getExistingStatement, nerProperties, nerResources],
    );

    const suggestions = getSuggestions({ onlyUsedSuggestions: false });
    const usedSuggestions = getSuggestions({ onlyUsedSuggestions: true });

    const handleSaveFeedback = () => {
        // create the response object in the require format for the feedback endpoint
        const response = cloneDeep(nerRawResponse);
        for (const type of Object.keys(nerRawResponse)) {
            const concepts = nerRawResponse[type];
            for (const [index, concept] of concepts.entries()) {
                for (const [index2, entity] of concept.entities.entries()) {
                    const propertyId = Object.keys(nerProperties).find(_propertyId => nerProperties[_propertyId].concept === concept.concept);
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

        try {
            saveFeedback({
                request: {
                    title,
                    abstract,
                },
                response,
                serviceName: 'CS_NER',
            });
        } catch (e) {
            console.log(e);
        }
    };

    return { suggestions, usedSuggestions, handleSaveFeedback };
};

export default useEntityRecognition;
