import { useState, useEffect, useCallback } from 'react';
import { getResource } from 'services/backend/resources';
import { getParentResearchFields, getStatementsBySubjectAndPredicate, getStatementsBySubject } from 'services/backend/statements';
import { getResearchFieldsStats } from 'services/backend/stats';
import { filterObjectOfStatementsByPredicate } from 'utils';
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

            // Get description, same as and sub-problems of the research problem
            getStatementsBySubject({ id: rfId }).then(statements => {
                const description = filterObjectOfStatementsByPredicate(statements, PREDICATES.DESCRIPTION, true);
                const sameAs = filterObjectOfStatementsByPredicate(statements, PREDICATES.SAME_AS, true);
                const subProblems = filterObjectOfStatementsByPredicate(statements, PREDICATES.SUB_PROBLEM, false);
                setData(data => ({ ...data, description: description?.label, sameAs: sameAs, subProblems: subProblems ?? [] }));
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
