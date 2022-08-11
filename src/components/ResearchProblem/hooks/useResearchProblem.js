import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

function useResearchProblem({ id }) {
    const [data, setData] = useState({});
    const [superProblems, setSuperProblems] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchProblemData = useCallback(rpId => {
        if (rpId) {
            setIsLoadingData(true);
            // Get the research problem
            getResource(rpId)
                .then(result => {
                    setData({ ...result, superProblems: [], subProblems: [] });
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
                const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
                const sameAs = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.SAME_AS, true);
                const subProblems = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.SUB_PROBLEM, false, CLASSES.PROBLEM);
                setData(prevData => ({ ...prevData, description: description?.label, sameAs, subProblems: subProblems ?? [] }));
            });

            // Get super research problems
            getStatementsByObjectAndPredicate({
                objectId: rpId,
                predicateId: PREDICATES.SUB_PROBLEM,
            }).then(superProblems => {
                setSuperProblems(superProblems.map(s => s.subject));
            });
        }
    }, []);

    useEffect(() => {
        if (id !== undefined) {
            loadResearchProblemData(id);
        }
    }, [id, loadResearchProblemData]);
    return { researchProblemData: data, superProblems, isLoading: isLoadingData, isFailedLoading: isFailedLoadingData, loadResearchProblemData };
}
export default useResearchProblem;
