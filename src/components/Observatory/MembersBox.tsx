import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddMember from '@/components/Observatory/AddMember';
import MembersModal from '@/components/Observatory/MembersModal';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import Button from '@/components/Ui/Button/Button';
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
        await deleteUserFromObservatoryById(member.id)
            .then(() => {
                mutate((key: any) => Array.isArray(key) && key[key.length - 1] === 'getUsersByObservatoryId');
                toast.success('Member deleted successfully');
            })
            .catch(() => {
                toast.error('error deleting a member');
            });
    };

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>Members</h5>
            {isEditMode && !!user && user.isCurationAllowed && (
                <Button outline size="sm" style={{ float: 'right', marginTop: '-33px' }} onClick={() => setShowAddMemberDialog((v) => !v)}>
                    <FontAwesomeIcon icon={faPlus} /> Add
                </Button>
            )}
            <div className="flex-grow-1">
                <div className="mt-3">
                    {items && items.length > 0 && (
                        <div>
                            {items.slice(0, 3).map((member, index) => (
                                <div key={member.id}>
                                    <ContributorCard
                                        contributor={{
                                            ...member,
                                            contributor: member.id,
                                            subTitle: organizationsList.find((o) => o.id.includes(member.organization_id))?.name,
                                        }}
                                        options={
                                            !!user && user.isCurationAllowed
                                                ? [
                                                      {
                                                          title: 'Delete this member from the observatory',
                                                          action: () => deleteObservatoryMember(member),
                                                          icon: faTrash,
                                                          requireConfirmation: true,
                                                      },
                                                  ]
                                                : []
                                        }
                                    />
                                    {items.slice(0, 3).length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                </div>
                            ))}
                            {totalElements && totalElements > 3 && (
                                <div className="text-center mt-3">
                                    <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                                        View more
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {items && items.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No members in this observatory yet</div>}
                </div>
                {isLoading && page === 0 && <div className="text-center mt-4 mb-4">Loading members ...</div>}

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

                <AddMember
                    showDialog={showAddMemberDialog}
                    toggle={() => setShowAddMemberDialog((v) => !v)}
                    observatoryId={observatoryId}
                    organizationsList={organizationsList}
                />
            </div>
        </div>
    );
};

export default MembersBox;
