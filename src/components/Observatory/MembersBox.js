import { faPlus, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ContributorCard from 'components/Cards/ContributorCard/ContributorCard';
import AddMember from 'components/Observatory/AddMember';
import usePaginate from 'components/hooks/usePaginate';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getUsersByObservatoryId } from 'services/backend/observatories';
import { deleteUserFromObservatoryById } from 'services/backend/users';

const MembersBox = ({ observatoryId, organizationsList }) => {
    const user = useSelector(state => state.auth.user);
    const [openModal, setOpenModal] = useState(false);
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [userData, setUserData] = useState('');

    const fetchItems = async ({ id, page, pageSize }) => {
        const { content: items, last, totalElements } = await getUsersByObservatoryId({ id, page, size: pageSize });
        return {
            items,
            last,
            totalElements,
        };
    };

    const {
        results: members,
        isLoading,
        isLastPageReached,
        hasNextPage,
        page,
        totalElements,
        loadNextPage,
        handleKeyDown,
        setResults: setMembers,
    } = usePaginate({
        fetchItems,
        fetchItemsExtraParams: { id: observatoryId },
        pageSize: 6,
    });

    useEffect(() => {
        setUserData(user);
    }, [user]);

    const deleteObservatoryMember = async member => {
        await deleteUserFromObservatoryById(member.id)
            .then(_ => {
                setMembers(v => v.filter(t => t !== member));
                toast.success('Member deleted successfully');
            })
            .catch(() => {
                toast.error('error deleting a member');
            });
    };

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>Members</h5>
            {!!user && user.isCurationAllowed && (
                <Button outline size="sm" style={{ float: 'right', marginTop: '-33px' }} onClick={() => setShowAddMemberDialog(v => !v)}>
                    <Icon icon={faPlus} /> Add
                </Button>
            )}
            <div className="flex-grow-1">
                <div className="mt-3">
                    {members.length > 0 && (
                        <div>
                            {members.slice(0, 3).map((member, index) => (
                                <div key={`oc${index}`}>
                                    <ContributorCard
                                        contributor={{
                                            ...member,
                                            subTitle: organizationsList.find(o => o.id.includes(member.organization_id))?.name,
                                        }}
                                        options={
                                            userData && userData.isCurationAllowed
                                                ? [
                                                      {
                                                          label: 'Delete this member from the observatory',
                                                          action: () => deleteObservatoryMember(member),
                                                          icon: faTrash,
                                                          requireConfirmation: true,
                                                      },
                                                  ]
                                                : []
                                        }
                                    />
                                    {members.slice(0, 3).length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                </div>
                            ))}
                            {totalElements > 3 && (
                                <div className="text-center mt-3">
                                    <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                                        View more
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {members.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No members in this observatory yet</div>}
                </div>
                {isLoading && page === 0 && <div className="text-center mt-4 mb-4">Loading members ...</div>}

                {openModal && (
                    <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
                        <ModalHeader toggle={() => setOpenModal(v => !v)}>Observatory members</ModalHeader>
                        <ModalBody>
                            <div className="clearfix">
                                {members.map((member, index) => (
                                    <div key={`moc${index}`}>
                                        <ContributorCard
                                            contributor={{
                                                ...member,
                                                subTitle: organizationsList.find(o => o.id.includes(member.organization_id))?.name,
                                            }}
                                            options={
                                                userData && userData.isCurationAllowed
                                                    ? [
                                                          {
                                                              label: 'Delete this member from the observatory',
                                                              action: () => deleteObservatoryMember(member),
                                                              icon: faTrash,
                                                              requireConfirmation: true,
                                                          },
                                                      ]
                                                    : []
                                            }
                                        />
                                        {members.length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                    </div>
                                ))}
                                {!isLoading && hasNextPage && (
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        className="list-group-item list-group-item-action text-center"
                                        onClick={loadNextPage}
                                        onKeyDown={handleKeyDown}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        Load more...
                                    </div>
                                )}
                                {!hasNextPage && isLastPageReached && page !== 0 && (
                                    <div className="text-center my-3">You have reached the last page</div>
                                )}
                                {isLoading && page !== 0 && (
                                    <div className="list-group-item text-center" aria-live="polite" aria-busy="true">
                                        <Icon icon={faSpinner} spin /> Loading
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                    </Modal>
                )}

                <AddMember
                    showDialog={showAddMemberDialog}
                    toggle={() => setShowAddMemberDialog(v => !v)}
                    observatoryId={observatoryId}
                    organizationsList={organizationsList}
                    updateObservatoryMembers={member => setMembers(v => [member, ...v.filter(m => m.id !== member.id)])}
                />
            </div>
        </div>
    );
};

MembersBox.propTypes = {
    observatoryId: PropTypes.string.isRequired,
    organizationsList: PropTypes.array.isRequired,
};

export default MembersBox;
