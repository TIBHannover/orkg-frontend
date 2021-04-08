import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';

const OrganizationsBox = ({ isLoadingOrganizations, organizationsList }) => {
    return (
        <div className="box rounded-lg p-4 flex-grow-1">
            <h5>Organizations</h5>
            {!isLoadingOrganizations ? (
                <div className="mb-4 mt-4">
                    {organizationsList.length > 0 ? (
                        <div>
                            {organizationsList.map((organization, index) => {
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
        </div>
    );
};

OrganizationsBox.propTypes = {
    organizationsList: PropTypes.array.isRequired,
    isLoadingOrganizations: PropTypes.bool.isRequired
};

export default OrganizationsBox;
