import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import AutoCompleteObservatory from '@/components/AutocompleteObservatory/AutocompleteObservatory';
import Button from '@/components/Ui/Button/Button';
import { MISC } from '@/constants/graphSettings';
import { updateResource } from '@/services/backend/resources';
import { Observatory, Organization } from '@/services/backend/types';

type ObservatoryModalProps = {
    showDialog: boolean;
    toggle: () => void;
    resourceId: string;
    observatory?: Observatory;
    organization?: Organization;
    callBack?: (observatoryId: string, organizationId: string) => void;
};

const ObservatoryModal: FC<ObservatoryModalProps> = ({
    showDialog,
    toggle,
    resourceId,
    observatory: _observatory,
    organization: _organization,
    callBack,
}) => {
    const [observatory, setObservatory] = useState(_observatory);
    const [organization, setOrganization] = useState(_organization);

    useEffect(() => {
        setObservatory(_observatory);
    }, [_observatory]);

    useEffect(() => {
        setOrganization(_organization);
    }, [_organization]);

    const handleChangeObservatory = (select: Observatory | null) => {
        setObservatory(select ?? undefined);
    };

    const handleChangeOrganization = (select: Organization | null) => {
        setOrganization(select ?? undefined);
    };

    const handleSubmit = async () => {
        await updateResource(resourceId, {
            observatory_id: observatory?.id ?? MISC.UNKNOWN_ID,
            organization_id: organization?.id ?? MISC.UNKNOWN_ID,
        });
        toast.success('Observatory assigned to resource successfully');
        if (callBack) {
            callBack?.(observatory?.id ?? MISC.UNKNOWN_ID, organization?.id ?? MISC.UNKNOWN_ID);
        }
        toggle();
    };

    return (
        <Modal isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Assign resource to an observatory</ModalHeader>
            <ModalBody>
                <AutoCompleteObservatory
                    onChangeObservatory={handleChangeObservatory}
                    onChangeOrganization={handleChangeOrganization}
                    observatory={observatory}
                    organization={organization}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ObservatoryModal;
