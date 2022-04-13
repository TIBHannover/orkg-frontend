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
            <MarkFeatured size={props.size} featured={isFeatured} handleChangeStatus={handleChangeStatus} />
            <div className="d-inline-block ms-1">
                <MarkUnlisted size={props.size} unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
            </div>
        </>
    );
};

MarkFeaturedUnlistedContainer.propTypes = {
    id: PropTypes.string.isRequired,
    featured: PropTypes.bool,
    unlisted: PropTypes.bool,
    size: PropTypes.string
};

MarkFeaturedUnlistedContainer.defaultProps = {
    size: 'xs'
};

export default MarkFeaturedUnlistedContainer;
