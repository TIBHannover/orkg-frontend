import React, { Component } from 'react';
import { Container, Button, Form, FormGroup, Label, FormText, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import {
    getResource,
    predicatesUrl,
    getStatementsBySubject,
    resourcesUrl,
    createResource,
    createPredicate,
    updateResource,
    deleteStatementsByIds,
    createResourceStatement
} from 'network';
import { EditModeHeader, Title } from 'components/ViewPaper/ViewPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faSpinner, faTrash, faInfo } from '@fortawesome/free-solid-svg-icons';
import styled, { withTheme } from 'styled-components';
import ROUTES from 'constants/routes.js';
import Confirm from 'reactstrap-confirm';
import { toast } from 'react-toastify';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import AutoComplete from './TemplateEditorAutoComplete';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';

export const StyledContainer = styled(Container)`
    fieldset.scheduler-border {
        border: 1px groove #ddd !important;
        padding: 0 1.4em 1.4em 1.4em !important;
        margin: 0 0 1.5em 0 !important;
        -webkit-box-shadow: 0px 0px 0px 0px #000;
        box-shadow: 0px 0px 0px 0px #000;
    }

    legend.scheduler-border {
        font-size: 1.2em !important;
        font-weight: bold !important;
        text-align: left !important;
        width: auto;
        padding: 0 10px;
        border-bottom: none;
    }
`;

export const StyledAutoCompleteInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    &.default {
        height: auto !important;
        min-height: calc(1.8125rem + 4px);
    }
    cursor: text;
    padding: 0 !important;
`;

class ContributionTemplate extends Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            error: null,
            label: '',
            isLoading: false,
            isSaving: false,
            editMode: this.props.match.params.id ? false : true,
            templatePredicate: null,
            templateResearchFields: [],
            templateResearchProblems: [],
            templateProperties: [],
            templateSubTemplates: [],
            statements: [],
            modal: false,
            dialogTemplateId: null,
            dialogTemplateLabel: null
        };
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            this.findTemplate();
            if (this.state.editMode === true) {
                this.inputRef.current.focus();
            }
        } else {
            this.inputRef.current.focus();
        }
    }

    openStatementBrowser = (id, label) => {
        this.setState({
            modal: true,
            dialogResourceId: id,
            dialogResourceLabel: label
        });
    };

    findTemplate = () => {
        this.setState({ isLoading: true });
        getResource(this.props.match.params.id)
            .then(responseJson => {
                document.title = `${responseJson.label} - Template - ORKG`;
                this.setState({ label: responseJson.label, isLoading: false });
                this.getTemplateDetails().then(details => {
                    this.setState(details);
                });
            })
            .catch(error => {
                this.setState({ label: null, isLoading: false, error: error });
            });
    };

    getTemplateDetails = () => {
        return getStatementsBySubject({ id: this.props.match.params.id }).then(templateStaments => {
            const templatePredicate = templateStaments.find(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_PREDICATE);
            return {
                statements: templateStaments.map(s => s.id),
                templatePredicate: templatePredicate
                    ? {
                          id: templatePredicate.object.id,
                          label: templatePredicate.object.label
                      }
                    : {},
                templateProperties: templateStaments
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_PROPERTY)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    })),
                templateResearchFields: templateStaments
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    })),
                templateResearchProblems: templateStaments
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    })),
                templateSubTemplates: templateStaments
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_SUB_TEMPLATE)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    }))
            };
        });
    };

    handleChangeLabel = event => {
        this.setState({ label: event.target.value });
    };

    handlePropertySelect = async (selected, action) => {
        if (action.action === 'select-option') {
            this.setState({
                templatePredicate: selected
            });
        } else if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createPredicate(selected.label);
                selected.id = newPredicate.id;
                this.setState({
                    templatePredicate: selected
                });
            }
        }
    };

    handleResearchFieldSelect = selected => {
        this.setState({
            templateResearchFields: !selected ? [] : selected
        });
    };
    handleResearchProblemSelect = selected => {
        this.setState({
            templateResearchProblems: !selected ? [] : selected
        });
    };

    handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createPredicate(selected.label);
                selected = { id: newPredicate.id, label: selected.label };
                this.setState(state => {
                    const templateProperties = state.templateProperties.map((item, j) => {
                        if (j === index) {
                            item = !selected ? null : selected;
                        }
                        return item;
                    });
                    return {
                        templateProperties
                    };
                });
            }
        } else {
            this.setState(state => {
                const templateProperties = state.templateProperties.map((item, j) => {
                    if (j === index) {
                        item = !selected ? null : selected;
                    }
                    return item;
                });
                return {
                    templateProperties
                };
            });
        }
    };

    handleSubTemplatesSelect = (selected, index) => {
        this.setState(state => {
            const templateSubTemplates = state.templateSubTemplates.map((item, j) => {
                if (j === index) {
                    item = !selected ? null : selected;
                }
                return item;
            });
            return {
                templateSubTemplates
            };
        });
    };

    handleSave = async () => {
        const promises = [];
        this.setState({ isSaving: true, editMode: false });
        let templateResource;
        if (!this.props.match.params.id) {
            templateResource = await createResource(this.state.label, [process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE]);
            templateResource = templateResource.id;
        } else {
            templateResource = this.props.match.params.id;
            await updateResource(templateResource, this.state.label);
        }
        // delete all the statement
        if (this.props.match.params.id) {
            if (this.state.statements.length > 0) {
                promises.push(deleteStatementsByIds(this.state.statements));
            }
        }
        // We use reverse() to create statements to keep the order of elements inside the input field
        // save template predicate
        if (this.state.templatePredicate) {
            promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_PREDICATE, this.state.templatePredicate.id));
        }
        // save template research fields
        if (this.state.templateResearchFields && this.state.templateResearchFields.length > 0) {
            for (const researchField of this.state.templateResearchFields.reverse()) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD, researchField.id));
            }
        }
        // save template research problems
        if (this.state.templateResearchProblems && this.state.templateResearchProblems.length > 0) {
            for (const researchProblem of this.state.templateResearchProblems.reverse()) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM, researchProblem.id));
            }
        }
        // save template properties
        if (this.state.templateProperties && this.state.templateProperties.length > 0) {
            for (const property of this.state.templateProperties.filter(tp => tp.id).reverse()) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_PROPERTY, property.id));
            }
        }
        // save template sub templates
        if (this.state.templateSubTemplates && this.state.templateSubTemplates.length > 0) {
            for (const subtemplate of this.state.templateSubTemplates.filter(st => st.id).reverse()) {
                promises.push(createResourceStatement(templateResource, process.env.REACT_APP_TEMPLATE_SUB_TEMPLATE, subtemplate.id));
            }
        }
        Promise.all(promises).then(() => {
            if (this.props.match.params.id) {
                toast.success('Contribution Template updated successfully');
            } else {
                toast.success('Contribution Template created successfully');
            }
            this.setState({ isSaving: false });
            if (!this.props.match.params.id) {
                this.props.history.push(reverse(ROUTES.CONTRIBUTION_TEMPLATE, { id: templateResource }));
            }
        });
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    addTemplateProperty = () => {
        this.setState(state => {
            const templateProperties = [...state.templateProperties, {}];
            return {
                templateProperties
            };
        });
    };

    deleteTemplateProperty = index => {
        this.setState(state => {
            const templateProperties = state.templateProperties.filter((item, j) => index !== j);
            return {
                templateProperties
            };
        });
    };

    addSubTemplate = () => {
        this.setState(state => {
            const templateSubTemplates = [...state.templateSubTemplates, {}];
            return {
                templateSubTemplates
            };
        });
    };

    deleteSubTemplate = index => {
        this.setState(state => {
            const templateSubTemplates = state.templateSubTemplates.filter((item, j) => index !== j);
            return {
                templateSubTemplates
            };
        });
    };

    render() {
        return (
            <StyledContainer className="clearfix">
                <h1 className="h4 mt-4 mb-4 flex-grow-1">{!this.props.match.params.id ? 'Create new template' : 'Template'}</h1>
                {this.props.match.params.id && this.state.editMode && (
                    <EditModeHeader className="box">
                        <Title>Edit mode</Title>
                    </EditModeHeader>
                )}
                <div className={'box clearfix pt-4 pb-4 pl-5 pr-5'}>
                    <div className={'mb-2'}>
                        {!this.state.editMode ? (
                            <h3 className={'pb-2 mb-3'} style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {this.state.label}
                                <Button className="float-right" color="darkblue" size="sm" onClick={() => this.toggle('editMode')}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            </h3>
                        ) : (
                            ''
                        )}
                    </div>
                    <Form>
                        <FormGroup className="mb-4">
                            <Label>Name of template</Label>
                            <Input
                                innerRef={ref => (this.inputRef.current = ref)}
                                value={this.state.label}
                                onChange={this.handleChangeLabel}
                                disabled={!this.state.editMode}
                            />
                        </FormGroup>
                        <FormGroup className="mb-4">
                            <Label>Property</Label>
                            <AutoComplete
                                allowCreate
                                requestUrl={predicatesUrl}
                                onItemSelected={this.handlePropertySelect}
                                placeholder={this.state.editMode ? 'Select or type to enter a property' : 'No Properties'}
                                autoFocus
                                cacheOptions
                                value={this.state.templatePredicate}
                                isDisabled={!this.state.editMode}
                            />
                            {this.state.editMode && <FormText>Specify the property of this template.</FormText>}
                        </FormGroup>
                        <fieldset className="scheduler-border">
                            <legend className="scheduler-border">Template use cases</legend>
                            <FormGroup className="mb-4">
                                <Label>Research fields</Label>
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    optionsClass={process.env.REACT_APP_CLASSES_RESEARCH_FIELD}
                                    onItemSelected={this.handleResearchFieldSelect}
                                    placeholder={this.state.editMode ? 'Select or type to enter a research field' : 'No research fields'}
                                    autoFocus
                                    cacheOptions
                                    isMulti
                                    value={this.state.templateResearchFields}
                                    isDisabled={!this.state.editMode}
                                />
                                {this.state.editMode && <FormText>Specify the research fields that uses this template.</FormText>}
                            </FormGroup>
                            <FormGroup className="mb-4">
                                <Label>Research problems</Label>
                                <AutoComplete
                                    requestUrl={resourcesUrl}
                                    optionsClass={process.env.REACT_APP_CLASSES_PROBLEM}
                                    onItemSelected={this.handleResearchProblemSelect}
                                    placeholder={this.state.editMode ? 'Select or type to enter a research problem' : 'No research problem'}
                                    autoFocus
                                    cacheOptions
                                    isMulti
                                    value={this.state.templateResearchProblems}
                                    isDisabled={!this.state.editMode}
                                />
                                {this.state.editMode && <FormText>Specify the research problems that uses this template.</FormText>}
                            </FormGroup>
                        </fieldset>
                        <fieldset className="scheduler-border">
                            <legend className="scheduler-border">Template data</legend>
                            <FormGroup className="mb-4">
                                <Label>Properties {this.state.editMode && <FormText>List the properties of this template.</FormText>}</Label>
                                <div className={'clearfix mb-3'} />
                                {this.state.templateProperties &&
                                    this.state.templateProperties.length > 0 &&
                                    this.state.templateProperties.map((templateProperty, index) => {
                                        return (
                                            <InputGroup className={'mt-2 mb-2'} key={`property-${index}`}>
                                                <InputGroupAddon addonType="prepend">{`${index + 1}`}</InputGroupAddon>
                                                <AutoComplete
                                                    requestUrl={predicatesUrl}
                                                    placeholder={this.state.editMode ? 'Select or type to enter a property' : 'No properties'}
                                                    onItemSelected={(selected, action) => this.handlePropertiesSelect(selected, action, index)}
                                                    onKeyUp={() => {}}
                                                    allowCreate
                                                    autoFocus
                                                    value={templateProperty}
                                                    isDisabled={!this.state.editMode}
                                                />

                                                {this.state.editMode && (
                                                    <InputGroupAddon addonType="append">
                                                        <Button outline color="danger" onClick={() => this.deleteTemplateProperty(index)}>
                                                            <Icon icon={faTrash} />
                                                        </Button>
                                                    </InputGroupAddon>
                                                )}
                                            </InputGroup>
                                        );
                                    })}
                                {!this.state.editMode && this.state.templateProperties && this.state.templateProperties.length === 0 && (
                                    <i>
                                        <small>No properties specified.</small>
                                    </i>
                                )}
                                {this.state.editMode && (
                                    <Button outline size="sm" className={'mb-3'} onClick={this.addTemplateProperty}>
                                        Add property
                                    </Button>
                                )}
                            </FormGroup>
                            <hr />
                            <FormGroup className="mb-4">
                                <Label>Sub-Templates {this.state.editMode && <FormText>List the sub-templates of this template.</FormText>}</Label>
                                <div className={'clearfix mb-3'} />
                                {this.state.templateSubTemplates &&
                                    this.state.templateSubTemplates.length > 0 &&
                                    this.state.templateSubTemplates.map((templateSubTemplate, index) => {
                                        return (
                                            <div key={`subtemplate-${index}`}>
                                                <InputGroup className={'mt-2 mb-2'}>
                                                    <InputGroupAddon addonType="prepend">{`${index + 1}`}</InputGroupAddon>
                                                    <AutoComplete
                                                        requestUrl={resourcesUrl}
                                                        optionsClass={process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}
                                                        placeholder={
                                                            this.state.editMode
                                                                ? 'Select or type to enter a contribution template'
                                                                : 'No sub template'
                                                        }
                                                        onItemSelected={selected => this.handleSubTemplatesSelect(selected, index)}
                                                        onKeyUp={() => {}}
                                                        value={templateSubTemplate}
                                                        isDisabled={!this.state.editMode}
                                                    />
                                                    {templateSubTemplate.id && (
                                                        <InputGroupAddon addonType="append">
                                                            <Button
                                                                outline
                                                                color="info"
                                                                onClick={() =>
                                                                    this.openStatementBrowser(templateSubTemplate.id, templateSubTemplate.label)
                                                                }
                                                            >
                                                                <Icon icon={faInfo} />
                                                            </Button>
                                                        </InputGroupAddon>
                                                    )}
                                                    {this.state.editMode && (
                                                        <InputGroupAddon addonType="append">
                                                            <Button outline color="danger" onClick={() => this.deleteSubTemplate(index)}>
                                                                <Icon icon={faTrash} />
                                                            </Button>
                                                        </InputGroupAddon>
                                                    )}
                                                </InputGroup>
                                            </div>
                                        );
                                    })}
                                {!this.state.editMode && this.state.templateSubTemplates && this.state.templateSubTemplates.length === 0 && (
                                    <i>
                                        <small>No sub-templates specified.</small>
                                    </i>
                                )}
                                {this.state.editMode && (
                                    <Button outline size="sm" className={'mb-3'} onClick={this.addSubTemplate}>
                                        Add sub-template
                                    </Button>
                                )}
                            </FormGroup>
                        </fieldset>
                        {this.state.modal && (
                            <StatementBrowserDialog
                                show={this.state.modal}
                                enableEdit={this.state.enableEdit}
                                toggleModal={() => this.toggle('modal')}
                                resourceId={this.state.dialogResourceId}
                                resourceLabel={this.state.dialogResourceLabel}
                            />
                        )}
                        {(this.state.editMode || this.state.isSaving) && (
                            <>
                                <hr className="mt-5 mb-3" />
                                <Button disabled={this.state.isSaving} color="primary" className="float-right mb-4" onClick={this.handleSave}>
                                    {this.state.isSaving && <Icon icon={faSpinner} spin />}
                                    {!this.state.isSaving ? ' Save Template' : ' Saving'}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </StyledContainer>
        );
    }
}

ContributionTemplate.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string
        })
    }),
    theme: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default withTheme(ContributionTemplate);
