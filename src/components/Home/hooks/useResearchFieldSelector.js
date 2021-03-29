import { useState, useEffect } from 'react';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';

function useResearchFieldSelector({ id, label }) {
    const [selectedResearchField, setSelectedResearchField] = useState({ id, label });
    const [researchFields, setResearchFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleFieldSelect = selected => {
        setIsLoading(true);
        setSelectedResearchField({ ...selected, label: selected.value ? selected.value : selected.label });
        getStatementsBySubjectAndPredicate({ subjectId: selected.id, predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD })
            .then(res => {
                // sort research fields alphabetically
                setResearchFields(
                    res
                        .map(elm => elm.object)
                        .sort((a, b) => {
                            return a.label.localeCompare(b.label);
                        })
                );
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        handleFieldSelect({ id, label });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { selectedResearchField, handleFieldSelect, researchFields, isLoadingFields: isLoading };
}

export default useResearchFieldSelector;
