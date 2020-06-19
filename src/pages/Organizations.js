import React, { Component } from 'react';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { getAllOrganizations } from 'network';
import { openAuthDialog } from 'actions/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Button } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';

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
            .then(organizations => {
                if (organizations.length > 0) {
                    this.setState({
                        organizations: organizations,
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
                <Container className={'box rounded pt-4 pb-4 pl-5 pr-5 clearfix'}>
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
                        <div>
                            {this.state.organizations.map(organization => {
                                return (
                                    <ShortRecord
                                        key={organization.id}
                                        header={organization.name}
                                        href={reverse(ROUTES.ORGANIZATION, { id: organization.id })}
                                    />
                                );
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
