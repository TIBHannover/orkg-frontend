import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import ActionButton, { ActionButtonProps } from '@/components/ActionButton/ActionButton';
import Gravatar from '@/components/Gravatar/Gravatar';
import useContributor from '@/components/hooks/useContributor';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

export const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${(props) => props.theme.dark};
    cursor: pointer;
`;

type ContributorCardProps = {
    id: string;
    subTitle?: string;
    options?: ActionButtonProps[];
};

const ContributorCard: FC<ContributorCardProps> = ({ id, subTitle, options }) => {
    const { contributor: contributorData, isLoadingContributor } = useContributor({ userId: id });
    if (isLoadingContributor) {
        return <Skeleton width="100%" height="50px" />;
    }
    return (
        <div>
            <div className="d-flex flex-row">
                <Link className="justify-content-center align-self-center" href={reverse(ROUTES.USER_PROFILE, { userId: id })}>
                    <StyledGravatar
                        className="rounded-circle"
                        style={{ border: '3px solid #fff' }}
                        hashedEmail={contributorData?.gravatar_id ?? 'example@example.com'}
                        size={50}
                    />
                </Link>
                <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                    <div>
                        <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributorData?.id ?? MISC.UNKNOWN_ID })}>
                            {contributorData?.display_name ?? 'Unknown user'}
                        </Link>
                    </div>
                    {subTitle && (
                        <div>
                            <small className="text-muted">{subTitle}</small>
                        </div>
                    )}
                    <small>
                        {options?.map?.((option) => (
                            <ActionButton
                                title={option.title}
                                icon={option.icon}
                                key={`contributor-card-${id}-${option.title}`}
                                requireConfirmation={option.requireConfirmation}
                                confirmationMessage="Are you sure?"
                                confirmationButtons={[
                                    {
                                        title: 'Delete',
                                        color: 'danger',
                                        icon: faCheck,
                                        action: option.action,
                                    },
                                    {
                                        title: 'Cancel',
                                        color: 'secondary',
                                        icon: faTimes,
                                    },
                                ]}
                            />
                        ))}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default ContributorCard;
