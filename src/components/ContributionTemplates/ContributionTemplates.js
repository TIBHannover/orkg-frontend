import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getResourcesByClass, resourcesUrl, getStatementsByObjectAndPredicate } from 'network';
import AutoComplete from './TemplateEditorAutoComplete';
import TemplateCard from './TemplateCard';
import { Container, Col, Row, FormGroup, Label, Form } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

export default class ContributionTemplates extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            contributionTemplates: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false,
            filterReseachField: null,
            filterResearchProblem: null
        };
    }

    componentDidMount() {
        document.title = 'Contribution Templates - ORKG';

        this.loadMoreContributionTemplates();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.filterReseachField !== this.state.filterReseachField || prevState.filterResearchProblem !== this.state.filterResearchProblem) {
            this.setState({ contributionTemplates: [], isNextPageLoading: false, hasNextPage: false, page: 1, isLastPageReached: false }, () =>
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
                .filter(statement => statement.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE))
                .map(st => ({ id: st.subject.id, label: st.subject.label, source: resourceId })); // return the template Object
        });
    };

    handleResearchFieldSelect = selected => {
        this.setState({
            filterReseachField: !selected ? null : selected,
            filterResearchProblem: null
        });
    };

    handleResearchProblemSelect = selected => {
        this.setState({
            filterResearchProblem: !selected ? null : selected,
            filterReseachField: null
        });
    };

    loadMoreContributionTemplates = () => {
        this.setState({ isNextPageLoading: true });
        let templates = [];
        if (this.state.filterReseachField) {
            templates = this.getTemplatesOfResourceId(this.state.filterReseachField.id, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD);
        } else if (this.state.filterResearchProblem) {
            templates = this.getTemplatesOfResourceId(this.state.filterResearchProblem.id, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM);
        } else {
            templates = getResourcesByClass({
                id: process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE,
                page: this.state.page,
                items: this.pageSize,
                sortBy: 'created_at',
                desc: true
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
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all contribution templates</h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        <Link className="float-right mb-2 mt-2 clearfix" to={reverse(ROUTES.CONTRIBUTION_TEMPLATE)}>
                            <span className="fa fa-plus" /> Create new template
                        </Link>
                    </div>

                    <Form className={'mb-3'}>
                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="exampleEmail">Filter by research field</Label>
                                    <AutoComplete
                                        requestUrl={resourcesUrl}
                                        optionsClass={process.env.REACT_APP_CLASSES_RESEARCH_FIELD}
                                        onItemSelected={this.handleResearchFieldSelect}
                                        placeholder={'Select or type to enter a research field'}
                                        autoFocus
                                        isClearable
                                        cacheOptions
                                        value={this.state.filterReseachField}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="examplePassword">Filter by reseach problem</Label>
                                    <AutoComplete
                                        requestUrl={resourcesUrl}
                                        optionsClass={process.env.REACT_APP_CLASSES_PROBLEM}
                                        onItemSelected={this.handleResearchProblemSelect}
                                        placeholder={'Select or type to enter a research problem'}
                                        autoFocus
                                        isClearable
                                        cacheOptions
                                        value={this.state.filterResearchProblem}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                    {this.state.contributionTemplates.length > 0 && (
                        <div>
                            {this.state.contributionTemplates.map(contributionTemplate => {
                                return <TemplateCard key={contributionTemplate.id} template={contributionTemplate} />;
                            })}
                        </div>
                    )}
                    {this.state.contributionTemplates.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No contribution templates</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreContributionTemplates : undefined}
                        >
                            Load more contribution templates
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
