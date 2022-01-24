import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import AddOrganization from 'components/Observatory/AddOrganization';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

const OrganizationsBox = ({ isLoadingOrganizations, organizationsList, observatoryId }) => {
    const user = useSelector(state => state.auth.user);
    const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        setOrganizations(organizationsList);
    }, [organizationsList]);

    const updateObservatoryOrganizations = organizations => {
        setOrganizations(organizations);
    };

    return (
        <div className="box rounded-3 p-4 flex-grow-1">
            <h5>Organizations</h5>
            {!!user && user.isCurationAllowed && (
                <Button outline size="sm" style={{ float: 'right', marginTop: '-33px' }} onClick={() => setShowAddOrganizationDialog(v => !v)}>
                    <Icon icon={faPlus} /> Edit
                </Button>
            )}
            {!isLoadingOrganizations ? (
                <div className="mb-4 mt-4">
                    {organizations.length > 0 ? (
                        <div>
                            {organizations.map((organization, index) => {
                                if (organization.logo) {
                                    return (
                                        <div
                                            key={`c${index}`}
                                            className="mb-3"
                                            style={{
                                                border: 'solid lightgray thin',
                                                textAlign: 'center',
                                                verticalAlign: 'middle',
                                                paddingBottom: '11px'
                                            }}
                                        >
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.display_id })}>
                                                <img
                                                    style={{ marginTop: 12 }}
                                                    height="50"
                                                    src={organization.logo}
                                                    alt={`${organization.name} logo`}
                                                />
                                            </Link>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={`c${index}`}
                                            className="mb-3 p-2"
                                            style={{
                                                border: 'solid lightgray thin',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: organization.display_id })}>{organization.name}</Link>
                                        </div>
                                    );
                                }
                            })}
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
                updateObservatoryOrganizations={updateObservatoryOrganizations}
            />
        </div>
    );
};

OrganizationsBox.propTypes = {
    organizationsList: PropTypes.array.isRequired,
    isLoadingOrganizations: PropTypes.bool.isRequired,
    observatoryId: PropTypes.string.isRequired
};

export default OrganizationsBox;
