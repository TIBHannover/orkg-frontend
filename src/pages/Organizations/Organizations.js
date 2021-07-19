import { Component } from 'react';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import OrganizationCard from 'components/OrganizationCard/OrganizationCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { getAllOrganizations } from 'services/backend/organizations';
import { openAuthDialog } from 'actions/auth';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ROUTES from 'constants/routes';

class Organizations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            organizations: [],
            isNextPageLoading: false
        };
    }

    componentDidMount() {
        document.title = 'Organizations - ORKG';
        this.loadOrganizations();
    }

    loadOrganizations = () => {
        this.setState({ isNextPageLoading: true });
        getAllOrganizations()
            .then(organizationsData => {
                if (organizationsData.length > 0) {
                    this.setState({
                        organizations: organizationsData,
                        isNextPageLoading: false
                    });
                } else {
                    this.setState({
                        isNextPageLoading: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isNextPageLoading: false
                });
            });
    };

    render() {
        return (
            <>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all organizations </h1>
                    {!!this.props.user && this.props.user.isCurationAllowed && (
                        <RequireAuthentication
                            component={Link}
                            color="secondary"
                            size="sm"
                            className="btn btn-secondary btn-sm flex-shrink-0"
                            to={ROUTES.ADD_ORGANIZATION}
                        >
                            <Icon icon={faPlus} /> Create new organization
                        </RequireAuthentication>
                    )}
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    {this.state.organizations.length > 0 && (
                        <div className="mt-3 row justify-content-center">
                            {this.state.organizations.map(organization => {
                                return <OrganizationCard key={organization.display_id} organization={{ ...organization }} />;
                            })}
                        </div>
                    )}
                    {this.state.organizations.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No organizations yet!</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload))
});

Organizations.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Organizations);
