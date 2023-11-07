import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import PropTypes from 'prop-types';

const MarkFeaturedUnlistedContainer = ({ id, unlisted, featured, size = 'xs' }) => {
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

MarkFeaturedUnlistedContainer.propTypes = {
    id: PropTypes.string.isRequired,
    featured: PropTypes.bool,
    unlisted: PropTypes.bool,
    size: PropTypes.string,
};

export default MarkFeaturedUnlistedContainer;
