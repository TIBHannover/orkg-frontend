import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Skeleton } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import ActionButton, { ActionButtonProps } from '@/components/ActionButton/ActionButton';
import Gravatar from '@/components/Gravatar/Gravatar';
import useContributor from '@/components/hooks/useContributor';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type ContributorCardProps = {
    id: string;
    subTitle?: string;
    options?: ActionButtonProps[];
};

const ContributorCard: FC<ContributorCardProps> = ({ id, subTitle, options }) => {
    const { contributor: contributorData, isLoadingContributor } = useContributor({ userId: id });
    if (isLoadingContributor) {
        return <Skeleton className="w-full h-[50px] rounded" />;
    }
    return (
        <div>
            <div className="flex flex-row">
                <Link className="justify-center align-self-center" href={reverse(ROUTES.USER_PROFILE, { userId: id })}>
                    <Gravatar
                        className="cursor-pointer rounded-full border-3 border-white"
                        hashedEmail={contributorData?.gravatarId ?? 'example@example.com'}
                        size={50}
                    />
                </Link>
                <div className="flex justify-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                    <div>
                        <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributorData?.id ?? MISC.UNKNOWN_ID })}>
                            {contributorData?.displayName ?? 'Unknown user'}
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
