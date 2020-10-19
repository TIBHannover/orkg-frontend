import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import OrganizationCard from 'components/OrganizationCard/OrganizationCard';
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
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all organizations </h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    <div className="clearfix">
                        {this.props.user !== null && (
                            <Link className="float-right mb-2 mt-2 clearfix" to={ROUTES.ADD_ORGANIZATION}>
                                <span className="fa fa-plus" /> Create new organization
                            </Link>
                        )}

                        {!this.props.user && (
                            <Button color="link" className="p-0 float-right mb-2 mt-2 clearfix" onClick={() => this.props.openAuthDialog('signin')}>
                                <Icon className="mr-1" icon={faUser} /> Sign in to create an organization
                            </Button>
                        )}
                    </div>

                    {this.state.organizations.length > 0 && (
                        <div className="mt-3 row justify-content-center">
                            {this.state.organizations.map(organization => {
                                return <OrganizationCard key={organization.id} organization={{ ...organization }} />;
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
    openAuthDialog: action => dispatch(openAuthDialog(action))
});

Organizations.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Organizations);
