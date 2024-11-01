import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Link from 'next/link';
import hideOnEsc from 'components/Tippy/hideOnEsc';
import useContributor from 'components/hooks/useContributor';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${(props) => props.theme.lightDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${(props) => props.theme.primary};
    }
`;

const StyledUserAvatar = styled.span`
    &:hover .react-gravatar {
        border: 2px solid ${(props) => props.theme.primary};
    }
`;

const StyledSpinnerGravatar = styled.div`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    display: inline-block;
    text-align: center;
    line-height: ${(props) => props.size}px;
    color: ${(props) => props.theme.secondary};
    border: 2px solid ${(props) => props.theme.lightDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${(props) => props.theme.primary};
    }

    background-color: ${(props) => props.theme.lightDarker};
`;

const UserAvatar = ({ userId, size = 28, appendToTooltip = '', showDisplayName = false, linkTarget = '_self' }) => {
    const { contributor, isLoadingContributor } = useContributor({ userId });

    return (
        <>
            {userId && userId !== MISC.UNKNOWN_ID && (
                <Tippy
                    offset={[0, 10]}
                    placement="bottom"
                    content={`${contributor?.display_name}${appendToTooltip}`}
                    disabled={showDisplayName || !userId || !contributor || isLoadingContributor}
                    plugins={[hideOnEsc]}
                >
                    <StyledUserAvatar tabIndex="0">
                        <Link href={reverse(ROUTES.USER_PROFILE, { userId })} target={linkTarget}>
                            {!isLoadingContributor && (
                                <>
                                    <StyledGravatar className="rounded-circle" md5={contributor?.gravatar_id ?? 'example@example.com'} size={size} />
                                    {showDisplayName && !isLoadingContributor && <> {contributor?.display_name}</>}
                                </>
                            )}
                            {userId && isLoadingContributor && (
                                <StyledSpinnerGravatar className="rounded-circle" size={size}>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                </StyledSpinnerGravatar>
                            )}
                        </Link>
                    </StyledUserAvatar>
                </Tippy>
            )}
        </>
    );
};

UserAvatar.propTypes = {
    userId: PropTypes.string,
    size: PropTypes.number,
    appendToTooltip: PropTypes.string,
    showDisplayName: PropTypes.bool,
    linkTarget: PropTypes.string,
};

export default UserAvatar;
