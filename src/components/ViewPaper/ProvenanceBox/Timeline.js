import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';
import { StyledActivity } from './styled';

const Timeline = ({ contributors, paperResource, isLoadingContributors }) => (
    <div>
        <div className="pt-3 pb-3 ps-3 pe-3">
            {!isLoadingContributors &&
                contributors?.length > 0 &&
                contributors.map((contributor, index) => (
                    <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                        <div className="time">{moment(contributor.createdAt).format('DD MMM YYYY')}</div>
                        <div>
                            {paperResource.created_by && contributor.createdBy === paperResource.created_by && (
                                <>
                                    Added by{' '}
                                    <Link
                                        to={reverse(ROUTES.USER_PROFILE, {
                                            userId: contributor.createdBy,
                                        })}
                                    >
                                        <b>{contributor.created_by.display_name}</b>
                                    </Link>
                                </>
                            )}

                            {paperResource.created_by && contributor.createdBy !== paperResource.created_by && (
                                <>
                                    Updated by{' '}
                                    {contributor.createdBy !== MISC.UNKNOWN_ID ? (
                                        <Link
                                            to={reverse(ROUTES.USER_PROFILE, {
                                                userId: contributor.createdBy,
                                            })}
                                        >
                                            <b>{contributor.created_by.display_name}</b>
                                        </Link>
                                    ) : (
                                        <b>{contributor.created_by.display_name}</b>
                                    )}
                                </>
                            )}
                        </div>
                    </StyledActivity>
                ))}
            {!isLoadingContributors && contributors?.length === 0 && 'No contributors'}
            {isLoadingContributors && 'Loading ...'}
        </div>
    </div>
);

Timeline.propTypes = {
    contributors: PropTypes.array,
    paperResource: PropTypes.object,
    isLoadingContributors: PropTypes.bool,
};

export default Timeline;
