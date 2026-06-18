import { Modal, toast } from '@heroui/react';
import { differenceBy } from 'lodash';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { updateObservatory } from '@/services/backend/observatories';
import { getAllOrganizations } from '@/services/backend/organizations';
import { Organization } from '@/services/backend/types';

type AddOrganizationProps = {
    showDialog: boolean;
    toggle: () => void;
    id: string;
    organizations: Organization[];
    mutateObservatory: () => void;
};

const AddOrganization: FC<AddOrganizationProps> = ({ showDialog, toggle, id, organizations, mutateObservatory }) => {
    const [localOrganizations, setLocalOrganizations] = useState<Organization[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!showDialog) return;
        const loadOrganizations = async () => {
            try {
                const orgs = await getAllOrganizations();
                setLocalOrganizations(differenceBy(orgs, organizations, 'id'));
            } catch (error) {
                console.error(error);
            }
        };
        loadOrganizations();
    }, [organizations, showDialog]);

    const handleSubmit = async () => {
        if (!selectedOrganization) {
            toast.danger('Please select an organization');
            return;
        }
        setIsLoading(true);
        try {
            await updateObservatory(id, {
                organizations: [...organizations.map((o) => o.id), selectedOrganization.id],
            });
            toast.success('Organization added successfully');
            mutateObservatory();
            setSelectedOrganization(null);
            toggle();
        } catch {
            toast.danger('Organization cannot be added');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal.Backdrop
            isOpen={showDialog}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-md">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Add an organization</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Select
                            options={localOrganizations}
                            value={selectedOrganization}
                            onChange={(selected) => setSelectedOrganization(selected)}
                            getOptionValue={({ id: _id }) => _id}
                            getOptionLabel={({ name }) => name}
                            classNamePrefix="react-select"
                            classNames={customClassNames as any}
                            styles={customStyles as any}
                            menuPosition="fixed"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonWithLoading variant="primary" isLoading={isLoading} onPress={handleSubmit}>
                            Save
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AddOrganization;
