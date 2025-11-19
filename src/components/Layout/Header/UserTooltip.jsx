import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import greetingTime from 'greeting-time';
import { AnimatePresence, motion } from 'motion/react';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useSWR from 'swr';

import Gravatar from '@/components/Gravatar/Gravatar';
import useAuthentication from '@/components/hooks/useAuthentication';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Row from '@/components/Ui/Structure/Row';
import ROUTES from '@/constants/routes';
import sha256Hex from '@/lib/hash';
import { getUserInformation, userUrl } from '@/services/backend/users';
import { federatedLogout, visitAccountUrl } from '@/services/keycloak';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${(props) => props.theme.dark};
    cursor: pointer;
`;

const StyledAuthTooltip = styled(motion.div)`
    position: absolute;
    right: 0;
    top: 50px;
    border-radius: ${(props) => props.theme.borderRadius};
    font-size: 16px;
    background-color: ${(props) => props.theme.secondary};
    max-width: 550px;
    width: max-content;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);
    color: #fff;
    padding: 1rem;

    .btn {
        border-color: ${(props) => props.theme.secondary};
        background-color: ${(props) => props.theme.dark};

        &:hover {
            background-color: ${(props) => props.theme.secondaryDarker};
        }
    }

    & .arrow:before {
        border-bottom-color: ${(props) => props.theme.secondary} !important;
    }

    @media (max-width: ${(props) => props.theme.gridBreakpoints.sm}) {
        .btn-group {
            width: 100%;
            flex-direction: column;
            .btn:first-child {
                border-radius: ${(props) => props.theme.borderRadius} ${(props) => props.theme.borderRadius} 0 0;
            }
            .btn:last-child {
                border-radius: 0 0 ${(props) => props.theme.borderRadius} ${(props) => props.theme.borderRadius};
            }
        }
        .col-3 {
            display: none;
        }
        .col-9 {
            flex: 0 0 100%;
            max-width: 100% !important;
        }
    }
`;

const UserTooltip = () => {
    const { user: _user } = useAuthentication();

    const { data: user, isLoading } = useSWR(_user ? [null, userUrl, 'getUserInformation'] : null, () => getUserInformation());

    const email = user?.email ? user?.email : 'example@example.com';

    const { data: hashedEmail, isLoading: isHashedEmailLoading } = useSWR(user && email ? [email, 'sha256Hex'] : null, ([params]) =>
        sha256Hex(params),
    );

    const [isVisibleTooltip, setIsVisibleTooltip] = useState(false);
    const userPopup = useRef(null);
    const greeting = greetingTime(new Date());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userPopup.current && !userPopup.current.contains(event.target) && isVisibleTooltip) {
                setIsVisibleTooltip(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isVisibleTooltip]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.code === 'Escape' && isVisibleTooltip) {
                setIsVisibleTooltip(false);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isVisibleTooltip]);

    const handleSignOut = async () => {
        try {
            setIsVisibleTooltip(false);
            await federatedLogout({ redirectUri: window.location.href });
            toast.success('Signed out successfully');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="ms-2 position-relative" ref={userPopup}>
            {isLoading || isHashedEmailLoading ? (
                <FontAwesomeIcon size="xl" icon={faSpinner} spin />
            ) : (
                <StyledGravatar
                    role="button"
                    tabIndex={0}
                    className="rounded-circle"
                    hashedEmail={hashedEmail}
                    size={40}
                    onClick={() => setIsVisibleTooltip((v) => !v)}
                    onKeyDown={(e) => (e.code === 'Enter' ? setIsVisibleTooltip((v) => !v) : undefined)}
                />
            )}
            <AnimatePresence>
                {isVisibleTooltip && (
                    <StyledAuthTooltip
                        style={{ originX: 1, originY: 0 }}
                        initial="initial"
                        exit="initial"
                        animate="animate"
                        variants={{
                            initial: { scale: 0, opacity: 0, y: -10 },
                            animate: {
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: {
                                    type: 'spring',
                                    duration: 0.4,
                                    delayChildren: 0.2,
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                    >
                        <Row>
                            <div className="col-3 text-center">
                                <Link onClick={() => setIsVisibleTooltip(false)} href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}>
                                    {isHashedEmailLoading ? (
                                        <FontAwesomeIcon size="xl" icon={faSpinner} spin />
                                    ) : (
                                        <StyledGravatar
                                            className="rounded-circle"
                                            style={{ border: '3px solid #fff' }}
                                            hashedEmail={hashedEmail}
                                            size={76}
                                            id="TooltipExample"
                                        />
                                    )}
                                </Link>
                            </div>
                            <div className="col-9 text-start">
                                <span className="ms-1">
                                    {greeting} {user.displayName}
                                </span>
                                <ButtonGroup className="mt-2" size="sm">
                                    <Button
                                        color="secondary"
                                        onClick={() => setIsVisibleTooltip(false)}
                                        tag={Link}
                                        href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                    >
                                        Profile
                                    </Button>
                                    <Button color="secondary" onClick={() => visitAccountUrl(window.location.href)}>
                                        Settings
                                    </Button>
                                    <Button
                                        color="secondary"
                                        className="text-nowrap"
                                        onClick={() => setIsVisibleTooltip(false)}
                                        tag={Link}
                                        href={reverse(ROUTES.USER_SETTINGS_DEFAULT)}
                                    >
                                        My drafts
                                    </Button>
                                    <Button onClick={handleSignOut} className="text-nowrap">
                                        Sign out
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </Row>
                    </StyledAuthTooltip>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserTooltip;
