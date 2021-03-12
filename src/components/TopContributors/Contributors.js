import { useState } from 'react';
import { ButtonDropdown, DropdownMenu, DropdownItem, CardTitle, Button } from 'reactstrap';
import { SmallDropdownToggle } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import useTopContributors from 'components/TopContributors/hooks/useTopContributors';
import ContentLoader from 'react-content-loader';
import ContributorsModal from './ContributorsModal';
import ROUTES from 'constants/routes.js';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import Gravatar from 'react-gravatar';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }
`;

const StyledDotGravatar = styled.div`
    width: 48px;
    height: 48px;
    display: inline-block;
    text-align: center;
    line-height: 48px;
    color: ${props => props.theme.darkblue};
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.ultraLightBlueDarker};
`;

const ContributorsAvatars = styled.div`
    display: inline-block;

    & > div {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    & > div:last-child {
        margin-right: 0;
    }
`;

const Contributors = ({ researchFieldId }) => {
    /*
    const [menuOpenContributors, setMenuOpenContributors] = useState(false);
    */
    const { contributors, isLoading } = useTopContributors({ researchFieldId, pageSize: 19 });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div>
            <div className="d-flex mb-3">
                <CardTitle tag="h5" className="flex-grow-1">
                    Contributors
                </CardTitle>
                <div className="align-self-center">
                    {/*!isLoading && contributors && contributors.length > 0 && (
                        <ButtonDropdown
                            isOpen={menuOpenContributors}
                            toggle={() => setMenuOpenContributors(v => !v)}
                            className="flex-shrink-0"
                            style={{ marginLeft: 'auto' }}
                            size="sm"
                        >
                            <SmallDropdownToggle caret size="sm" color="lightblue">
                                Last 30 days
                            </SmallDropdownToggle>
                            <DropdownMenu>
                                <DropdownItem>Last 30 days</DropdownItem>
                                <DropdownItem>All time</DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    )*/}
                </div>
            </div>
            {!isLoading && contributors && contributors.length > 0 && (
                <ContributorsAvatars>
                    {contributors.slice(0, 18).map((contributor /* 18 perfect for the container width */) => (
                        <div key={`contributor${contributor.profile.id}`}>
                            <Tippy
                                offset={[0, 20]}
                                placement="bottom"
                                content={
                                    <>
                                        {contributor.profile.display_name}
                                        <br />
                                        <i>
                                            {contributor.contributions} contribution{contributor.contributions > 1 ? 's' : ''}
                                        </i>
                                    </>
                                }
                            >
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.profile.id })}>
                                    <StyledGravatar className="rounded-circle" md5={contributor.profile.gravatar_id} size={48} />
                                </Link>
                            </Tippy>
                        </div>
                    ))}
                    {contributors.length > 1 && (
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
                    <i> be the first contributor!</i>.
                </div>
            )}
            {contributors.length > 1 && openModal && (
                <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />
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
    researchFieldId: PropTypes.string.isRequired
};

export default Contributors;
