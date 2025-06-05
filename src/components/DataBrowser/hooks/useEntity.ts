import { isEqual, uniqWith } from 'lodash';
import useSWR, { mutate } from 'swr';

import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { getResourceFromStatementsById, getStatementsBySubjectId } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { CLASSES } from '@/constants/graphSettings';
import { resourcesUrl } from '@/services/backend/resources';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { getThing, thingsUrl } from '@/services/backend/things';
import { Class, Literal, Predicate, Resource, Statement } from '@/services/backend/types';

const useEntity = () => {
    const { currentId } = useHistory();
    const { config } = useDataBrowserState();
    const { isUsingSnapshot } = useSnapshotStatement();

    let _entity: Predicate | Resource | Class | Literal | undefined;
    if (isUsingSnapshot && config.statementsSnapshot) {
        _entity = getResourceFromStatementsById(currentId, config.statementsSnapshot);
    }
    const {
        data: entity,
        isLoading: isLoadingEntity,
        error,
        mutate: mutateThing,
        isValidating: isValidatingEntity,
    } = useSWR(!isUsingSnapshot ? [currentId, thingsUrl, 'getThing'] : null, ([params]) => getThing(params));

    const mutateEntity = () => {
        mutateThing();
        mutate([currentId, resourcesUrl, 'getResource']); // not needed for the data browser, but ensure the cache is updated for other components
    };
    if (!isUsingSnapshot) {
        _entity = entity;
    }

    const isList = _entity && 'classes' in _entity && _entity.classes.includes(CLASSES.LIST);

    let _statements;

    if (isUsingSnapshot && config.statementsSnapshot) {
        _statements = uniqWith(getStatementsBySubjectId(currentId, config.statementsSnapshot), isEqual);
    }

    const {
        data: statements,
        isLoading: isLoadingStatements,
        mutate: mutateStatements,
        isValidating: isValidatingStatements,
    } = useSWR(
        !isUsingSnapshot
            ? [
                  {
                      subjectId: currentId,
                      returnContent: true,
                      returnFormattedLabels: true,
                      ...(isList && { sortBy: [{ property: 'index', direction: 'asc' as const }] }),
                  },
                  statementsUrl,
                  'getStatements',
              ]
            : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
    );

    if (!isUsingSnapshot) {
        _statements = statements;
    }

    return {
        isValidating: isValidatingStatements || isValidatingEntity,
        isLoadingStatements,
        isLoadingEntity,
        error,
        entity: _entity,
        statements: _statements,
        mutateEntity,
        mutateStatements,
    };
};

export default useEntity;
