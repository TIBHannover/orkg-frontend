import useParams from 'components/useParams/useParams';
import { PREDICATES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { getFieldChildren } from 'services/backend/researchFields';
import { getResource } from 'services/backend/resources';
import { getStatements } from 'services/backend/statements';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';

function useResearchField(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
    const [subResearchFields, setSubResearchFields] = useState([]);
    const { researchFieldId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchFieldData = useCallback((rfId) => {
        if (rfId) {
            setIsLoadingData(true);
            // Get the research field
            getResource(rfId)
                .then((result) => {
                    setData({ ...result });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch((error) => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            // Get description and same as
            getStatements({ subjectId: rfId }).then((statements) => {
                const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
                const sameAs = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.SAME_AS, true);
                setData((data) => ({ ...data, description: description?.label, sameAs }));
            });

            getFieldChildren({ fieldId: rfId }).then((result) => {
                if (result.length > 0) {
                    setSubResearchFields(result.map((item) => item.resource));
                } else {
                    setSubResearchFields([]);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (researchFieldId !== undefined) {
            loadResearchFieldData(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldData]);
    return [data, subResearchFields, isLoadingData, isFailedLoadingData, loadResearchFieldData];
}
export default useResearchField;
