import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { faBinoculars, faPen, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MISC } from 'constants/graphSettings';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import useProvenance from 'components/Resource/hooks/useProvenance';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { Badge } from 'reactstrap';

function ProvenanceBox({ item, editMode }) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const { observatoryId, organizationId, provenance, updateCallBack } = useProvenance({ orgId: item.organization_id, obsId: item.observatory_id });
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    if (!provenance && !editMode) {
        return null;
    }

    return (
        <>
            {provenance?.organization?.id && organizationId !== MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2 mt-2">
                    <Icon icon={faUsers} /> Organization
                    <span className="ms-1">
                        <Link to={reverse(ROUTES.ORGANIZATION, { id: provenance.organization.display_id })}>{provenance.organization.name}</Link>
                    </span>
                </Badge>
            )}
            {provenance?.id && observatoryId !== MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2 mt-2">
                    <Icon icon={faBinoculars} /> Observatory
                    <span className="ms-1">
                        <Link to={reverse(ROUTES.OBSERVATORY, { id: provenance.display_id })}>{provenance.name}</Link>
                    </span>
                </Badge>
            )}
            {editMode && organizationId === MISC.UNKNOWN_ID && observatoryId === MISC.UNKNOWN_ID && (
                <Badge color="light" className="me-2 mt-2">
                    Not assigned to any observatory
                </Badge>
            )}
            {editMode && isCurationAllowed && (
                <StatementActionButton title="Edit provenance" icon={faPen} action={() => setShowAssignObservatory(v => !v)} />
            )}

            <ObservatoryModal
                callBack={updateCallBack}
                showDialog={showAssignObservatory}
                observatory={provenance}
                organization={provenance?.organization}
                resourceId={item.id}
                toggle={() => setShowAssignObservatory(v => !v)}
            />
        </>
    );
}

ProvenanceBox.propTypes = {
    item: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

ProvenanceBox.defaultProps = {
    editMode: false,
};
export default ProvenanceBox;
