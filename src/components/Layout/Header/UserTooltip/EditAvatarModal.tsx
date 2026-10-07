'use client';

import { Modal } from '@heroui/react';
import Link from 'next/link';

import Gravatar from '@/components/Gravatar/Gravatar';

type EditAvatarModalProps = {
    onOpenChange: (isOpen: boolean) => void;
    emailHashed: string;
};

const EditAvatarModal = ({ onOpenChange, emailHashed }: EditAvatarModalProps) => {
    return (
        <Modal>
            <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
                <Modal.Container size="md" placement="top">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Edit avatar</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex flex-shrink-0 items-start justify-center md:w-1/4">
                                    <Gravatar hashedEmail={emailHashed} size={100} className="rounded-full" />
                                </div>
                                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 md:w-3/4">
                                    To change your avatar, set or change your Gravatar at{' '}
                                    <Link href="https://gravatar.com/" target="_blank" rel="noreferrer noopener" className="underline">
                                        gravatar.com
                                    </Link>
                                    . Reload this page after updating your Gravatar.
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export default EditAvatarModal;
