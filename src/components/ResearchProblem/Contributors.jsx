import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import Tooltip from 'components/FloatingUI/Tooltip';
import ContributorsModal from 'components/ResearchProblem/ContributorsModal';
import useResearchProblemContributors from 'components/ResearchProblem/hooks/useResearchProblemContributors';
import { ContributorsAvatars, StyledDotGravatar, StyledGravatar } from 'components/styled';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { CardTitle } from 'reactstrap';

const Contributors = ({ researchProblemId }) => {
    const { contributors, isLoading, isLoadingFailed } = useResearchProblemContributors({
        researchProblemId,
        pageSize: 19,
    });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div>
            <div className="d-flex mb-2">
                <CardTitle tag="h5" className="flex-grow-1">
                    Contributors
                </CardTitle>
            </div>
            {!isLoading && contributors && contributors.length > 0 && (
                <ContributorsAvatars>
                    {contributors.slice(0, 18).map((contributor /* 18 perfect for the container width */) => (
                        <div key={`contributor${contributor.user.id}`}>
                            <Tooltip
                                placement="bottom"
                                content={
                                    <>
                                        {contributor.user.display_name}
                                        <br />
                                        {contributor.contributions !== null && <i>{pluralize('contribution', contributor.contributions, true)}</i>}
                                    </>
                                }
                                contentStyle={{ maxWidth: '300px' }}
                            >
                                <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributor.user.id })}>
                                    <StyledGravatar className="rounded-circle" md5={contributor.user.gravatar_id} size={48} />
                                </Link>
                            </Tooltip>
                        </div>
                    ))}
                    {contributors.length > 18 && (
                        <Tooltip key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tooltip>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && !isLoadingFailed && contributors?.length === 0 && (
                <div className="mt-2 mb-2">
                    No contributors in this research field yet.
                    <i> Be the first contributor!</i>
                </div>
            )}
            {!isLoading && isLoadingFailed && (
                <div className="mt-2 mb-2 text-danger">Something went wrong while loading contributors of this research field.</div>
            )}
            {contributors.length > 18 && openModal && (
                <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />
            )}
            {isLoading && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 4" style={{ width: '100% !important' }}>
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="7" cy="2" r="2" />
                        <circle cx="12" cy="2" r="2" />
                        <circle cx="17" cy="2" r="2" />
                        <circle cx="22" cy="2" r="2" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

Contributors.propTypes = {
    researchProblemId: PropTypes.string.isRequired,
};

export default Contributors;
