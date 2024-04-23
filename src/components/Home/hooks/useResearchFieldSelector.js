import useParams from 'components/NextJsMigration/useParams';
import { RESOURCES } from 'constants/graphSettings';
import { useEffect, useState } from 'react';
import { getFieldChildren } from 'services/backend/researchFields';
import { getResource } from 'services/backend/resources';
import { getResearchFieldsStatsWithSubfields } from 'services/backend/stats';

function useResearchFieldSelector() {
    const params = useParams();
    const selectedFieldId = params.researchFieldId ?? RESOURCES.RESEARCH_FIELD_MAIN;
    const [selectedFieldLabel, setSelectedFieldLabel] = useState('');
    const [researchFields, setResearchFields] = useState([]);
    const [researchFieldStats, setResearchFieldStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const getFieldStats = async fields => {
        if (!fields) {
            return;
        }
        setIsLoadingStats(true);
        const stats = await Promise.all(fields.map(field => getResearchFieldsStatsWithSubfields(field.id)));
        setResearchFieldStats(stats);
        setIsLoadingStats(false);
    };

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
            getFieldChildren({ fieldId: selectedFieldId })
                .then(async fields => {
                    // sort research fields alphabetically
                    const _fields = fields?.map(field => field.resource).sort((a, b) => a.label.localeCompare(b.label));
                    setResearchFields(_fields);
                    getFieldStats(_fields);
                    setIsLoading(false);
                })
                .catch(e => {
                    setIsLoading(false);
                    console.error(e);
                });
        };

        handleFieldSelect();
    }, [selectedFieldId]);

    return { researchFields, researchFieldStats, selectedFieldId, selectedFieldLabel, isLoadingFields: isLoading, isLoadingStats };
}

export default useResearchFieldSelector;
