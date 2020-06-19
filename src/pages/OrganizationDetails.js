import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { getOrganization, getAllObservatoriesbyOrganizationId } from 'network';
import InternalServerError from 'components/StaticPages/InternalServerError';
import { Link } from 'react-router-dom';
import NotFound from 'components/StaticPages/NotFound';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SameAsStatements from './SameAsStatements';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';

class OrganizationDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: false,
            isLoadingTotal: false,
            image: '',
            totalObservatories: 0,
            createdBy: ''
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
                console.log(responseJson);
                document.title = `${responseJson.name} - Organization - ORKG`;
                this.setState({
                    label: responseJson.name,
                    isLoading: false,
                    image: responseJson.logo,
                    createdBy: responseJson.created_by
                });
            })
            .catch(error => {
                this.setState({ error: error, isLoading: false });
            });
    };

    getTotalObservatories = id => {
        this.setState({ isLoadingTotal: true });
        getAllObservatoriesbyOrganizationId(this.props.match.params.id)
            .then(responseJson => {
                this.setState({ totalObservatories: responseJson.length, isLoadingTotal: false });
            })
            .catch(error => {
                this.setState({ totalObservatories: 0, isLoadingTotal: false });
            });
    };

    render() {
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
                                {!this.state.isLoadingTotal && this.state.totalObservatories ? (
                                    <div>
                                        <i>Total Observatories: {this.state.totalObservatories}</i>
                                    </div>
                                ) : (
                                    <div>No observatories yet.</div>
                                )}
                                <br />
                                <Button
                                    outline
                                    size="sm"
                                    color="primary"
                                    className="mb-3"
                                    tag={Link}
                                    to={reverse(ROUTES.OBSERVATORIES, { id: this.props.match.params.id })}
                                >
                                    List observatories
                                </Button>
                                &nbsp; &nbsp;
                                {this.props.user && this.props.user.id === this.state.createdBy && (
                                    <Button
                                        outline
                                        size="sm"
                                        color="primary"
                                        className="mb-3"
                                        tag={Link}
                                        to={reverse(ROUTES.ADD_OBSERVATORY, { id: this.props.match.params.id })}
                                    >
                                        Create new observatory
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
