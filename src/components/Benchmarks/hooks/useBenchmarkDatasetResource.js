import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { PREDICATES } from 'constants/graphSettings';

function useBenchmarkDatasetResource({ datasetId = null, problemId = null }) {
    const [data, setData] = useState(null);
    const [problemData, setProblemData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResourceData = useCallback(() => {
        if (datasetId && problemId) {
            setIsLoadingData(true);
            // Get the research problem

            Promise.all([getResource(datasetId), getResource(problemId)])
                .then(([datasetResult, problemResult]) => {
                    setData(datasetResult);
                    setProblemData(problemResult);
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${problemResult.label} on ${datasetResult.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            // Get description, same as of the dataset resource
            //we need to make a check if it has a description perhaps
            getStatementsBySubject({ id: datasetId }).then(statements => {
                const description = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.DESCRIPTION, true);
                //const sameAs = filterObjectOfStatementsByPredicate(statements, PREDICATES.SAME_AS, true);
                setData(data => ({ ...data, description: description?.label }));
            });
        }
    }, [datasetId, problemId]);

    useEffect(() => {
        setData(null);
        setProblemData(null);
        setIsLoadingData(true);
        setIsFailedLoadingData(true);
        loadResourceData();
    }, [loadResourceData]);
    return [data, problemData, isLoadingData, isFailedLoadingData, loadResourceData];
}
export default useBenchmarkDatasetResource;
