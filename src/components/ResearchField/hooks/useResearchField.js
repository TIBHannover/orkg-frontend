import { useState, useEffect, useCallback } from 'react';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';
import { getResearchFieldsStats } from 'services/backend/stats';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { orderBy } from 'lodash';
import { useParams } from 'react-router-dom';
import { PREDICATES } from 'constants/graphSettings';

function useResearchField(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
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
                    setData({ ...result });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            // Get description and same as
            getStatementsBySubject({ id: rfId }).then(statements => {
                const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
                const sameAs = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.SAME_AS, true);
                setData(data => ({ ...data, description: description?.label, sameAs: sameAs }));
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
    return [data, subResearchFields, isLoadingData, isFailedLoadingData, loadResearchFieldData];
}
export default useResearchField;
