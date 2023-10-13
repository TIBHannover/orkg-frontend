import Link from 'components/NextJsMigration/Link';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import moment from 'moment';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { MISC } from 'constants/graphSettings';
import env from 'components/NextJsMigration/env';
import { StyledActivity } from 'components/ViewPaper/ProvenanceBox/styled';

const Timeline = ({ versions, createdBy, paperResource, isLoadingContributors, hasNextPageContributors, handleLoadMoreContributors }) => (
    <div>
        <small>
            <Alert className="rounded-0 mb-1" color="info">
                The timeline is built based on the creation time of each resource and statement linked to the paper.
            </Alert>
        </small>
        <div className="pt-3 pb-3 ps-3 pe-3">
            {versions?.length > 0 &&
                versions.map((version, index) => (
                    <StyledActivity key={`prov-${index}`} className="ps-3 pb-3">
                        <div className="time">{moment(version.created_at).format('DD MMM YYYY HH:mm')}</div>
                        <div>
                            {paperResource.created_by && (
                                <>
                                    {version.publishedResource && 'Published by '}
                                    {!version.publishedResource &&
                                    !isLoadingContributors &&
                                    !hasNextPageContributors &&
                                    moment(version.created_at).format('DD MMM YYYY HH:mm') ===
                                        moment(paperResource.created_at).format('DD MMM YYYY HH:mm') &&
                                    version.created_by.id === (createdBy?.id ?? MISC.UNKNOWN_ID)
                                        ? 'Added by '
                                        : 'Updated by '}
                                    {version.created_by?.id !== MISC.UNKNOWN_ID ? (
                                        <>
                                            <Link
                                                href={reverse(ROUTES.USER_PROFILE, {
                                                    userId: version.created_by.id,
                                                })}
                                            >
                                                <b>{version.created_by.display_name}</b>
                                            </Link>
                                            {version.publishedResource && (
                                                <>
                                                    <br />
                                                    <small>
                                                        DOI:{' '}
                                                        <a
                                                            href={`https://doi.org/${env('DATACITE_DOI_PREFIX')}/${version.publishedResource.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            https://doi.org/{env('DATACITE_DOI_PREFIX')}/{version.publishedResource.id}
                                                        </a>
                                                    </small>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <b>{version.created_by.display_name}</b>
                                    )}
                                </>
                            )}
                        </div>
                    </StyledActivity>
                ))}
            {!isLoadingContributors && hasNextPageContributors && (
                <StyledActivity className="ps-3 pb-3">
                    <div className="time">
                        <Button color="light-darker" size="sm" onClick={!isLoadingContributors ? handleLoadMoreContributors : undefined}>
                            Load more
                        </Button>
                    </div>
                </StyledActivity>
            )}

            {!isLoadingContributors && hasNextPageContributors && (
                <StyledActivity className="ps-3 pb-3">
                    <div className="time">{moment(paperResource.created_at).format('DD MMM YYYY HH:mm')}</div>
                    <>
                        Added by{' '}
                        {createdBy ? (
                            <Link
                                href={reverse(ROUTES.USER_PROFILE, {
                                    userId: createdBy.id,
                                })}
                            >
                                <b>{createdBy.display_name}</b>
                            </Link>
                        ) : (
                            'Unknown'
                        )}
                    </>
                </StyledActivity>
            )}

            {isLoadingContributors && (
                <StyledActivity>
                    <div className="time">Loading ...</div>
                </StyledActivity>
            )}
        </div>
    </div>
);
Timeline.propTypes = {
    versions: PropTypes.array,
    paperResource: PropTypes.object,
    createdBy: PropTypes.object,
    isLoadingContributors: PropTypes.bool,
    hasNextPageContributors: PropTypes.bool,
    handleLoadMoreContributors: PropTypes.func,
};

export default Timeline;
