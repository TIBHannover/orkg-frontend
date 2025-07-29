import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddOrganization from '@/components/Observatory/AddOrganization';
import Button from '@/components/Ui/Button/Button';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { updateObservatory } from '@/services/backend/observatories';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';

const OrganizationsBox = ({ isLoadingOrganizations, organizationsList, observatoryId, toggleOrganizationItem, isEditMode }) => {
    const { user } = useAuthentication();
    const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        setOrganizations(organizationsList);
    }, [organizationsList]);

    const deleteOrganization = async (organization) => {
        await updateObservatory(observatoryId, { organizations: organizationsList.filter((o) => o.id !== organization?.id).map((o) => o.id) })
            .then(() => {
                toggleOrganizationItem(organization);
                toast.success('Organization deleted successfully');
            })
            .catch(() => {
                toast.error('Error deleting an organization');
            });
    };

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>
                Organizations{' '}
                {isEditMode && !!user && user.isCurationAllowed && (
                    <Button outline size="sm" className="float-end" onClick={() => setShowAddOrganizationDialog((v) => !v)}>
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </Button>
                )}
            </h5>
            {!isLoadingOrganizations ? (
                <div className="mb-4 mt-4">
                    {organizations.length > 0 ? (
                        <div>
                            {organizations.map((organization, index) => (
                                <div key={`c${index}`} className="mb-3 pl-2 py-2 rounded border text-center position-relative">
                                    <Link
                                        href={reverse(ROUTES.ORGANIZATION, {
                                            type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                            id: organization.display_id,
                                        })}
                                    >
                                        <img
                                            style={{ marginTop: 12 }}
                                            height="50"
                                            src={getOrganizationLogoUrl(organization?.id)}
                                            alt={`${organization.name} logo`}
                                        />
                                    </Link>
                                    {isEditMode && !!user && user.isCurationAllowed && (
                                        <div className="position-absolute" style={{ top: 3, right: 0 }}>
                                            <ActionButton
                                                title="Delete this organization from the observatory"
                                                icon={faTrash}
                                                requireConfirmation
                                                confirmationMessage="Are you sure to delete?"
                                                confirmationButtons={[
                                                    {
                                                        title: 'Delete',
                                                        color: 'danger',
                                                        icon: faCheck,
                                                        action: () => deleteOrganization(organization),
                                                    },
                                                    {
                                                        title: 'Cancel',
                                                        color: 'secondary',
                                                        icon: faTimes,
                                                    },
                                                ]}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center mt-4 mb-4">No Organizations</div>
                    )}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading organizations ...</div>
            )}
            <AddOrganization
                showDialog={showAddOrganizationDialog}
                toggle={() => setShowAddOrganizationDialog((v) => !v)}
                id={observatoryId}
                organizations={organizations}
                toggleOrganizationItem={toggleOrganizationItem}
            />
        </div>
    );
};
OrganizationsBox.propTypes = {
    organizationsList: PropTypes.array.isRequired,
    isLoadingOrganizations: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    observatoryId: PropTypes.string.isRequired,
    toggleOrganizationItem: PropTypes.func.isRequired,
};

export default OrganizationsBox;
