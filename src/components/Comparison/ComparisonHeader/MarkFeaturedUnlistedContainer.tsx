import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FC } from 'react';

import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';

type MarkFeaturedUnlistedContainerProps = {
    id: string;
    featured: boolean;
    unlisted: boolean;
    size: SizeProp;
};
const MarkFeaturedUnlistedContainer: FC<MarkFeaturedUnlistedContainerProps> = ({ id, unlisted, featured, size = 'xs' }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted,
        featured,
    });
    return (
        <>
            <MarkFeatured size={size} featured={isFeatured} handleChangeStatus={handleChangeStatus} />
            <div className="d-inline-block ms-1">
                <MarkUnlisted size={size} unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
            </div>
        </>
    );
};

export default MarkFeaturedUnlistedContainer;
