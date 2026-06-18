import { Input, Label, Modal, TextField, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';
import Select from 'react-select';
import { mutate } from 'swr';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
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

    useEffect(() => {
        setSelectedOrganization(organizationsList.length === 1 ? organizationsList[0] : null);
    }, [organizationsList]);

    const handleSubmit = async () => {
        if (!selectedOrganization || contributorId.length === 0) {
            toast.danger('Organization or user email is missing');
            return;
        }
        setIsLoading(true);
        try {
            await addUserToObservatory(contributorId, observatoryId, selectedOrganization.id);
            toast.success('Member added successfully');
            mutate((key: any) => Array.isArray(key) && key[key.length - 1] === 'getUsersByObservatoryId');
            setSelectedOrganization(organizationsList.length === 1 ? organizationsList[0] : null);
            setContributorId('');
            toggle();
        } catch (error: any) {
            toast.danger(`Error adding member! ${getErrorMessage(error, 'contributor_id') ?? error?.message}`);
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
                        <Modal.Heading>Add a member</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="organization">Organization</Label>
                                <Select
                                    inputId="organization"
                                    value={organizationsList.length === 1 ? organizationsList[0] : selectedOrganization}
                                    options={organizationsList}
                                    onChange={(selected) => setSelectedOrganization(selected)}
                                    getOptionValue={({ id }) => id}
                                    getOptionLabel={({ name }) => name}
                                    classNamePrefix="react-select"
                                    classNames={customClassNames as any}
                                    styles={customStyles as any}
                                    menuPosition="fixed"
                                />
                            </div>
                            <TextField fullWidth name="contributorId" value={contributorId} onChange={setContributorId}>
                                <Label>Contributor ID</Label>
                                <Input />
                            </TextField>
                        </div>
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

export default AddMember;
