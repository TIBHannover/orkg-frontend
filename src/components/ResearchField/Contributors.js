import { useState } from 'react';
import { ButtonDropdown, DropdownMenu, DropdownItem, CardTitle } from 'reactstrap';
import { SmallDropdownToggle } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import useResearchFieldContributors from 'components/ResearchField/hooks/useResearchFieldContributors';
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

const Contributors = ({ id }) => {
    const [menuOpenContributors, setMenuOpenContributors] = useState(false);
    const { contributors } = useResearchFieldContributors({ researchFieldId: id, initialSort: 'newest', initialIncludeSubFields: true });

    return (
        <div>
            <div className="d-flex mb-3">
                <CardTitle tag="h5" className="flex-grow-1">
                    Contributors
                </CardTitle>
                <div className="align-self-center">
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
                </div>
            </div>

            <ContributorsAvatars>
                {contributors.slice(0, 18).map(contributor => (
                    <div key={`contributor${contributor.id}`}>
                        <Tippy offset={[0, 20]} placement="bottom" content={contributor.display_name}>
                            <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                                <StyledGravatar className="rounded-circle" md5={contributor.gravatar_id} size={48} />
                            </Link>
                        </Tippy>
                    </div>
                ))}
                {contributors.length > 18 && (
                    <Tippy key="contributor" content="View More">
                        <StyledDotGravatar className="rounded-circle">
                            <Icon icon={faEllipsisH} />
                        </StyledDotGravatar>
                    </Tippy>
                )}
            </ContributorsAvatars>
        </div>
    );
};

Contributors.propTypes = {
    id: PropTypes.string.isRequired
};

export default Contributors;
