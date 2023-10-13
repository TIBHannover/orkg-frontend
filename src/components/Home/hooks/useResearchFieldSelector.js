import { useState, useEffect } from 'react';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, RESOURCES } from 'constants/graphSettings';
import { useParams } from 'react-router-dom';
import { getResource } from 'services/backend/resources';

function useResearchFieldSelector() {
    const params = useParams();
    const selectedFieldId = params.researchFieldId ?? RESOURCES.RESEARCH_FIELD_MAIN;
    const [selectedFieldLabel, setSelectedFieldLabel] = useState('');
    const [researchFields, setResearchFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!selectedFieldId) {
            return;
        }
        const handleFieldSelect = async () => {
            setIsLoading(true);

            // get field label
            const fieldResource = await getResource(selectedFieldId);
            setSelectedFieldLabel(fieldResource.label);

            // get sub fields
            getStatementsBySubjectAndPredicate({ subjectId: selectedFieldId, predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD })
                .then(res => {
                    // sort research fields alphabetically
                    setResearchFields(res.map(elm => elm.object).sort((a, b) => a.label.localeCompare(b.label)));
                    setIsLoading(false);
                })
                .catch(e => {
                    setIsLoading(false);
                    console.error(e);
                });
        };
        handleFieldSelect();
    }, [selectedFieldId]);

    return { researchFields, selectedFieldId, selectedFieldLabel, isLoadingFields: isLoading };
}

export default useResearchFieldSelector;
