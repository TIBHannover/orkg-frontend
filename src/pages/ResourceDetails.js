import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { getResource } from '../network';
import StatementBrowser from '../components/StatementBrowser/Statements';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import PropTypes from 'prop-types';

class ResourceDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: false,
            editMode: false
        };
    }

    componentDidMount() {
        this.findResource();
    }

    findResource = () => {
        this.setState({ isLoading: true });
        getResource(this.props.match.params.resourceId)
            .then(responseJson => {
                document.title = `${responseJson.label} - Resource - ORKG`;
                this.setState({ label: responseJson.label, isLoading: false });
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false, error: error });
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

    render() {
        const id = this.props.match.params.resourceId;
        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && this.state.label && (
                    <Container className="mt-5 clearfix">
                        {this.state.editMode && (
                            <EditModeHeader className="box">
                                <Title>Edit mode</Title>
                                <Button
                                    className="float-left"
                                    style={{ marginLeft: 1 }}
                                    color="light"
                                    size="sm"
                                    onClick={() => this.toggle('editMode')}
                                >
                                    Finish
                                </Button>
                            </EditModeHeader>
                        )}
                        <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                {!this.state.editMode ? (
                                    <h3 className={'pb-2 mb-3'}>
                                        {this.state.label}
                                        <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}>
                                            <Icon icon={faPen} /> Edit
                                        </Button>
                                    </h3>
                                ) : (
                                    <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                )}
                            </div>
                            <div className={'clearfix'}>
                                <StatementBrowser
                                    enableEdit={this.state.editMode}
                                    syncBackend={this.state.editMode}
                                    openExistingResourcesInDialog={false}
                                    initialResourceId={this.props.match.params.resourceId}
                                    initialResourceLabel={this.state.label}
                                />
                            </div>
                        </div>
                    </Container>
                )}
            </>
        );
    }
}

ResourceDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            resourceId: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default ResourceDetails;
