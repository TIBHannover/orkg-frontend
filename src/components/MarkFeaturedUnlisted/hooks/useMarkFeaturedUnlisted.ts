import { useEffect, useState } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import { VISIBILITY } from '@/constants/contentTypes';
import { updateResource } from '@/services/backend/resources';
import { Visibility } from '@/services/backend/types';

type MarkFeaturedUnlistedProps = {
    resourceId: string;
    unlisted: boolean;
    featured: boolean;
};

const useMarkFeaturedUnlisted = ({ resourceId, unlisted, featured }: MarkFeaturedUnlistedProps) => {
    const [isFeatured, setIsFeatured] = useState(featured);
    const [isUnlisted, setIsUnlisted] = useState(unlisted);
    const { isCurationAllowed } = useAuthentication();

    const handleChangeStatus = (flagName: Visibility) => {
        if (isCurationAllowed) {
            if (flagName === VISIBILITY.FEATURED) {
                setIsFeatured((v) => !v);
                if (!isFeatured) {
                    updateResource(resourceId, { visibility: VISIBILITY.FEATURED });
                    if (isUnlisted) {
                        setIsUnlisted(false);
                    }
                } else {
                    updateResource(resourceId, { visibility: VISIBILITY.DEFAULT });
                }
            } else {
                setIsUnlisted((v) => !v);
                if (!isUnlisted) {
                    updateResource(resourceId, { visibility: VISIBILITY.UNLISTED });
                    if (isFeatured) {
                        setIsFeatured(false);
                    }
                } else {
                    updateResource(resourceId, { visibility: VISIBILITY.DEFAULT });
                }
            }
        }
    };

    useEffect(() => {
        setIsFeatured(featured);
        setIsUnlisted(unlisted);
    }, [featured, unlisted]);

    return {
        isFeatured,
        isUnlisted,
        handleChangeStatus,
    };
};
export default useMarkFeaturedUnlisted;
