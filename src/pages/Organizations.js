import React, { Component } from 'react';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAllOrganizations, getUserInformation } from '../network';
import { openAuthDialog, updateAuth, resetAuth } from '../actions/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Cookies } from 'react-cookie';
import { Container } from 'reactstrap';
import ROUTES from '../constants/routes';
import { reverse } from 'named-urls';

class Organizations extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;
        this.state = {
            resources: [],
            results: null,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Organizations - ORKG';
        this.userInformation();
        this.loadMoreResources();
    }

    componentDidUpdate() {
        if (this.state.redirectLogout) {
            this.setState({
                redirectLogout: false
            });
        }
    }

    userInformation = () => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        if (token && !this.props.user) {
            getUserInformation()
                .then(userData => {
                    this.props.updateAuth({ user: { displayName: userData.display_name, id: userData.id, token: token, email: userData.email } });
                })
                .catch(error => {
                    cookies.remove('token');
                });
        }
    };

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });
        getAllOrganizations({
            page: this.state.page,
            items: this.pageSize,
            desc: true
        }).then(resources => {
            if (resources.length > 0) {
                this.setState({
                    resources: [...this.state.resources, ...resources],
                    isNextPageLoading: false,
                    hasNextPage: resources.length < this.pageSize ? false : true,
                    page: this.state.page + 1
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all organizations </h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        {this.props.user !== null && (
                            <Link className="float-right mb-2 mt-2 clearfix" to={ROUTES.ADD_ORGANIZATION}>
                                <span className="fa fa-plus" /> Create new organization
                            </Link>
                        )}

                        {!this.props.user && (
                            <Link style={{ color: '#111111' }} className="float-right mb-2 mt-2 clearfix">
                                <span className="fa" /> Signin to create organization
                            </Link>
                        )}
                    </div>

                    {this.state.resources.length > 0 && (
                        <div>
                            {this.state.resources.map(resource => {
                                return (
                                    <ShortRecord key={resource.id} header={resource.name} href={reverse(ROUTES.ORGANIZATION, { id: resource.id })} />
                                );
                            })}
                        </div>
                    )}
                    {this.state.resources.length === 0 && !this.state.isNextPageLoading && <div className="text-center mt-4 mb-4">No Resources</div>}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                        >
                            Load more resources
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    resetAuth: () => dispatch(resetAuth()),
    openAuthDialog: action => dispatch(openAuthDialog(action)),
    updateAuth: data => dispatch(updateAuth(data))
});

Organizations.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.object,
    resetAuth: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Organizations);
