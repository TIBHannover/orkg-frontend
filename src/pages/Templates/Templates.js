import { useState, useEffect, useRef } from 'react';
import { Container, Col, Row, FormGroup, Label, Form, Input, ListGroup, ListGroupItem, Alert } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { faAngleDoubleDown, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import TemplateCard from 'components/Templates/TemplateCard';
import { reverse } from 'named-urls';
import { debounce } from 'lodash';
import ROUTES from 'constants/routes';
import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';

const Templates = () => {
    const pageSize = 25;
    const [templates, setTemplates] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const [filterResearchField, setFilterResearchField] = useState(null);
    const [filterResearchProblem, setFilterResearchProblem] = useState(null);
    const [filterClass, setFilterClass] = useState(null);
    const [filterLabel, setFilterLabel] = useState('');

    useEffect(() => {
        document.title = 'Templates - ORKG';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = (resourceId, predicateId) => {
        return getStatementsByObjectAndPredicate({
            objectId: resourceId,
            predicateId: predicateId,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
            returnContent: false
        }).then(statements => {
            // Filter statement with subjects of type Template
            return {
                ...statements,
                content: statements.content
                    .filter(statement => statement.subject.classes.includes(CLASSES.TEMPLATE))
                    .map(st => ({ id: st.subject.id, label: st.subject.label, source: resourceId }))
            }; // return the template Object
        });
    };

    const loadMoreTemplates = (researchField, researchProblem, fClass, label) => {
        setIsNextPageLoading(true);
        let apiCalls = [];
        if (researchField) {
            apiCalls = getTemplatesOfResourceId(researchField.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD);
        } else if (researchProblem) {
            apiCalls = getTemplatesOfResourceId(researchProblem.id, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM);
        } else if (fClass) {
            apiCalls = getTemplatesOfResourceId(fClass.id, PREDICATES.TEMPLATE_OF_CLASS);
        } else {
            apiCalls = getResourcesByClass({
                id: CLASSES.TEMPLATE,
                page: page,
                q: label,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            });
        }

        apiCalls.then(result => {
            setTemplates(prevTemplates => [...prevTemplates, ...result.content]);
            setIsNextPageLoading(false);
            setHasNextPage(!result.last);
            setIsLastPageReached(result.last);
            setPage(prevPage => prevPage + 1);
            setTotalElements(result.totalElements);
        });
    };

    const debouncedGetLoadMoreResults = useRef(debounce(loadMoreTemplates, 500));

    useEffect(() => {
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults.current(filterResearchField, filterResearchProblem, filterClass, filterLabel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterResearchField, filterResearchProblem, filterClass, filterLabel]);

    const isFilterApplied = () => {
        return filterResearchField || filterResearchProblem || filterClass || filterLabel;
    };

    const handleResearchFieldSelect = selected => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);

        setFilterResearchField(!selected ? null : selected);
        setFilterResearchProblem(null);
        setFilterClass(null);
        setFilterLabel('');
    };

    const handleResearchProblemSelect = selected => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);

        setFilterResearchField(null);
        setFilterResearchProblem(!selected ? null : selected);
        setFilterClass(null);
        setFilterLabel('');
    };

    const handleClassSelect = selected => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);

        setFilterResearchField(null);
        setFilterResearchProblem(null);
        setFilterClass(!selected ? null : selected);
        setFilterLabel('');
    };

    const handleLabelFilter = e => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);

        setFilterResearchField(null);
        setFilterResearchProblem(null);
        setFilterClass(null);
        setFilterLabel(e.target.value);
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements}{' '}
                        {isFilterApplied() ? 'template found by applying the filter' : 'template'}
                    </div>
                }
                buttonGroup={
                    <RequireAuthentication
                        component={Link}
                        color="secondary"
                        size="sm"
                        className="btn btn-secondary btn-sm flex-shrink-0"
                        to={reverse(ROUTES.TEMPLATE)}
                    >
                        <Icon icon={faPlus} /> Create template
                    </RequireAuthentication>
                }
            >
                View all templates
            </TitleBar>
            <Container className="box rounded pt-4 pb-2 ps-5 pe-5 clearfix">
                <Alert color="info" fade={false}>
                    Templates allows to specify the structure of content types, and they can be used when describing research contributions. Further
                    information about templates can be also found in the{' '}
                    <a
                        href="https://www.orkg.org/orkg/help-center/article/9/Templates_for_structuring_contribution_descriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ORKG help center
                    </a>
                    .
                </Alert>
                <Form className="mb-3">
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="exampleEmail">Filter by research field</Label>
                                <AutoComplete
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.RESEARCH_FIELD}
                                    placeholder="Select or type to enter a research field"
                                    onChange={handleResearchFieldSelect}
                                    value={filterResearchField}
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
                                    onChange={handleResearchProblemSelect}
                                    value={filterResearchProblem}
                                    autoLoadOption={true}
                                    openMenuOnFocus={true}
                                    allowCreate={false}
                                    isClearable
                                    autoFocus={false}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filterLabel">Filter by Label</Label>
                                <Input value={filterLabel} type="text" name="filterLabel" onChange={handleLabelFilter} />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="examplePassword">Filter by class</Label>
                                <AutoComplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder="Select or type to enter a class"
                                    onChange={handleClassSelect}
                                    value={filterClass}
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
                    {templates.length > 0 && (
                        <div>
                            {templates.map(template => {
                                return <TemplateCard key={template.id} template={template} />;
                            })}
                        </div>
                    )}
                    {templates.length === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            No templates
                            {(filterResearchField || filterResearchProblem || filterClass || filterLabel) && ' match this filter'}.
                        </ListGroupItem>
                    )}
                    {isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                            action
                            onClick={
                                !isNextPageLoading
                                    ? () => loadMoreTemplates(filterResearchField, filterResearchProblem, filterClass, filterLabel)
                                    : undefined
                            }
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more templates
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};

export default Templates;
