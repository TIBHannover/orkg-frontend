import { Button, Modal, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';

import AutoCompleteObservatory from '@/components/AutocompleteObservatory/AutocompleteObservatory';
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen={showDialog} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog>
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Assign resource to an observatory</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        <AutoCompleteObservatory
                            onChangeObservatory={handleChangeObservatory}
                            onChangeOrganization={handleChangeOrganization}
                            observatory={observatory}
                            organization={organization}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onPress={handleSubmit}>Save</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ObservatoryModal;
