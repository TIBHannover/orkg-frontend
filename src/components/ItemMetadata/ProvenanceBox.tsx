import { faBinoculars, faPen, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import useProvenance from '@/components/ItemMetadata/hooks/useProvenance';
import { ProvenanceItem } from '@/components/ItemMetadata/types';
import ObservatoryModal from '@/components/ObservatoryModal/ObservatoryModal';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type ProvenanceBoxProps = {
    item: ProvenanceItem;
    editMode: boolean;
    updateCallBack?: (observatoryId?: string, organizationId?: string) => void;
};

function ProvenanceBox({ item, editMode = false, updateCallBack }: ProvenanceBoxProps) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const _observatoryId = item.observatories && item.observatories.length > 0 ? item.observatories[0] : item.observatory_id;
    const _organizationId = item.organizations && item.organizations.length > 0 ? item.organizations[0] : item.organization_id;
    const { observatory, organization } = useProvenance({ orgId: _organizationId, obsId: _observatoryId });
    const { isCurationAllowed } = useAuthentication();

    if (!organization && !observatory && !editMode) {
        return null;
    }

    return (
        <>
            {organization && (
                <Chip color="default">
                    <FontAwesomeIcon icon={faUsers} className="text-muted" /> Organization
                    <span className="ml-1">
                        <Link href={reverse(ROUTES.ORGANIZATION, { type: organization.type, id: organization.displayId })}>{organization.name}</Link>
                    </span>
                </Chip>
            )}
            {observatory && (
                <Chip color="default">
                    <FontAwesomeIcon icon={faBinoculars} className="text-muted" /> Observatory
                    <span className="ml-1">
                        <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>{observatory.name}</Link>
                    </span>
                </Chip>
            )}
            {editMode && isCurationAllowed && !organization && !observatory && <Chip color="default">Not assigned to any observatory</Chip>}
            {editMode && isCurationAllowed && (
                <ActionButton title="Edit provenance" icon={faPen} action={() => setShowAssignObservatory((v) => !v)} />
            )}
            <ObservatoryModal
                callBack={updateCallBack}
                showDialog={showAssignObservatory}
                observatory={observatory}
                organization={organization}
                // rosetta statement require the version_id to be updated
                resourceId={(item.version_id ?? item.id) as string}
                toggle={() => setShowAssignObservatory((v) => !v)}
            />
        </>
    );
}

export default ProvenanceBox;
