import { intersection, uniq } from 'lodash';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import useSWR from 'swr';

import { getThing, thingsUrl } from '@/services/backend/things';

const emptyArray: string[] = [];
const useEntities = () => {
    const [entityIds, setEntityIds] = useQueryState('entityIds', parseAsArrayOf(parseAsString).withDefault(emptyArray));

    const key = entityIds && entityIds?.length > 0 ? ([entityIds, thingsUrl, 'getThings'] as const) : null;

    const { data: entities, isLoading, mutate } = useSWR(key, ([params]) => Promise.all(params?.map((id) => getThing(id)) ?? []));

    const allClassesIds = entities?.filter((entity) => 'classes' in entity).map((entity) => entity.classes) ?? [];
    const commonClasses = uniq(intersection(...allClassesIds));

    return { entities, isLoading, mutate, entityIds, setEntityIds, key, commonClasses };
};

export default useEntities;
