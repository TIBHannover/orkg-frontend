import { differenceBy } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { updateObservatory } from '@/services/backend/observatories';
import { getAllOrganizations } from '@/services/backend/organizations';
import { Organization } from '@/services/backend/types';

type AddOrganizationProps = {
    showDialog: boolean;
    toggle: () => void;
    id: string;
    organizations: Organization[];
    toggleOrganizationItem: (organization: Organization) => void;
};

const AddOrganization: FC<AddOrganizationProps> = ({ showDialog, toggle, id, organizations, toggleOrganizationItem }) => {
    const [localOrganizations, setLocalOrganizations] = useState<Organization[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            await getAllOrganizations()
                .then((orgs) => {
                    setLocalOrganizations(differenceBy(orgs, organizations, 'id'));
                })
                .catch((error) => {
                    console.error(error);
                });
        };
        loadOrganizations();
    }, [organizations]);

    const handleSubmit = async () => {
        setIsLoading(true);
        if (selectedOrganization) {
            await updateObservatory(id, { organizations: [...organizations.map((o) => o.id), selectedOrganization?.id] })
                .then(() => {
                    toast.success('Organization added successfully');
                    setIsLoading(false);
                    toggleOrganizationItem(selectedOrganization);
                    setSelectedOrganization(null);
                    toggle();
                })
                .catch(() => {
                    toast.error('Organization cannot be added');
                    setIsLoading(false);
                });
        } else {
            toast.error('Please select an organization');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add an organization</ModalHeader>
            <ModalBody>
                <>
                    <Select
                        options={localOrganizations}
                        onChange={(selected) => setSelectedOrganization(selected)}
                        getOptionValue={({ id: _id }) => _id}
                        getOptionLabel={({ name }) => name}
                        classNamePrefix="react-select"
                    />
                    <SelectGlobalStyle />
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

export default AddOrganization;
