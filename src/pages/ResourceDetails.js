import React, { Component } from 'react';
import { Container, Button, FormGroup, Label, FormText, Table, Collapse } from 'reactstrap';
import { getResource, classesUrl, submitGetRequest, createClass, updateResourceClasses } from 'network';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import EditableHeader from 'components/EditableHeader';
import InternalServerError from 'components/StaticPages/InternalServerError';
import NotFound from 'components/StaticPages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import Confirm from 'reactstrap-confirm';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import SameAsStatements from './SameAsStatements';
import { orderBy } from 'lodash';
import { getStatementsByObject } from 'network';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';

class ResourceDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            label: '',
            isLoading: true,
            editMode: false,
            classes: [],
            objectStatements: [],
            objectStatementsOpen: false
        };
    }

    componentDidMount() {
        this.findResource();
        this.loadStatementByObject();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.findResource();
            this.loadStatementByObject();
        }
    };

    findResource = () => {
        this.setState({ isLoading: true });
        getResource(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.label} - Resource - ORKG`;
                const classesCalls = responseJson.classes.map(classResource => submitGetRequest(`${classesUrl}${classResource}`));
                Promise.all(classesCalls).then(classes => {
                    classes = orderBy(classes, [classLabel => classLabel.label.toLowerCase()], ['asc']);
                    this.setState({ label: responseJson.label, isLoading: false, classes: classes });
                });
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

    handleClassSelect = async (selected, action) => {
        if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new class?',
                message: 'Often there are existing classes that you can use as well. It is better to use existing classes than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                const newClass = await createClass(selected[foundIndex].label);
                selected[foundIndex] = newClass;
            }
        }
        this.setState(
            {
                classes: !selected ? [] : selected
            },
            async () => {
                await updateResourceClasses(this.props.match.params.id, this.state.classes.map(c => c.id));
                toast.success('Resource classes updated successfully');
            }
        );
    };

    handleHeaderChange = event => {
        this.setState({ label: event.value });
    };

    loadStatementByObject = () => {
        getStatementsByObject({
            id: this.props.match.params.id,
            page: 1,
            items: 15,
            sortBy: 'id',
            desc: true
        }).then(result => {
            this.setState({
                objectStatements: result
            });
        });
    };

    toggleCollapse = () => {
        this.setState(prevState => ({
            objectStatementsOpen: !prevState.objectStatementsOpen
        }));
    };

    render() {
        const id = this.props.match.params.id;
        return (
            <>
                {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
                {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
                {!this.state.isLoading && !this.state.error && (
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
                                            {this.state.label || (
                                                <i>
                                                    <small>No label</small>
                                                </i>
                                            )}
                                            <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}>
                                                <Icon icon={faPen} /> Edit
                                            </Button>
                                        </h3>
                                        {this.state.classes.length > 0 && (
                                            <span style={{ fontSize: '90%' }}>
                                                Classes:{' '}
                                                {this.state.classes.map((classObject, index) => {
                                                    const separator = index < this.state.classes.length - 1 ? ', ' : '';

                                                    return (
                                                        <i key={index}>
                                                            {classObject.label}
                                                            {separator}
                                                        </i>
                                                    );
                                                })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
                                        <FormGroup className="mb-4">
                                            <Label>Classes:</Label>
                                            <AutoComplete
                                                allowCreate
                                                requestUrl={classesUrl}
                                                onItemSelected={this.handleClassSelect}
                                                cacheOptions
                                                isMulti
                                                value={this.state.classes}
                                            />
                                            {this.state.editMode && <FormText>Specify the classes of the resource.</FormText>}
                                        </FormGroup>
                                    </>
                                )}
                            </div>
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className={'clearfix'}>
                                <StatementBrowser
                                    enableEdit={this.state.editMode}
                                    syncBackend={this.state.editMode}
                                    openExistingResourcesInDialog={false}
                                    initialResourceId={this.props.match.params.id}
                                    initialResourceLabel={this.state.label}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                />

                                <SameAsStatements />
                            </div>
                            <Button color="darkblue" size="sm" className="mt-5" onClick={this.toggleCollapse}>
                                {!this.state.objectStatementsOpen ? 'Show' : 'Hide'} object statements ({this.state.objectStatements.length})
                            </Button>
                            <Collapse isOpen={this.state.objectStatementsOpen}>
                                <h3 className="h5 mt-3">Statements with this resource as object</h3>
                                <Table size="sm" bordered>
                                    <thead>
                                        <tr>
                                            <th width="33%">Subject</th>
                                            <th width="33%">Predicate</th>
                                            <th width="33%">Object</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.objectStatements.map(statement => (
                                            <tr key={statement.id}>
                                                <td>
                                                    <Link to={reverse(ROUTES.RESOURCE, { id: statement.subject.id })}>{statement.subject.label}</Link>
                                                </td>
                                                <td>
                                                    <Link to={reverse(ROUTES.PREDICATE, { id: statement.predicate.id })}>
                                                        {statement.predicate.label}
                                                    </Link>
                                                </td>
                                                <td>{statement.object.label}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Collapse>
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
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default ResourceDetails;
