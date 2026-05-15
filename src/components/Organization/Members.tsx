import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

import Gravatar from '@/components/Gravatar/Gravatar';
import MembersModal from '@/components/Organization/MembersModal';
import { ContributorsAvatars, StyledDotGravatar } from '@/components/styled';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getUsersByOrganizationId, organizationsUrl } from '@/services/backend/organizations';

type MembersProps = {
    organizationsId: string;
};

const Members = ({ organizationsId }: MembersProps) => {
    const [openModal, setOpenModal] = useState(false);

    const { data: members, isLoading: isLoadingMembers } = useSWR(
        organizationsId ? [organizationsId, organizationsUrl, 'getUsersByOrganizationId'] : null,
        ([id]) => getUsersByOrganizationId(id),
    );

    return (
        <div>
            <div className="flex mb-4">
                <h5 className="text-lg font-semibold grow mb-0">Members</h5>
            </div>
            {!isLoadingMembers && members && members.length > 0 && (
                <ContributorsAvatars>
                    {members.slice(0, 18).map((member) => {
                        const displayName = member.displayName ?? (member as unknown as { display_name?: string }).display_name;
                        const gravatarId = member.gravatarId ?? (member as unknown as { gravatar_id?: string }).gravatar_id ?? '';
                        return (
                            <div key={`contributor${member.id}`}>
                                <Tooltip>
                                    <Tooltip.Trigger className="inline-flex align-middle">
                                        <Link href={reverse(ROUTES.USER_PROFILE, { userId: member.id })} aria-label={displayName} className="block">
                                            <Gravatar
                                                className="cursor-pointer rounded-full border-2 border-border transition-colors hover:border-accent"
                                                hashedEmail={gravatarId}
                                                size={48}
                                            />
                                        </Link>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content placement="bottom">{displayName}</Tooltip.Content>
                                </Tooltip>
                            </div>
                        );
                    })}
                    {members.length > 18 && (
                        <div>
                            <Tooltip>
                                <Tooltip.Trigger className="inline-flex align-middle">
                                    <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-full">
                                        <FontAwesomeIcon icon={faEllipsisH} />
                                    </StyledDotGravatar>
                                </Tooltip.Trigger>
                                <Tooltip.Content>View More</Tooltip.Content>
                            </Tooltip>
                        </div>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoadingMembers && members?.length === 0 && <div className="mb-2">No members in this organization yet</div>}
            {members && members.length > 18 && openModal && <MembersModal members={members} openModal={openModal} setOpenModal={setOpenModal} />}
            {isLoadingMembers && (
                <div className="my-6 flex gap-2">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="size-10 rounded-full" />
                </div>
            )}
        </div>
    );
};

export default Members;
