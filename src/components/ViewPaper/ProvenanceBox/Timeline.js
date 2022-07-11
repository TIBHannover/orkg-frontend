import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';
import env from '@beam-australia/react-env';
import { StyledActivity } from './styled';

const Timeline = ({ versions, paperResource, isLoadingContributors }) => (
    <div>
        <div className="pt-3 pb-3 ps-3 pe-3">
            {!isLoadingContributors &&
                versions?.length > 0 &&
                versions.map((version, index) => (
                    <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                        <div className="time">{moment(version.created_at).format('DD MMM YYYY')}</div>
                        <div>
                            {paperResource.created_by && version.created_by === paperResource.created_by && (
                                <>
                                    Added by{' '}
                                    <Link
                                        to={reverse(ROUTES.USER_PROFILE, {
                                            userId: version.created_by,
                                        })}
                                    >
                                        <b>{version.created_by.display_name}</b>
                                    </Link>
                                </>
                            )}

                            {paperResource.created_by && version.publishedResource && (
                                <>
                                    Published by{' '}
                                    {version.created_by !== MISC.UNKNOWN_ID ? (
                                        <>
                                            <Link
                                                to={reverse(ROUTES.USER_PROFILE, {
                                                    userId: version.created_by,
                                                })}
                                            >
                                                <b>{version.created_by.display_name}</b>
                                            </Link>
                                            <br />
                                            <small>
                                                DOI:{' '}
                                                <a href={`https://doi.org/${version.publishedResource.id}`} target="_blank" rel="noopener noreferrer">
                                                    https://doi.org/${env('DATACITE_DOI_PREFIX')}/${version.publishedResource.id}
                                                </a>
                                            </small>
                                        </>
                                    ) : (
                                        <b>{version.created_by.display_name}</b>
                                    )}
                                </>
                            )}

                            {paperResource.created_by && version.created_by !== paperResource.created_by && !version.publishedResource && (
                                <>
                                    Updated by{' '}
                                    {version.created_by !== MISC.UNKNOWN_ID ? (
                                        <Link
                                            to={reverse(ROUTES.USER_PROFILE, {
                                                userId: version.created_by,
                                            })}
                                        >
                                            <b>{version.created_by.display_name}</b>
                                        </Link>
                                    ) : (
                                        <b>{version.created_by.display_name}</b>
                                    )}
                                </>
                            )}
                        </div>
                    </StyledActivity>
                ))}
            {!isLoadingContributors && versions?.length === 0 && 'No contributors'}
            {isLoadingContributors && 'Loading ...'}
        </div>
    </div>
);

Timeline.propTypes = {
    versions: PropTypes.array,
    paperResource: PropTypes.object,
    isLoadingContributors: PropTypes.bool,
};

export default Timeline;
