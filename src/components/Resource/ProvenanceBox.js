import { faBinoculars, faPen, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActionButton from 'components/ActionButton/ActionButton';
import useAuthentication from 'components/hooks/useAuthentication';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import useProvenance from 'components/Resource/hooks/useProvenance';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Badge } from 'reactstrap';

function ProvenanceBox({ item, editMode = false }) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const _observatoryId = 'observatories' in item && item.observatories.length > 0 ? item.observatories[0] : item.observatory_id;
    const _organizationId = 'observatories' in item && item.organizations.length > 0 ? item.organizations[0] : item.organization_id;
    const { observatoryId, organizationId, provenance, updateCallBack } = useProvenance({ orgId: _organizationId, obsId: _observatoryId });
    const { isCurationAllowed } = useAuthentication();

    if (!provenance && !editMode) {
        return null;
    }

    return (
        <>
            {provenance?.organization?.id && organizationId !== MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2 mt-2">
                    <FontAwesomeIcon icon={faUsers} /> Organization
                    <span className="ms-1">
                        <Link href={reverse(ROUTES.ORGANIZATION, { type: provenance.organization.type, id: provenance.organization.display_id })}>
                            {provenance.organization.name}
                        </Link>
                    </span>
                </Badge>
            )}
            {provenance?.id && observatoryId !== MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2 mt-2">
                    <FontAwesomeIcon icon={faBinoculars} /> Observatory
                    <span className="ms-1">
                        <Link href={reverse(ROUTES.OBSERVATORY, { id: provenance.display_id })}>{provenance.name}</Link>
                    </span>
                </Badge>
            )}
            {editMode && isCurationAllowed && organizationId === MISC.UNKNOWN_ID && observatoryId === MISC.UNKNOWN_ID && (
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
                observatory={provenance}
                organization={provenance?.organization}
                // rosetta statement require the version_id to be updated
                resourceId={item.version_id ?? item.id}
                toggle={() => setShowAssignObservatory((v) => !v)}
            />
        </>
    );
}

ProvenanceBox.propTypes = {
    item: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default ProvenanceBox;
