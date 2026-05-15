import { Modal } from '@heroui/react';
import { Contributor } from '@orkg/orkg-client';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';

import Gravatar from '@/components/Gravatar/Gravatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type MembersModalProps = {
    members: Contributor[];
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const MembersModal: FC<MembersModalProps> = ({ members, openModal, setOpenModal }) => (
    <Modal.Backdrop
        isOpen={openModal}
        onOpenChange={(open) => {
            if (!open) setOpenModal(false);
        }}
        isDismissable
    >
        <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
            <Modal.Dialog className="max-w-2xl">
                <Modal.Header>
                    <Modal.CloseTrigger />
                    <Modal.Heading>Organization members</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-6">
                    {members.length === 0 ? (
                        <div className="text-center text-muted py-6">No members yet</div>
                    ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-none p-0 m-0">
                            {members.map((member) => {
                                const displayName =
                                    member.displayName ?? (member as unknown as { display_name?: string }).display_name ?? 'Unknown user';
                                const gravatarId = member.gravatarId ?? (member as unknown as { gravatar_id?: string }).gravatar_id ?? '';
                                return (
                                    <li key={member.id}>
                                        <Link
                                            href={reverse(ROUTES.USER_PROFILE, { userId: member.id })}
                                            className="group flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 transition-colors hover:bg-default/40"
                                        >
                                            <Gravatar
                                                className="rounded-full border-2 border-border transition-colors group-hover:border-accent shrink-0"
                                                hashedEmail={gravatarId}
                                                size={40}
                                            />
                                            <span className="truncate text-foreground">{displayName}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Modal.Body>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default MembersModal;
