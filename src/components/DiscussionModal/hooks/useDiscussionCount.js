import { useEffect, useState, useCallback } from 'react';
import { getDiscussionCountByEntityId } from 'services/backend/discussions';

const useDiscussionCount = (entityId) => {
    const [discussionCount, setDiscussionCount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCount = useCallback(async () => {
        setIsLoading(true);
        setDiscussionCount(await getDiscussionCountByEntityId(entityId));
        setIsLoading(false);
    }, [entityId]);

    useEffect(() => {
        if (!entityId) {
            return;
        }
        getCount();
    }, [entityId, getCount]);

    return { discussionCount, isLoading, getCount };
};

export default useDiscussionCount;
