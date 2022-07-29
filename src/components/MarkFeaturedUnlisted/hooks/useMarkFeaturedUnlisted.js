import { useState, useEffect } from 'react';
import { markAsFeatured, removeFeaturedFlag, markAsUnlisted, removeUnlistedFlag } from 'services/backend/resources';
import { useSelector } from 'react-redux';

function useMarkFeaturedUnlisted({ resourceId, unlisted, featured }) {
    const [isFeatured, setIsFeatured] = useState(featured);
    const [isUnlisted, setIsUnlisted] = useState(unlisted);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const handleChangeStatus = flagName => {
        if (isCurationAllowed) {
            if (flagName === 'featured') {
                setIsFeatured(v => !v);
                if (!isFeatured) {
                    markAsFeatured(resourceId).catch(e => console.log(e));
                    isUnlisted && setIsUnlisted(false);
                } else {
                    removeFeaturedFlag(resourceId).catch(e => console.log(e));
                }
            } else {
                setIsUnlisted(v => !v);
                if (!isUnlisted) {
                    markAsUnlisted(resourceId).catch(e => console.log(e));
                    isFeatured && setIsFeatured(false);
                } else {
                    removeUnlistedFlag(resourceId).catch(e => console.log(e));
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
}
export default useMarkFeaturedUnlisted;
