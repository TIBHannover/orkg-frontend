import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { getOrganization, getAllObservatoriesbyOrganizationId } from '../network';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
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
        }
    };

    findOrg = () => {
        //alert(this.props.match.params.id);
        this.setState({ isLoading: true });
        getOrganization(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.organizationName} - Org - ORKG`;
                this.setState({ label: responseJson.organizationName, isLoading: false });
                this.setState({ image: responseJson.organizationLogo, isLoading: false });
                this.setState({ resourceId: this.props.match.params.id });
                //this.getTotalObservatories(this.props.match.params.id);
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
        //await this.createNewResource(false);
        //else {
        //console.log('this is a DOI');
        //this.doi = this.state.value;
        //await this.createResourceUsingDoi();
        //}
    };

    navigateToResource = resourceId => {
        //alert(resourceId);
        this.setState({ resourceId: resourceId }, () => {
            this.setState({ redirect: true });
        });
        //this.setState({ redirect: true });
        //this.setState({redirect: ROUTES.ADD_ORGANIZATION})
        //return <Redirect to={ROUTES.ADD_ORGANIZATION}  />
    };

    getTotalObservatories = id => {
        //alert(this.props.match.params.id);
        this.setState({ isLoading: true });
        getAllObservatoriesbyOrganizationId(this.props.match.params.id)
            .then(responseJson => {
                //document.title = `${responseJson.organizationName} - Org - ORKG`;
                this.setState({ totalObservatories: responseJson.length, isLoading: false });
                //this.setState({ image: responseJson.organizationLogo, isLoading: false});
                //this.setState({ resourceId: this.props.match.params.id});
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false });
            });
    };

    render() {
        const id = this.props.match.params.id;

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
                        {this.state.editMode && (
                            <EditModeHeader className="box">
                                <Title>
                                    Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                                </Title>
                                <Button
                                    className="float-left"
                                    style={{ marginLeft: 1 }}
                                    color="light"
                                    size="sm"
                                    onClick={() => this.toggle('editMode')}
                                >
                                    Stop editing
                                </Button>
                            </EditModeHeader>
                        )}
                        <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                {!this.state.editMode ? (
                                    <div className="pb-2 mb-3">
                                        <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                            {/* <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}> */}
                                            {/* <Icon icon={faPen} /> Edit */}
                                            {/* </Button> */}

                                            {this.state.label}

                                            <img style={{ float: 'right', marginTop: 15 }} height="100" src={this.state.image} alt="" />
                                        </h3>
                                        {this.state.classes.length > 0 && (
                                            <span style={{ fontSize: '90%' }}>
                                                Classes:{' '}
                                                {this.state.classes.map((className, index) => {
                                                    const separator = index < this.state.classes.length - 1 ? ', ' : '';

                                                    return (
                                                        <i key={index}>
                                                            {className}
                                                            {separator}
                                                        </i>
                                                    );
                                                })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                )}
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
