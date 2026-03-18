import { faBinoculars, faPen, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import useProvenance from '@/components/ItemMetadata/hooks/useProvenance';
import ObservatoryModal from '@/components/ObservatoryModal/ObservatoryModal';
import Badge from '@/components/Ui/Badge/Badge';
import ROUTES from '@/constants/routes';
import { Thing } from '@/services/backend/things';

type ProvenanceBoxProps = {
    item: Thing & { version_id?: string; observatories?: string[]; organizations?: string[]; observatory_id?: string; organization_id?: string };
    editMode: boolean;
    updateCallBack?: () => void;
};

function ProvenanceBox({ item, editMode = false, updateCallBack }: ProvenanceBoxProps) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const _observatoryId =
        'observatories' in item && item.observatories && item.observatories?.length > 0 ? item.observatories[0] : item.observatory_id;
    const _organizationId =
        'observatories' in item && item.organizations && item.organizations?.length > 0 ? item.organizations[0] : item.organization_id;
    const { observatory, organization } = useProvenance({ orgId: _organizationId, obsId: _observatoryId });
    const { isCurationAllowed } = useAuthentication();

    if (!organization && !observatory && !editMode) {
        return null;
    }

    return (
        <>
            {organization && (
                <Badge color="light" className="me-2 mt-2">
                    <FontAwesomeIcon icon={faUsers} /> Organization
                    <span className="ms-1">
                        <Link href={reverse(ROUTES.ORGANIZATION, { type: organization.type, id: organization.display_id })}>{organization.name}</Link>
                    </span>
                </Badge>
            )}
            {observatory && (
                <Badge color="light" className="me-2 mt-2">
                    <FontAwesomeIcon icon={faBinoculars} /> Observatory
                    <span className="ms-1">
                        <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>{observatory.name}</Link>
                    </span>
                </Badge>
            )}
            {editMode && isCurationAllowed && !organization && !observatory && (
                <Badge color="light" className="me-2 mt-2">
                    Not assigned to any observatory
                </Badge>
            )}
            {editMode && isCurationAllowed && (
                <ActionButton title="Edit provenance" icon={faPen} action={() => setShowAssignObservatory((v) => !v)} />
            )}
            <ObservatoryModal
                callBack={updateCallBack}
                showDialog={showAssignObservatory}
                observatory={observatory}
                organization={organization}
                // rosetta statement require the version_id to be updated
                resourceId={item.version_id ?? item.id}
                toggle={() => setShowAssignObservatory((v) => !v)}
            />
        </>
    );
}

export default ProvenanceBox;
