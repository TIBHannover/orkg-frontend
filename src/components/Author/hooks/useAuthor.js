import { useState, useEffect, useCallback } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { getAuthorData } from 'utils';
import { getResource } from 'services/backend/resources';
import { searchAuthorOnWikidata } from 'services/wikidata';

function useAuthor({ authorId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFailedLoading, setIsFailedLoading] = useState(false);

    const [author, setAuthor] = useState(null);

    const loadAuthorData = useCallback(() => {
        setIsLoading(true);
        Promise.all([getResource(authorId), getStatementsBySubject({ id: authorId })])
            .then(async ([authorResource, authorStatements]) => {
                const authorInfo = getAuthorData(authorResource, authorStatements);
                if (authorInfo.orcid) {
                        await searchAuthorOnWikidata(authorInfo.orcid.label).then(response => {
                            if (response.results.bindings.length > 0) {
                                authorInfo.dblp = response.results.bindings[0].dblpId.value;
                            }
                        });
                }
                setAuthor(authorInfo);
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
