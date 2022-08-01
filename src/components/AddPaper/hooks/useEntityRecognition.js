import useInsertData from 'components/AddPaper/hooks/useInsertData';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { saveFeedback } from 'services/annotation';

const useEntityRecognition = () => {
    const { nerResources, nerProperties } = useSelector(state => state.addPaper);
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
        for (const predicateId of Object.keys(nerResources)) {
            for (const resource of nerResources[predicateId]) {
                const isExistingStatement = getExistingStatement({
                    object: {
                        label: resource.label,
                    },
                    property: {
                        label: nerProperties?.[predicateId]?.label,
                    },
                });
                try {
                    saveFeedback({
                        request: {
                            entityLabel: resource.label,
                            concept: nerProperties?.[predicateId]?.label,
                        },
                        response: {
                            used: !!isExistingStatement,
                        },
                        serviceName: 'CS_NER',
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    return { suggestions, usedSuggestions, handleSaveFeedback };
};

export default useEntityRecognition;
