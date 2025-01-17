import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { getStatementsBySubjectId } from 'components/DataBrowser/utils/dataBrowserUtils';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useHistory from 'components/DataBrowser/hooks/useHistory';
import useSnapshotStatement from 'components/DataBrowser/hooks/useSnapshotStatement';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { groupBy, uniqWith, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { deleteStatementById, getStatements, statementsUrl } from 'services/backend/statements';
import { Statement } from 'services/backend/types';
import useSWR from 'swr';
import { getList, listsUrl, updateList } from 'services/backend/lists';

const useStatement = (statement: Statement, path: string[], level: number) => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { config, preferences } = useDataBrowserState();
    const { isEditMode } = config;
    const { currentId, history, setHistory } = useHistory();
    const { entity, mutateStatements } = useEntity();

    // if the object is a resource and the classes is not in the collapsedClasses, show the sub-level
    const showSubLevelDefault =
        'classes' in statement.object &&
        !(
            'collapsedClasses' in config &&
            statement.object.classes.some(
                (item) => config.collapsedClasses && config.collapsedClasses.length > 0 && config.collapsedClasses.includes(item),
            )
        );

    const [showSubLevel, setShowSubLevel] = useState(level < 10 && showSubLevelDefault && preferences.expandValuesByDefault);

    const [isEditingValue, setIsEditingValue] = useState(false);

    let objectStatements: Statement[] = [];
    if (isUsingSnapshot && config.statementsSnapshot && statement.object._class !== ENTITIES.LITERAL) {
        // remove duplicate statements: snapshot example id thing_key=R661500
        objectStatements = uniqWith(getStatementsBySubjectId(statement.object.id, config.statementsSnapshot), isEqual);
    }

    const { data: statements, isLoading: isLoadingObjectStatements } = useSWR(
        !isEditMode && !isUsingSnapshot && statement.object._class !== ENTITIES.LITERAL
            ? [{ subjectId: statement.object.id, returnContent: true, returnFormattedLabels: true }, statementsUrl, 'getStatements']
            : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
        { revalidateIfStale: true, revalidateOnFocus: true },
    );
    if (!isUsingSnapshot && statements) {
        objectStatements = statements;
    }

    const _objectStatements = groupBy(objectStatements, 'predicate.label');

    // support for lists
    const isList = entity && 'classes' in entity && entity.classes.includes(CLASSES.LIST) && statement.predicate.id === PREDICATES.HAS_LIST_ELEMENT;
    const { data: originalOrder, mutate: mutateList } = useSWR(isList ? [entity?.id, listsUrl, 'getList'] : null, ([_params]) => getList(_params));

    const deleteStatement = async () => {
        if (isList) {
            await updateList({
                id: entity?.id,
                elements: [...(originalOrder?.elements.filter((c) => c !== statement.object.id) ?? [])],
            });
            mutateList();
        } else {
            await deleteStatementById(statement.id);
        }
        mutateStatements();
    };

    const handleOnClick = () => {
        const indexCurrentId = history.indexOf(currentId);
        setHistory([...(indexCurrentId > -1 ? history.slice(0, indexCurrentId) : []), ...path, statement.predicate.id, statement.object.id]);
    };

    useEffect(() => {
        setShowSubLevel(level < 10 && showSubLevelDefault && preferences.expandValuesByDefault);
    }, [preferences.expandValuesByDefault, showSubLevelDefault, level]);

    return {
        showSubLevel,
        setShowSubLevel,
        objectStatements: _objectStatements,
        deleteStatement,
        handleOnClick,
        isEditingValue,
        setIsEditingValue,
        isLoadingObjectStatements,
    };
};
export default useStatement;
