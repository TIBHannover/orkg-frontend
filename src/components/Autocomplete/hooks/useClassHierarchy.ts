import useSWR from 'swr';

import { classesUrl, getChildrenByID } from '@/services/backend/classes';

const useClassHierarchy = ({ id }: { id: string }) => {
    const {
        data: children,
        error: childrenError,
        isLoading: childrenIsLoading,
        mutate: childrenMutate,
    } = useSWR(id ? [{ id }, classesUrl, 'getChildrenByID'] : null, ([params]) => getChildrenByID(params));

    const hasChildren = children?.page?.totalElements;
    return { children, childrenError, childrenIsLoading, childrenMutate, hasChildren };
};
export default useClassHierarchy;
