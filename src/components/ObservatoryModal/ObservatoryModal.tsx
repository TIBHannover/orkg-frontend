import { Button, Modal, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';
import useSWR from 'swr';

import AutoCompleteObservatory from '@/components/AutocompleteObservatory/AutocompleteObservatory';
import { MISC } from '@/constants/graphSettings';
import { updateComparison } from '@/services/backend/comparisons';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { updatePaper } from '@/services/backend/papers';
import { parseProblemDetails } from '@/services/backend/problemDetails';
import { updateResource } from '@/services/backend/resources';
import { ConferenceSeries, Observatory, Organization } from '@/services/backend/types';

type ObservatoryModalProps = {
    showDialog: boolean;
    toggle: () => void;
    resourceId: string;
    observatory?: Observatory;
    organization?: Organization;
    conferenceSeries?: ConferenceSeries;
    // the backend only accepts conference series events as organization on papers and comparisons,
    // so the event selector is opt-in per resource type
    allowConferenceSeries?: boolean;
    // papers and comparisons must be saved through their own endpoints — the generic resources
    // endpoint rejects conference series events as organization
    resourceType?: 'resource' | 'paper' | 'comparison';
    callBack?: (observatoryId: string, organizationId: string) => void;
};

const ObservatoryModal: FC<ObservatoryModalProps> = ({
    showDialog,
    toggle,
    resourceId,
    observatory: _observatory,
    organization: _organization,
    conferenceSeries: _conferenceSeries,
    allowConferenceSeries = false,
    resourceType = 'resource',
    callBack,
}) => {
    const [observatory, setObservatory] = useState(_observatory);
    const [organization, setOrganization] = useState(_organization);
    const [conferenceSeries, setConferenceSeries] = useState(_conferenceSeries);

    useEffect(() => {
        setObservatory(_observatory);
    }, [_observatory]);

    useEffect(() => {
        setOrganization(_organization);
    }, [_organization]);

    useEffect(() => {
        setConferenceSeries(_conferenceSeries);
    }, [_conferenceSeries]);

    // some callers only know the assigned event (the organizations attribute holds the event id);
    // resolve its parent conference so the organization field is preselected
    const { data: parentOrganization } = useSWR(
        _conferenceSeries && !_organization ? [_conferenceSeries.organizationId, organizationsUrl, 'getOrganization'] : null,
        ([params]) => getOrganization(params),
    );

    useEffect(() => {
        if (parentOrganization) {
            setOrganization((prev) => prev ?? parentOrganization);
        }
    }, [parentOrganization]);

    const handleChangeObservatory = (select: Observatory | null) => {
        setObservatory(select ?? undefined);
    };

    const handleChangeOrganization = (select: Organization | null) => {
        setOrganization(select ?? undefined);
    };

    const handleChangeConferenceSeries = (select: ConferenceSeries | null) => {
        setConferenceSeries(select ?? undefined);
    };

    const handleSubmit = async () => {
        // a conference series event is assigned through the organization attribute and takes
        // precedence over its parent conference organization
        const organizationId = (allowConferenceSeries ? conferenceSeries?.id : undefined) ?? organization?.id ?? MISC.UNKNOWN_ID;
        const observatoryId = observatory?.id ?? MISC.UNKNOWN_ID;
        try {
            if (resourceType === 'resource') {
                await updateResource(resourceId, { observatoryId, organizationId });
            } else {
                // unlike the resources endpoint, the content-type endpoints validate every id in the
                // list and reject the unknown-id placeholder — an empty list clears the assignment
                const data = {
                    observatories: observatory?.id ? [observatory.id] : [],
                    organizations: organizationId !== MISC.UNKNOWN_ID ? [organizationId] : [],
                };
                if (resourceType === 'paper') {
                    await updatePaper(resourceId, data);
                } else {
                    await updateComparison(resourceId, data);
                }
            }
        } catch (error) {
            const problem = await parseProblemDetails(error);
            toast.danger(problem?.detail ?? problem?.title ?? 'Something went wrong while saving the assignment');
            return;
        }
        toast.success('Observatory assigned to resource successfully');
        if (callBack) {
            callBack?.(observatoryId, organizationId);
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
                            onChangeConferenceSeries={handleChangeConferenceSeries}
                            observatory={observatory}
                            organization={organization}
                            conferenceSeries={conferenceSeries}
                            allowConferenceSeries={allowConferenceSeries}
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
