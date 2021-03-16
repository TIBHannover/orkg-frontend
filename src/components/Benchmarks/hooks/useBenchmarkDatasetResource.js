import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { useParams } from 'react-router-dom';
import { filterObjectOfStatementsByPredicate } from 'utils';
import { PREDICATES } from 'constants/graphSettings';

function useBenchmarkDatasetResource(initialVal = {}) {
    const [data, setData] = useState({ initialVal });
    const { resourceId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResourceData = useCallback(rpId => {
        if (rpId) {
            setIsLoadingData(true);
            // Get the research problem
            getResource(rpId)
                .then(result => {
                    setData({ id: rpId, label: result.label });
                    setIsLoadingData(false);
                    setIsFailedLoadingData(false);
                    document.title = `${result.label} - ORKG`;
                })
                .catch(error => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });

            // Get description, same as of the dataset resource
            //we need to make a check if it has a description perhaps
            getStatementsBySubject({ id: rpId }).then(statements => {
                const description = filterObjectOfStatementsByPredicate(statements, PREDICATES.DESCRIPTION, true);
                //const sameAs = filterObjectOfStatementsByPredicate(statements, PREDICATES.SAME_AS, true);
                setData(data => ({ ...data, description: description?.label }));
            });
        }
    }, []);

    useEffect(() => {
        if (resourceId !== undefined) {
            loadResourceData(resourceId);
        }
    }, [resourceId, loadResourceData]);
    return [data, isLoadingData, isFailedLoadingData, loadResourceData];
}
export default useBenchmarkDatasetResource;
