import { StyledActivity } from './styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';

const Timeline = ({ contributors, paperResource, isLoadingContributors }) => {
    return (
        <div>
            <div className="pt-3 pb-3 pl-3 pr-3">
                {!isLoadingContributors &&
                    contributors?.length > 0 &&
                    contributors.map((contributor, index) => {
                        return (
                            <StyledActivity key={`prov-${index}`} className="pl-3 pb-3">
                                <div className="time">{moment(contributor.createdAt).format('DD MMM YYYY')}</div>
                                <div>
                                    {paperResource.created_by && contributor.createdBy === paperResource.created_by && (
                                        <>
                                            Added by{' '}
                                            <Link
                                                to={reverse(ROUTES.USER_PROFILE, {
                                                    userId: contributor.createdBy
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
                                                        userId: contributor.createdBy
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
                        );
                    })}
                {!isLoadingContributors && contributors?.length === 0 && 'No contributors'}
                {isLoadingContributors && 'Loading ...'}
            </div>
        </div>
    );
};

Timeline.propTypes = {
    contributors: PropTypes.array,
    paperResource: PropTypes.object,
    isLoadingContributors: PropTypes.bool
};

export default Timeline;
