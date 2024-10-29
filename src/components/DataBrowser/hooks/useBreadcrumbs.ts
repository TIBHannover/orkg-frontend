import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useHistory from 'components/DataBrowser/hooks/useHistory';
import useSnapshotStatement from 'components/DataBrowser/hooks/useSnapshotStatement';
import { getEntity } from 'services/backend/entities';
import { getPredicate } from 'services/backend/predicates';
import { resourcesUrl } from 'services/backend/resources';
import { Class, Literal, Predicate, Resource } from 'services/backend/types';
import useSWR from 'swr';

const useBreadcrumbs = () => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { history, setHistory } = useHistory();
    const { config } = useDataBrowserState();
    let historyEntities: (Resource | Class | Predicate | Literal | undefined)[] = [];

    const { data: _historyEntities, isLoading } = useSWR(
        !isUsingSnapshot && history && history.length > 0 ? [history, resourcesUrl, 'getResource'] : null,
        ([params]) => Promise.all(params.map((id, index) => (index % 2 === 0 ? getEntity(id) : getPredicate(id)))),
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

    const handleBackClick = () => {
        setHistory([...history.slice(0, history.length - 2)]);
    };

    const selectResource = (resourceId: string) => {
        const selectIndex = history.indexOf(resourceId);
        setHistory([...history.slice(0, selectIndex + 1)]);
    };

    return { historyEntities, isLoading, handleBackClick, selectResource };
};
export default useBreadcrumbs;
