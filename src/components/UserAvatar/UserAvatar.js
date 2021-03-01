import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { getUserInformationById } from 'services/backend/users';
import Gravatar from 'react-gravatar';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }
`;

const StyledSpinnerGravatar = styled.div`
    width: 28px;
    height: 28px;
    display: inline-block;
    text-align: center;
    line-height: 28px;
    color: ${props => props.theme.darkblue};
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.ultraLightBlueDarker};
`;

const UserAvatar = ({ userId }) => {
    const [contributor, setContributor] = useState(null);
    const [isLoadingContributor, setIsLoadingContributor] = useState(false);

    useEffect(() => {
        if (userId) {
            setIsLoadingContributor(true);
            getUserInformationById(userId)
                .then(result => {
                    setContributor(result);
                    setIsLoadingContributor(false);
                })
                .catch(() => {
                    setIsLoadingContributor(false);
                });
        }
    }, [userId]);

    return (
        <div>
            {userId && (
                <Tippy
                    offset={[0, 10]}
                    placement="bottom"
                    content={contributor?.display_name}
                    disabled={!userId || !contributor || isLoadingContributor}
                >
                    <Link to={reverse(ROUTES.USER_PROFILE, { userId: userId })}>
                        {!isLoadingContributor && (
                            <StyledGravatar className="rounded-circle" email={contributor?.email ?? 'example@example.com'} size={28} />
                        )}
                        {userId && isLoadingContributor && (
                            <StyledSpinnerGravatar className="rounded-circle">
                                <Icon icon={faSpinner} spin />
                            </StyledSpinnerGravatar>
                        )}
                    </Link>
                </Tippy>
            )}
        </div>
    );
};

UserAvatar.propTypes = {
    userId: PropTypes.string
};

export default UserAvatar;
