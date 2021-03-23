import { useState } from 'react';
import { CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import useResearchProblemContributors from './hooks/useResearchProblemContributors';
import ContentLoader from 'react-content-loader';
import ContributorsModal from './ContributorsModal';
import ROUTES from 'constants/routes.js';
import { StyledGravatar, StyledDotGravatar, ContributorsAvatars } from 'components/styled';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const Contributors = ({ researchProblemId }) => {
    const { contributors, isLoading } = useResearchProblemContributors({
        researchProblemId,
        pageSize: 19
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
                            <Tippy
                                offset={[0, 20]}
                                placement="bottom"
                                content={
                                    <>
                                        {contributor.user.display_name}
                                        <br />
                                        {contributor.contributions !== null && (
                                            <i>
                                                {contributor.contributions} contribution{contributor.contributions > 1 ? 's' : ''}
                                            </i>
                                        )}
                                    </>
                                }
                            >
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.user.id })}>
                                    <StyledGravatar className="rounded-circle" md5={contributor.user.gravatar_id} size={48} />
                                </Link>
                            </Tippy>
                        </div>
                    ))}
                    {contributors.length > 18 && (
                        <Tippy key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal(v => !v)} className="rounded-circle">
                                <Icon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tippy>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && contributors?.length === 0 && (
                <div className="mt-4 mb-4">
                    No contributors in this research field yet.
                    <i> Be the first contributor!</i>
                </div>
            )}
            {contributors.length > 18 && openModal && (
                <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />
            )}
            {isLoading && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader
                        height="100%"
                        width="100%"
                        viewBox="0 0 100 4"
                        style={{ width: '100% !important' }}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
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
    researchProblemId: PropTypes.string.isRequired
};

export default Contributors;
