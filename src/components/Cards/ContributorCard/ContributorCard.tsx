import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import ActionButton, { ActionButtonProps } from '@/components/ActionButton/ActionButton';
import Gravatar from '@/components/Gravatar/Gravatar';
import ROUTES from '@/constants/routes';
import { TopContributor } from '@/services/backend/types';

export const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${(props) => props.theme.dark};
    cursor: pointer;
`;

type ContributorCardProps = {
    contributor: TopContributor & { subTitle?: string };
    options?: ActionButtonProps[];
};

const ContributorCard: FC<ContributorCardProps> = ({ contributor, options }) => (
    <div>
        <div className="d-flex flex-row">
            <Link className="justify-content-center align-self-center" href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} hashedEmail={contributor.gravatar_id} size={50} />
            </Link>
            <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                <div>
                    <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>{contributor.display_name}</Link>
                </div>
                {contributor.subTitle && (
                    <div>
                        <small className="text-muted">{contributor.subTitle}</small>
                    </div>
                )}
                <small>
                    {options?.map?.((option) => (
                        <ActionButton
                            title={option.title}
                            icon={option.icon}
                            key={`contributor-card-${contributor.id}-${option.title}`}
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

export default ContributorCard;
