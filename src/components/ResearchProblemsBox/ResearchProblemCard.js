import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverseWithSlug } from 'utils';
import PropTypes from 'prop-types';

const ResearchProblemCard = props => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.problem.id,
        unlisted: props.problem.unlisted,
        featured: props.problem.featured
    });

    return (
        <div className="d-flex">
            <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                <div>
                    <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                </div>
                <div>
                    <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                </div>
            </div>
            <div className="flex-grow-1">
                <Link to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: props.problem.id, slug: props.problem.label })}>
                    {props.problem.label}
                </Link>
            </div>
        </div>
    );
};

ResearchProblemCard.propTypes = {
    problem: PropTypes.object.isRequired
};

export default ResearchProblemCard;
