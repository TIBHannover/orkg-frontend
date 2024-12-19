import { useEffect } from 'react';
import { getResource, resourcesUrl } from 'services/backend/resources';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { Resource } from 'services/backend/types';
import { searchAuthorOnWikidataByORCID, wikidataUrl } from 'services/wikidata';
import useSWR from 'swr';
import { getAuthorData } from 'utils';

const useAuthor = ({ authorId }: { authorId: string }) => {
    const {
        data: authorResource,
        isLoading,
        error,
        mutate,
    } = useSWR(authorId ? [authorId, resourcesUrl, 'getResource'] : null, ([params]) => getResource(params));

    const { data: statements, mutate: mutateStatements } = useSWR(
        authorId ? [{ subjectId: authorId }, statementsUrl, 'getStatements'] : null,
        ([params]) => getStatements(params),
    );

    const authorInfo = getAuthorData(authorResource ?? {}, statements ?? []) as Resource & {
        dblp: string;
        orcid: Resource;
        website: Resource;
        linkedIn: Resource;
        researchGate: Resource;
        googleScholar: Resource;
    };

    const { data: wikiDataResponse } = useSWR(
        authorInfo?.orcid?.label ? [authorInfo.orcid.label, wikidataUrl, 'searchAuthorOnWikidataByORCID'] : null,
        ([params]) => searchAuthorOnWikidataByORCID(params),
    );

    // @ts-expect-error API typing missing
    if (wikiDataResponse?.results?.bindings.length > 0) {
        // @ts-expect-error API typing missing
        authorInfo.dblp = wikiDataResponse?.results?.bindings[0]?.dblpId?.value;
    }

    useEffect(() => {
        document.title = `${authorResource?.label} - ORKG`;
    }, [authorResource]);

    return {
        author: authorInfo,
        isLoading,
        isFailedLoading: !!error,
        loadAuthorData: () => {
            mutate();
            mutateStatements();
        },
    };
};

export default useAuthor;
