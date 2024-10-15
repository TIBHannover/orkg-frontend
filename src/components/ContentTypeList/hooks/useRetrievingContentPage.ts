import { useSearchParams } from 'next/navigation';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { find, flatten } from 'lodash';
import { getStatementsBySubjects, statementsUrl } from 'services/backend/statements';
import { Resource, Statement } from 'services/backend/types';
import useSWR from 'swr';
import { addAuthorsToStatementBundle, getDataBasedOnType, groupVersionsOfComparisons, mergeAlternate } from 'utils';

function useRetrievingContentPage({ content }: { content: Resource[] }) {
    const searchParams = useSearchParams();

    const { data: statements, isLoading } = useSWR(
        content && content.length
            ? [
                  {
                      ids: content.map((p) => p.id),
                  },
                  statementsUrl,
                  'getStatementsBySubjects',
              ]
            : null,
        ([params]) => getStatementsBySubjects(params),
    );

    const { data: statementsWithAuthors, isLoading: isLoadingAuthors } = useSWR([statements, 'addAuthorsToStatementBundle'], ([params]) =>
        addAuthorsToStatementBundle(params),
    );

    const dataObjects = statementsWithAuthors?.map((node: { id: string; statements: Statement[] }) => {
        const resourceSubject: Resource | undefined = find(content, {
            id: node.id,
        });
        if (resourceSubject) {
            return getDataBasedOnType(resourceSubject, node.statements);
        }
        return undefined;
    });

    let items: Resource[] = [];

    if (dataObjects) {
        let newItems = groupVersionsOfComparisons(dataObjects);
        if (searchParams.get('sort') === VISIBILITY_FILTERS.TOP_RECENT) {
            newItems = mergeAlternate(
                newItems.filter((i) => i.featured),
                newItems.filter((i) => !i.featured),
            );
        }
        items = flatten(newItems);
    }

    return {
        items,
        isLoading: isLoading || isLoadingAuthors,
    };
}

export default useRetrievingContentPage;
