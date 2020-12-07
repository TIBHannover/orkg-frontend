import React, { Component } from 'react';
import { Container, Col, Row, FormGroup, Label, Form, Input, ListGroup, ListGroupItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { faAngleDoubleDown, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import TemplateCard from 'components/ContributionTemplates/TemplateCard';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';

export default class ContributionTemplates extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            contributionTemplates: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 0,
            isLastPageReached: false,
            filterReseachField: null,
            filterResearchProblem: null,
            filterClass: null,
            filterLabel: ''
        };
    }

    componentDidMount() {
        document.title = 'Contribution Templates - ORKG';

        this.loadMoreContributionTemplates();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (
            prevState.filterReseachField !== this.state.filterReseachField ||
            prevState.filterResearchProblem !== this.state.filterResearchProblem ||
            prevState.filterClass !== this.state.filterClass ||
            prevState.filterLabel !== this.state.filterLabel
        ) {
            this.setState({ contributionTemplates: [], isNextPageLoading: false, hasNextPage: false, page: 0, isLastPageReached: false }, () =>
                this.loadMoreContributionTemplates()
            );
        }
    };

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    getTemplatesOfResourceId = (resourceId, predicateId) => {
        return getStatementsByObjectAndPredicate({
            objectId: resourceId,
            predicateId: predicateId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(statements => {
            // Filter statement with subjects of type Contribution Template
            return statements
                .filter(statement => statement.subject.classes.includes(CLASSES.CONTRIBUTION_TEMPLATE))
                .map(st => ({ id: st.subject.id, label: st.subject.label, source: resourceId })); // return the template Object
        });
    };

    handleResearchFieldSelect = selected => {
        this.setState({
            filterReseachField: !selected ? null : selected,
            filterResearchProblem: null,
            filterClass: null,
            filterLabel: ''
        });
    };

    handleResearchProblemSelect = selected => {
        this.setState({
            filterResearchProblem: !selected ? null : selected,
            filterReseachField: null,
            filterClass: null,
            filterLabel: ''
        });
    };

    handleClassSelect = selected => {
        this.setState({
            filterResearchProblem: null,
            filterReseachField: null,
            filterClass: !selected ? null : selected,
            filterLabel: ''
        });
    };

    handleLabelFilter = e => {
        this.setState({
            filterResearchProblem: null,
            filterReseachField: null,
            filterClass: null,
            filterLabel: e.target.value
        });
    };

    loadMoreContributionTemplates = () => {
        this.setState({ isNextPageLoading: true });
        let templates = [];
        if (this.state.filterReseachField) {
            templates = this.getTemplatesOfResourceId(this.state.filterReseachField.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD);
        } else if (this.state.filterResearchProblem) {
            templates = this.getTemplatesOfResourceId(this.state.filterResearchProblem.id, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM);
        } else if (this.state.filterClass) {
            templates = this.getTemplatesOfResourceId(this.state.filterClass.id, PREDICATES.TEMPLATE_OF_CLASS);
        } else {
            templates = getResourcesByClass({
                id: CLASSES.CONTRIBUTION_TEMPLATE,
                page: this.state.page,
                q: this.state.filterLabel,
                items: this.pageSize,
                sortBy: 'created_at',
                desc: true,
                returnContent: true
            });
        }

        templates.then(contributionTemplates => {
            if (contributionTemplates.length > 0) {
                this.setState({
                    contributionTemplates: [...this.state.contributionTemplates, ...contributionTemplates],
                    isNextPageLoading: false,
                    hasNextPage: contributionTemplates.length < this.pageSize ? false : true,
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
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all contribution templates</h1>
                    <RequireAuthentication
                        component={Link}
                        color="darkblue"
                        size="sm"
                        className="btn btn-darkblue btn-sm flex-shrink-0"
                        to={reverse(ROUTES.CONTRIBUTION_TEMPLATE)}
                    >
                        <Icon icon={faPlus} /> Create template
                    </RequireAuthentication>
                </Container>
                <Container className="box rounded pt-4 pb-2 pl-5 pr-5 clearfix">
                    <Form className="mb-3">
                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="exampleEmail">Filter by research field</Label>
                                    <AutoComplete
                                        entityType={ENTITIES.RESOURCE}
                                        optionsClass={CLASSES.RESEARCH_FIELD}
                                        placeholder="Select or type to enter a research field"
                                        onChange={this.handleResearchFieldSelect}
                                        value={this.state.filterReseachField}
                                        autoLoadOption={true}
                                        openMenuOnFocus={true}
                                        allowCreate={false}
                                        isClearable
                                        autoFocus={false}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="examplePassword">Filter by reseach problem</Label>
                                    <AutoComplete
                                        entityType={ENTITIES.RESOURCE}
                                        optionsClass={CLASSES.PROBLEM}
                                        placeholder="Select or type to enter a research problem"
                                        onChange={this.handleResearchProblemSelect}
                                        value={this.state.filterResearchProblem}
                                        autoLoadOption={true}
                                        openMenuOnFocus={true}
                                        allowCreate={false}
                                        isClearable
                                        autoFocus={false}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="filterLabel">Filter by Label</Label>
                                    <Input value={this.state.filterLabel} type="text" name="filterLabel" onChange={this.handleLabelFilter} />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="examplePassword">Filter by class</Label>
                                    <AutoComplete
                                        entityType={ENTITIES.CLASS}
                                        placeholder="Select or type to enter a class"
                                        onChange={this.handleClassSelect}
                                        value={this.state.filterClass}
                                        autoLoadOption={true}
                                        openMenuOnFocus={true}
                                        allowCreate={false}
                                        isClearable
                                        autoFocus={false}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </Container>
                <Container className="p-0 mt-4">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.contributionTemplates.length > 0 && (
                            <div>
                                {this.state.contributionTemplates.map(contributionTemplate => {
                                    return <TemplateCard key={contributionTemplate.id} template={contributionTemplate} />;
                                })}
                            </div>
                        )}
                        {this.state.contributionTemplates.length === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No contribution templates
                            </ListGroupItem>
                        )}
                        {this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </ListGroupItem>
                        )}
                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                            <ListGroupItem
                                style={{ cursor: 'pointer' }}
                                className="text-center"
                                action
                                onClick={!this.state.isNextPageLoading ? this.loadMoreContributionTemplates : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more templates
                            </ListGroupItem>
                        )}
                        {!this.state.hasNextPage && this.state.isLastPageReached && (
                            <ListGroupItem tag="div" className="text-center">
                                You have reached the last page.
                            </ListGroupItem>
                        )}
                    </ListGroup>
                </Container>
            </>
        );
    }
}
