import { useState, useEffect, useCallback } from 'react';
import { getResource, getStatementsBySubject, getStatementsByObjectAndPredicate } from 'network';
import { useParams } from 'react-router-dom';
import { filterObjectOfStatementsByPredicate } from 'utils';

function useResearchProblem(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
    const { researchProblemId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchProblemData = useCallback(rpId => {
        if (rpId) {
            setIsLoadingData(true);
            // Get the research problem
            getResource(rpId)
                .then(result => {
                    setData({ id: rpId, label: result.label, superProblems: [], subProblems: [] });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            // Get description, same as and sub-problems of the research problem
            getStatementsBySubject({ id: rpId }).then(statements => {
                const description = filterObjectOfStatementsByPredicate(statements, process.env.REACT_APP_PREDICATES_DESCRIPTION, true);
                const sameAs = filterObjectOfStatementsByPredicate(statements, process.env.REACT_APP_PREDICATES_SAME_AS, true);
                const subProblems = filterObjectOfStatementsByPredicate(statements, process.env.REACT_APP_PREDICATES_SUB_PROBLEM, false);
                setData(data => ({ ...data, description: description?.label, sameAs: sameAs, subProblems: subProblems ?? [] }));
            });

            // Get super research problems
            getStatementsByObjectAndPredicate({
                objectId: rpId,
                predicateId: process.env.REACT_APP_PREDICATES_SUB_PROBLEM
            }).then(superProblems => {
                setData(data => ({ ...data, superProblems: superProblems.map(s => s.subject) }));
            });
        }
    }, []);

    useEffect(() => {
        if (researchProblemId !== undefined) {
            loadResearchProblemData(researchProblemId);
        }
    }, [researchProblemId, loadResearchProblemData]);
    return [data, isLoadingData, isFailedLoadingData, loadResearchProblemData];
}
export default useResearchProblem;
