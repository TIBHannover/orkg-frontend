import { useState, useEffect, useCallback } from 'react';
import { getResource } from 'services/backend/resources';
import { getParentResearchFields, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResearchFieldsStats } from 'services/backend/stats';
import { orderBy } from 'lodash';
import { useParams } from 'react-router-dom';
import { PREDICATES } from 'constants/graphSettings';

function useResearchField(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
    const [parentResearchFields, setParentResearchFields] = useState([]);
    const [subResearchFields, setSubResearchFields] = useState([]);
    const { researchFieldId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchFieldData = useCallback(rfId => {
        if (rfId) {
            setIsLoadingData(true);
            // Get the research field
            getResource(rfId)
                .then(result => {
                    setData({ id: rfId, label: result.label });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            getParentResearchFields(rfId).then(result => {
                setParentResearchFields(result.reverse());
            });

            getStatementsBySubjectAndPredicate({ subjectId: rfId, predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD }).then(result => {
                if (result.length > 0) {
                    getResearchFieldsStats().then(stats => {
                        const orderedSubRF = orderBy(
                            result.map(s => {
                                return { ...s.object, numPapers: stats[s.object.id] };
                            }),
                            item => item.numPapers,
                            ['desc']
                        );
                        setSubResearchFields(orderedSubRF);
                    });
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
    return [data, parentResearchFields, subResearchFields, isLoadingData, isFailedLoadingData, loadResearchFieldData];
}
export default useResearchField;
