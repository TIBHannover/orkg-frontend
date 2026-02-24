import { groupBy, sortBy, uniqBy } from 'lodash';
import useSWR from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import { getPredicate, predicatesUrl } from '@/services/backend/predicates';
import { Statement } from '@/services/backend/types';

/**
 * Hook for handling comparison related logic for the data browser:
 * - Order predicates based on ordering in comparison (via selected_paths)
 * - Show invisible predicates, i.e. properties that are not displayed in the comparison
 * - Show predicate that are not part of any statements but are part of the displayed properties in the comparison
 */
const useComparisonRecommendations = ({ statements }: { statements?: Statement[] }) => {
    const { config } = useDataBrowserState();
    const { history } = useHistory();
    const { comparisonSelectedPaths } = config;
    const getUnevenElements = (arr: string[]) => arr.filter((_, idx) => idx % 2 !== 0);
    const selectedDataBrowserPaths = getUnevenElements(history);

    const visibleProperties = comparisonSelectedPaths
        ? comparisonSelectedPaths
              ?.filter((sub) => selectedDataBrowserPaths?.every((val, idx) => sub[idx] === val)) // ensure the current path matches the selected path in the data browser
              .map((sub) => sub.slice(selectedDataBrowserPaths?.length)) // remove the current path from the selected paths
              .filter((path) => path?.length === 1) // only select the items that are currently displayed
              .flat()
        : [];

    const predicates =
        visibleProperties && statements
            ? uniqBy(
                  statements.map((statement) => statement.predicate),
                  'id',
              )
            : [];
    const predicatesToFetch = visibleProperties.filter((predicateId) => !predicates.find((predicate) => predicate.id === predicateId));
    // fetching predicates not strictly necessary, but it ensures that all predicate data is available, can be changed later
    const { data: additionalPredicates } = useSWR(predicatesToFetch ? [predicatesToFetch, predicatesUrl, 'getPredicate'] : null, ([params]) =>
        Promise.all(params.map((id) => getPredicate(id))),
    );

    const predicateGroup = groupBy(statements, 'predicate.id');
    // sort the predicates as they are displayed in the comparison
    const statementsOrdered = sortBy(
        [
            ...Object.keys(predicateGroup).map((predicateId) => ({
                predicate: predicateGroup[predicateId][0].predicate,
                statements: sortBy(predicateGroup[predicateId], 'object.label'),
            })),
            ...(additionalPredicates ?? []).map((predicate) => ({
                predicate,
                statements: [],
            })),
        ],
        visibleProperties && visibleProperties.length > 0
            ? (statement) => {
                  const index = visibleProperties.findIndex((propertyId) => propertyId === statement.predicate.id);
                  return index !== -1 ? index : null;
              }
            : 'predicate.label',
    );

    return { statementsOrdered, visibleProperties };
};

export default useComparisonRecommendations;
