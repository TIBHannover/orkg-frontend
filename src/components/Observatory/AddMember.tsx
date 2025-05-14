import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { mutate } from 'swr';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { Organization } from '@/services/backend/types';
import { addUserToObservatory } from '@/services/backend/users';
import { getErrorMessage } from '@/utils';

type AddMemberProps = {
    showDialog: boolean;
    toggle: () => void;
    observatoryId: string;
    organizationsList: Organization[];
};

const AddMember: FC<AddMemberProps> = ({ showDialog, toggle, observatoryId, organizationsList }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState(organizationsList.length === 1 ? organizationsList[0] : null);
    const [contributorId, setContributorId] = useState('');

    const handleSubmit = async () => {
        setIsLoading(true);
        if (selectedOrganization && contributorId.length > 0) {
            await addUserToObservatory(contributorId, observatoryId, selectedOrganization.id)
                .then(() => {
                    toast.success('Member added successfully');
                    mutate((key: any) => Array.isArray(key) && key[key.length - 1] === 'getUsersByObservatoryId');
                    setIsLoading(false);
                    setSelectedOrganization(organizationsList.length === 1 ? organizationsList[0] : null);
                    setContributorId('');
                    toggle();
                })
                .catch((error) => {
                    toast.error(`Error adding member! ${getErrorMessage(error, 'contributor_id') ?? error?.message}`);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
            toast.error('Organization or user email is missing');
        }
    };

    useEffect(() => {
        setSelectedOrganization(organizationsList.length === 1 ? organizationsList[0] : null);
    }, [organizationsList]);

    return (
        <Modal isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add a member</ModalHeader>
            <ModalBody>
                <>
                    <FormGroup>
                        <Label for="organization">Organization</Label>
                        <Select
                            value={organizationsList.length === 1 ? organizationsList[0] : selectedOrganization}
                            options={organizationsList}
                            onChange={(selected) => setSelectedOrganization(selected)}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ name }) => name}
                            inputId="organization"
                            classNamePrefix="react-select"
                        />
                        <SelectGlobalStyle />
                    </FormGroup>
                    <FormGroup>
                        <Label for="contributorId">Contributor ID</Label>
                        <InputGroup>
                            <Input id="contributorId" onChange={(e) => setContributorId(e.target.value)} type="text" value={contributorId} />
                        </InputGroup>
                    </FormGroup>
                </>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <ButtonWithLoading color="primary" isLoading={isLoading} onClick={() => handleSubmit()}>
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default AddMember;
