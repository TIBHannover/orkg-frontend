import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dispatch, FC, SetStateAction } from 'react';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
        prefixParams: 'members',
    });

    const renderListItem = (member: Contributor, lastItem?: boolean) => (
        <div key={`member${member.id}`}>
            <ContributorCard
                id={member.id}
                subTitle={organizationsList.find((o) => o.id.includes(member.organization_id))?.name}
                options={
                    isEditMode && !!user && user.isCurationAllowed
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
            {!lastItem && <hr style={{ width: '90%', margin: '10px auto' }} />}
        </div>
    );

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>Observatory members</ModalHeader>
            <ModalBody>
                <div className="clearfix">
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
                    />
                </div>
            </ModalBody>
        </Modal>
    );
};

export default MembersModal;
