import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Skeleton, toast } from '@heroui/react';
import { useState } from 'react';
import { mutate } from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddMember from '@/components/Observatory/AddMember';
import MemberRow from '@/components/Observatory/MemberRow';
import MembersModal from '@/components/Observatory/MembersModal';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import { getUsersByObservatoryId, observatoriesUrl } from '@/services/backend/observatories';
import { Contributor, Organization } from '@/services/backend/types';
import { deleteUserFromObservatoryById } from '@/services/backend/users';

type MembersBoxProps = {
    observatoryId: string;
    organizationsList: Organization[];
    isEditMode: boolean;
};

const MembersBox = ({ observatoryId, organizationsList, isEditMode }: MembersBoxProps) => {
    const { user } = useAuthentication();
    const [openModal, setOpenModal] = useState(false);
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

    const {
        data: items,
        isLoading,
        page,
        totalElements,
    } = usePaginate({
        fetchFunction: getUsersByObservatoryId,
        fetchUrl: observatoriesUrl,
        fetchFunctionName: 'getUsersByObservatoryId',
        fetchExtraParams: { id: observatoryId },
        defaultPageSize: 6,
        prefixParams: 'OM',
    });

    const deleteObservatoryMember = async (member: Contributor) => {
        try {
            await deleteUserFromObservatoryById(member.id);
            mutate((key: any) => Array.isArray(key) && key[key.length - 1] === 'getUsersByObservatoryId');
            toast.success('Member deleted successfully');
        } catch {
            toast.danger('error deleting a member');
        }
    };

    const canEdit = isEditMode && !!user && user.isCurationAllowed;
    const canDelete = !!user && user.isCurationAllowed;
    const visibleItems = items?.slice(0, 4) ?? [];

    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            <div className="flex items-center gap-2">
                <h2 className="text-xl mb-0 grow">Members</h2>
                {canEdit && (
                    <>
                        <Button variant="outline" size="sm" onPress={() => setShowAddMemberDialog((v) => !v)}>
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Add
                        </Button>
                        <AddMember
                            showDialog={showAddMemberDialog}
                            toggle={() => setShowAddMemberDialog((v) => !v)}
                            observatoryId={observatoryId}
                            organizationsList={organizationsList}
                        />
                    </>
                )}
            </div>
            <hr className="mt-2" />

            <div className="grow mt-3">
                {!isLoading && visibleItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {visibleItems.map((member) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                organizationsList={organizationsList}
                                className="py-1.5 border-b border-border/50 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
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
                        ))}
                    </div>
                )}
                {!isLoading && items && items.length === 0 && (
                    <div className="text-center my-6 text-muted text-sm">No members in this observatory yet</div>
                )}
                {isLoading && page === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex flex-col gap-1 grow">
                                    <Skeleton className="w-1/2 h-2 rounded" />
                                    <Skeleton className="w-1/3 h-1.5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && !!totalElements && totalElements > 4 && (
                <div className="text-center mt-3">
                    <Button size="sm" variant="tertiary" onPress={() => setOpenModal((v) => !v)}>
                        View more
                    </Button>
                </div>
            )}

            {openModal && (
                <MembersModal
                    observatoryId={observatoryId}
                    organizationsList={organizationsList}
                    isEditMode={isEditMode}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    deleteObservatoryMember={deleteObservatoryMember}
                />
            )}
        </div>
    );
};

export default MembersBox;
