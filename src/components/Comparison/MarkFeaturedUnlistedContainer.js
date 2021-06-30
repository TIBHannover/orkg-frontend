import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import PropTypes from 'prop-types';

const MarkFeaturedUnlistedContainer = props => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.id,
        unlisted: props.unlisted,
        featured: props.featured
    });
    return (
        <>
            <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
            <div className="d-inline-block ml-1">
                <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
            </div>
        </>
    );
};

MarkFeaturedUnlistedContainer.propTypes = {
    id: PropTypes.string.isRequired,
    featured: PropTypes.bool,
    unlisted: PropTypes.bool
};

export default MarkFeaturedUnlistedContainer;
