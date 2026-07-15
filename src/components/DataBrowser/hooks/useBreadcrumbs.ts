import useSWR from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { getThing, thingsUrl } from '@/services/backend/things';
import { Class, Literal, Predicate, Resource } from '@/services/backend/types';

// Navigation extends the path one hop at a time, but the SWR key is the whole
// array — without this cache every step would refetch the entire breadcrumb
// chain instead of just the new tail entity. Cached promises also dedupe
// in-flight requests; the short TTL bounds label staleness after edits.
const THING_CACHE_TTL = 60_000;
const thingCache = new Map<string, { promise: ReturnType<typeof getThing>; at: number }>();
const getThingCached = (id: string) => {
    const hit = thingCache.get(id);
    if (hit && Date.now() - hit.at < THING_CACHE_TTL) return hit.promise;
    // sweep expired entries on write so the cache stays bounded to recently
    // visited ids instead of growing for the tab's lifetime
    thingCache.forEach((entry, key) => {
        if (Date.now() - entry.at >= THING_CACHE_TTL) thingCache.delete(key);
    });
    const promise = getThing(id).catch((error) => {
        thingCache.delete(id);
        throw error;
    });
    thingCache.set(id, { promise, at: Date.now() });
    return promise;
};

const useBreadcrumbs = () => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { history } = useHistory();
    const { config } = useDataBrowserState();
    let historyEntities: (Resource | Class | Predicate | Literal | undefined)[] = [];

    const { data: _historyEntities, isLoading } = useSWR(
        !isUsingSnapshot && history && history.length > 1 ? [history, thingsUrl, 'getThing'] : null,
        ([params]) => Promise.all(params.map((id) => getThingCached(id))),
    );

    if (!isUsingSnapshot && _historyEntities) {
        historyEntities = _historyEntities;
    }
    if (isUsingSnapshot && config.statementsSnapshot && history && history.length > 0) {
        const getEntityFromSnapshot = (id: string) => {
            let entity: Resource | Predicate | Literal | Class | undefined = config.statementsSnapshot?.find(
                (statement) => statement.subject.id === id,
            )?.subject;
            if (!entity) {
                entity = config.statementsSnapshot?.find((statement) => statement.object.id === id)?.object;
            }
            return entity;
        };

        historyEntities = history
            .map((id, index) =>
                index % 2 === 0
                    ? getEntityFromSnapshot(id)
                    : config.statementsSnapshot?.find((statement) => statement.predicate.id === id)?.predicate,
            )
            .filter((entity) => entity !== undefined);
    }

    return { historyEntities, isLoading };
};
export default useBreadcrumbs;
