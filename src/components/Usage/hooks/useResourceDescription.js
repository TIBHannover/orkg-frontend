import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { getAuthorData } from 'utils';
import { getResource } from 'services/backend/resources';

function useResourceDescription({ id }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoading, setIsFailedLoading] = useState(false);

    const [resource, setResource] = useState(null);

    const loadResourceData = useCallback(() => {
        setIsLoading(true);
        Promise.all([getResource(id), getStatementsBySubject({ id })])
            .then(([resourceObject, resourceStatements]) => {
                setResource(getAuthorData(resourceObject, resourceStatements));
                setIsLoading(false);
                setIsFailedLoading(false);
                document.title = `${resourceObject.label} - ORKG`;
            })
            .catch(() => {
                setIsLoading(false);
                setIsFailedLoading(true);
            });
    }, [id]);

    // reset resources when the id has changed
    useEffect(() => {
        loadResourceData();
    }, [loadResourceData]);

    return { resource, isLoading, isFailedLoading, loadResourceData };
}

export default useResourceDescription;
