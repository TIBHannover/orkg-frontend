import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import AddOrganization from 'components/Observatory/AddOrganization';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { faPlus, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { deleteOrganizationFromObservatory } from 'services/backend/observatories';

const OrganizationsBox = ({ isLoadingOrganizations, organizationsList, observatoryId, toggleOrganizationItem }) => {
    const user = useSelector(state => state.auth.user);
    const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        setOrganizations(organizationsList);
    }, [organizationsList]);

    const deleteOrganization = async organization => {
        await deleteOrganizationFromObservatory(observatoryId, organization.id)
            .then(_ => {
                toggleOrganizationItem(organization);
                toast.success('Organization deleted successfully');
            })
            .catch(() => {
                toast.error('error deleting an organization');
            });
    };

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>
                Organizations{' '}
                {!!user && user.isCurationAllowed && (
                    <Button outline size="sm" className="float-end" onClick={() => setShowAddOrganizationDialog(v => !v)}>
                        <Icon icon={faPlus} /> Add
                    </Button>
                )}
            </h5>

            {!isLoadingOrganizations ? (
                <div className="mb-4 mt-4">
                    {organizations.length > 0 ? (
                        <div>
                            {organizations.map((organization, index) => (
                                <div key={`c${index}`} className="mb-3 pl-2 py-2 rounded border text-center position-relative">
                                    <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.display_id })}>
                                        {organization.logo ? (
                                            <img style={{ marginTop: 12 }} height="50" src={organization.logo} alt={`${organization.name} logo`} />
                                        ) : (
                                            organization.name
                                        )}
                                    </Link>
                                    {!!user && user.isCurationAllowed && (
                                        <div className="position-absolute" style={{ top: 3, right: 0 }}>
                                            <StatementActionButton
                                                title="Delete this organization from the observatory"
                                                icon={faTrash}
                                                requireConfirmation={true}
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
                toggle={() => setShowAddOrganizationDialog(v => !v)}
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
    observatoryId: PropTypes.string.isRequired,
    toggleOrganizationItem: PropTypes.func.isRequired,
};

export default OrganizationsBox;
