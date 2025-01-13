import { uniqBy } from 'lodash';
import { useSelector } from 'react-redux';
import { getPapers, papersUrl } from 'services/backend/papers';
import { SortDirectionOptions } from 'services/backend/types';
import { RootStore } from 'slices/types';
import useSWR from 'swr';

const usePreviouslySelectedResearchField = () => {
    const user = useSelector((state: RootStore) => state.auth.user);
    const userId = user ? user.id : undefined;

    const { data: papers, isLoading } = useSWR(
        userId
            ? [
                  {
                      page: 0,
                      size: 8,
                      sortBy: [{ property: 'created_at', direction: 'desc' as SortDirectionOptions }],
                      created_by: userId,
                  },
                  papersUrl,
                  'getPapers',
              ]
            : null,
        ([params]) => getPapers(params),
    );

    const researchFields =
        uniqBy(
            papers?.content.map((paper) => paper.research_fields?.[0]),
            'id',
        ) ?? [];

    return { isLoading, researchFields };
};

export default usePreviouslySelectedResearchField;
