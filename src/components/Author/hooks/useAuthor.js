import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { getAuthorData } from 'utils';
import { getResource } from 'services/backend/resources';

function useAuthor({ authorId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoading, setIsFailedLoading] = useState(false);

    const [author, setAuthor] = useState(null);

    const loadAuthorData = useCallback(() => {
        setIsLoading(true);
        Promise.all([getResource(authorId), getStatementsBySubject({ id: authorId })])
            .then(([authorResource, authorStatements]) => {
                setAuthor(getAuthorData(authorResource, authorStatements));
                setIsLoading(false);
                setIsFailedLoading(false);
                document.title = `${authorResource.label} - ORKG`;
            })
            .catch(() => {
                setIsLoading(false);
                setIsFailedLoading(true);
            });
    }, [authorId]);

    // reset resources when the authorId has changed
    useEffect(() => {
        loadAuthorData();
    }, [loadAuthorData]);

    return { author, isLoading, isFailedLoading, loadAuthorData };
}

export default useAuthor;
