import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { getOrganization, getAllObservatoriesbyOrganizationId } from '../network';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SameAsStatements from './SameAsStatements';
import ROUTES from '../constants/routes';
import { Redirect } from 'react-router-dom';
import { reverse } from 'named-urls';

class OrganizationDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            redirect: false,
            isLoading: false,
            editMode: false,
            classes: [],
            image: '',
            resourceId: '',
            totalObservatories: '',
            url: ''
        };
    }

    componentDidMount() {
        this.findOrg();
        this.getTotalObservatories(this.props.match.params.id);
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.findOrg();
            this.getTotalObservatories(this.props.match.params.id);
        }
    };

    findOrg = () => {
        this.setState({ isLoading: true });
        getOrganization(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.organizationName} - Organization - ORKG`;
                this.setState({ label: responseJson.organizationName, isLoading: false });
                this.setState({ image: responseJson.organizationLogo, isLoading: false });
                this.setState({ resourceId: this.props.match.params.id });
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false });
            });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    handleHeaderChange = event => {
        this.setState({ label: event.value });
    };

    handleAdd = event => {
        if (event.target.value === 'listObservatories') {
            this.setState({ url: ROUTES.OBSERVATORIES });
        } else if ((event.target.value = 'addObservatory')) {
            this.setState({ url: ROUTES.ADD_OBSERVATORY });
        }

        this.navigateToResource(this.state.resourceId);
    };

    navigateToResource = resourceId => {
        this.setState({ resourceId: resourceId }, () => {
            this.setState({ redirect: true });
        });
    };

    getTotalObservatories = id => {
        this.setState({ isLoading: true });
        getAllObservatoriesbyOrganizationId(this.props.match.params.id)
            .then(responseJson => {
                this.setState({ totalObservatories: responseJson.length, isLoading: false });
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false });
            });
    };

    render() {
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: '',
                resourceId: ''
            });

            return <Redirect to={reverse(this.state.url, { id: this.state.resourceId })} />;
        }

        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                <div className="pb-2 mb-3">
                                    <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {this.state.label}

                                        <img style={{ float: 'right', marginTop: 15 }} height="100" src={this.state.image} alt="" />
                                    </h3>
                                </div>
                            </div>
                            <div className={'clearfix'}>
                                {this.state.totalObservatories ? (
                                    <div>
                                        <i>Total Observatories: {this.state.totalObservatories}</i>
                                    </div>
                                ) : (
                                    <div>No observatories yet </div>
                                )}
                                <br />
                                <Button outline size="sm" className={'mb-3'} value="listObservatories" onClick={this.handleAdd}>
                                    List Observatories
                                </Button>
                                &nbsp; &nbsp;
                                {this.props.user && (
                                    <Button outline size="sm" className={'mb-3'} value="addObservatory" onClick={this.handleAdd}>
                                        Create new observatoy
                                    </Button>
                                )}
                                <SameAsStatements />
                            </div>
                        </div>
                    </Container>
                )}
            </>
        );
    }
}

OrganizationDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    user: PropTypes.object
};

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(
    mapStateToProps,
    null
)(OrganizationDetails);

//export default OrganizationDetails;
