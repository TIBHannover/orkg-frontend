import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '@heroui/react';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import MemberRow from '@/components/Observatory/MemberRow';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { getUsersByObservatoryId, observatoriesUrl } from '@/services/backend/observatories';
import { Contributor, Organization } from '@/services/backend/types';

type MembersModalProps = {
    observatoryId: string;
    organizationsList: Organization[];
    isEditMode: boolean;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    deleteObservatoryMember: (member: Contributor) => void;
};

const MembersModal: FC<MembersModalProps> = ({ observatoryId, organizationsList, isEditMode, openModal, setOpenModal, deleteObservatoryMember }) => {
    const { user } = useAuthentication();

    const {
        data: items,
        isLoading,
        error,
        hasNextPage,
        page,
        totalElements,
        totalPages,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getUsersByObservatoryId,
        fetchUrl: observatoriesUrl,
        fetchFunctionName: 'getUsersByObservatoryId',
        fetchExtraParams: { id: observatoryId },
        defaultPageSize: 10,
        prefixParams: 'members_',
    });

    useEffect(
        () => () => {
            setPage(0);
            setPageSize(10);
        },
        [setPage, setPageSize],
    );

    const canDelete = isEditMode && !!user && user.isCurationAllowed;

    const renderListItem = (member: Contributor) => (
        <MemberRow
            key={`member${member.id}`}
            member={member}
            organizationsList={organizationsList}
            className="px-2 py-3 border-b border-border last:border-b-0"
            actions={
                canDelete ? (
                    <ActionButton
                        title="Delete this member from the observatory"
                        icon={faTrash}
                        requireConfirmation
                        confirmationMessage="Are you sure?"
                        confirmationButtons={[
                            {
                                title: 'Delete',
                                color: 'danger',
                                icon: faCheck,
                                action: () => deleteObservatoryMember(member),
                            },
                            {
                                title: 'Cancel',
                                color: 'secondary',
                                icon: faTimes,
                            },
                        ]}
                    />
                ) : null
            }
        />
    );

    return (
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
                        <Modal.Heading>Observatory members</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <ListPaginatedContent<Contributor>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="members"
                            isLoading={isLoading}
                            items={items ?? []}
                            hasNextPage={hasNextPage}
                            page={page}
                            setPage={setPage}
                            setPageSize={setPageSize}
                            totalElements={totalElements}
                            error={error}
                            totalPages={totalPages}
                            boxShadow={false}
                            flush={false}
                            prefixParams="members_"
                        />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default MembersModal;
