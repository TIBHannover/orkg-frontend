import { StyledActivity } from './styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';
import env from '@beam-australia/react-env';

const Timeline = ({ contributors, paperResource, isLoadingContributors }) => {
    return (
        <div>
            <div className="pt-3 pb-3 ps-3 pe-3">
                {!isLoadingContributors &&
                    contributors?.length > 0 &&
                    contributors.map((contributor, index) => {
                        return (
                            <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                                <div className="time">
                                    {moment(contributor.createdAt ? contributor.createdAt : contributor.created_at).format('DD MMM YYYY')}
                                </div>
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

                                    {paperResource.created_by && contributor.predicate && (
                                        <>
                                            Published by{' '}
                                            {contributor.createdBy !== MISC.UNKNOWN_ID ? (
                                                <>
                                                    <Link
                                                        to={reverse(ROUTES.USER_PROFILE, {
                                                            userId: contributor.createdBy
                                                        })}
                                                    >
                                                        <b>{contributor.created_by.display_name}</b>
                                                    </Link>
                                                    <br />
                                                    <small>
                                                        DOI:{' '}
                                                        <a
                                                            href={`https://doi.org/${env('DATACITE_DOI_PREFIX')}/${contributor.object.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <b>{`${env('DATACITE_DOI_PREFIX')}/${contributor.object.id}`}</b>
                                                        </a>
                                                    </small>
                                                </>
                                            ) : (
                                                <b>{contributor.created_by.display_name}</b>
                                            )}
                                        </>
                                    )}

                                    {paperResource.created_by && contributor.createdBy !== paperResource.created_by && !contributor.predicate && (
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
