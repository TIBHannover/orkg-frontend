import { StyledActivity } from './styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';
import env from '@beam-australia/react-env';

const Timeline = ({ versions, paperResource, isLoadingContributors }) => {
    return (
        <div>
            <div className="pt-3 pb-3 ps-3 pe-3">
                {!isLoadingContributors &&
                    versions?.length > 0 &&
                    versions.map((contributor, index) => {
                        return (
                            <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                                <div className="time">{moment(contributor.created_at).format('DD MMM YYYY')}</div>
                                <div>
                                    {paperResource.created_by && contributor.created_by === paperResource.created_by && (
                                        <>
                                            Added by{' '}
                                            <Link
                                                to={reverse(ROUTES.USER_PROFILE, {
                                                    userId: contributor.created_by
                                                })}
                                            >
                                                <b>{contributor.created_by.display_name}</b>
                                            </Link>
                                        </>
                                    )}

                                    {paperResource.created_by && contributor.doi && (
                                        <>
                                            Published by{' '}
                                            {contributor.created_by !== MISC.UNKNOWN_ID ? (
                                                <>
                                                    <Link
                                                        to={reverse(ROUTES.USER_PROFILE, {
                                                            userId: contributor.created_by
                                                        })}
                                                    >
                                                        <b>{contributor.created_by.display_name}</b>
                                                    </Link>
                                                    <br />
                                                    <small>
                                                        DOI:{' '}
                                                        <Link
                                                            to={reverse(ROUTES.VIEW_PAPER, {
                                                                resourceId: contributor.doi.id
                                                            })}
                                                        >
                                                            <b>{`${env('DATACITE_DOI_PREFIX')}/${contributor.doi.id}`}</b>
                                                        </Link>
                                                    </small>
                                                </>
                                            ) : (
                                                <b>{contributor.created_by.display_name}</b>
                                            )}
                                        </>
                                    )}

                                    {paperResource.created_by && contributor.created_by !== paperResource.created_by && !contributor.doi && (
                                        <>
                                            Updated by{' '}
                                            {contributor.created_by !== MISC.UNKNOWN_ID ? (
                                                <Link
                                                    to={reverse(ROUTES.USER_PROFILE, {
                                                        userId: contributor.created_by
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
                {!isLoadingContributors && versions?.length === 0 && 'No contributors'}
                {isLoadingContributors && 'Loading ...'}
            </div>
        </div>
    );
};

Timeline.propTypes = {
    versions: PropTypes.array,
    paperResource: PropTypes.object,
    isLoadingContributors: PropTypes.bool
};

export default Timeline;
