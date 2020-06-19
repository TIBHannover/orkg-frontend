import React, { Component } from 'react';
import { Container, Button } from 'reactstrap';
import { getPredicate } from 'network';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import InternalServerError from 'components/StaticPages/InternalServerError';
import NotFound from 'components/StaticPages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import PropTypes from 'prop-types';

class PredicateDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: true,
            editMode: false
        };
    }

    componentDidMount() {
        this.findPredicate();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.findPredicate();
        }
    };

    findPredicate = async () => {
        this.setState({ isLoading: true });
        try {
            const responseJson = await getPredicate(this.props.match.params.id);
            document.title = `${responseJson.label} - Predicate - ORKG`;
            this.setState({
                label: responseJson.label,
                isLoading: false
            });
        } catch (err) {
            console.error(err);
            this.setState({
                label: null,
                isLoading: false,
                error: err
            });
        }
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    render() {
        return (
            <>
                {this.state.isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && (
                    <Container className="mt-5 clearfix">
                        {this.state.editMode && (
                            <EditModeHeader className="box rounded-top">
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
                        <div className={'box rounded clearfix pt-4 pb-4 pl-5 pr-5'}>
                            <div className={'mb-2'}>
                                <div className="pb-2 mb-3">
                                    <h3 className={''} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {this.state.label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                        <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}>
                                            <Icon icon={faPen} /> Edit
                                        </Button>
                                    </h3>
                                </div>
                            </div>
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className={'clearfix'}>
                                <StatementBrowser
                                    rootNodeType={'predicate'}
                                    enableEdit={this.state.editMode}
                                    syncBackend={this.state.editMode}
                                    openExistingResourcesInDialog={false}
                                    initialResourceId={this.props.match.params.id}
                                    initialResourceLabel={this.state.label}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                />
                            </div>
                        </div>
                    </Container>
                )}
            </>
        );
    }
}

PredicateDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default PredicateDetails;
