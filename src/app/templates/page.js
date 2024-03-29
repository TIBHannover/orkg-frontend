'use client';

import { faEllipsisV, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import Link from 'components/NextJsMigration/Link';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect, useRef, useState } from 'react';
import {
    Badge,
    ButtonDropdown,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormGroup,
    Input,
    Label,
    ListGroup,
    ListGroupItem,
    Row,
} from 'reactstrap';
import { getResources } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { MAX_LENGTH_INPUT } from 'constants/misc';

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
    const getTemplatesOfResourceId = (resourceId, predicateId) =>
        getStatementsByObjectAndPredicate({
            objectId: resourceId,
            predicateId,
            page,
            size: pageSize,
            sortBy: 'created_at',
            desc: true,
            returnContent: false,
        }).then(
            statements =>
                // Filter statement with subjects of type Template
                ({
                    ...statements,
                    content: statements.content
                        .filter(statement => statement.subject.classes.includes(CLASSES.NODE_SHAPE))
                        .map(st => ({ id: st.subject.id, label: st.subject.label, source: resourceId })),
                }), // return the template Object
        );

    const loadMoreTemplates = (researchField, researchProblem, fClass, label) => {
        setIsNextPageLoading(true);
        let apiCalls = [];
        if (researchField) {
            apiCalls = getTemplatesOfResourceId(researchField.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD);
        } else if (researchProblem) {
            apiCalls = getTemplatesOfResourceId(researchProblem.id, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM);
        } else if (fClass) {
            apiCalls = getTemplatesOfResourceId(fClass.id, PREDICATES.SHACL_TARGET_CLASS);
        } else {
            apiCalls = getResources({
                include: [CLASSES.NODE_SHAPE],
                page,
                q: label,
                size: pageSize,
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

    const isFilterApplied = () => filterResearchField || filterResearchProblem || filterClass || filterLabel;

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

    const [menuOpen, setMenuOpen] = useState(false);

    const infoContainerText = (
        <>
            Templates allows to specify the structure of content types, and they can be used when describing research contributions.{' '}
            <a href="https://orkg.org/about/19/Templates" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

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
                    <>
                        <RequireAuthentication
                            component={Link}
                            color="secondary"
                            size="sm"
                            className="btn btn-secondary btn-sm flex-shrink-0"
                            href={reverse(ROUTES.ADD_TEMPLATE)}
                        >
                            <Icon icon={faPlus} /> Create template
                        </RequireAuthentication>
                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end>
                                <RequireAuthentication
                                    component={DropdownItem}
                                    tag={Link}
                                    color="secondary"
                                    size="sm"
                                    end
                                    href={reverse(ROUTES.IMPORT_SHACL)}
                                >
                                    Import SHACL{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </RequireAuthentication>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </>
                }
            >
                Templates
            </TitleBar>
            {infoContainerText && (
                <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                    {infoContainerText}
                </Container>
            )}
            <Container className="box rounded pt-4 pb-2 ps-4 pe-4 clearfix">
                <Form className="mb-3">
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-research-field">Filter by research field</Label>
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
                                    inputId="filter-research-field"
                                    ols={false}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-research-problem">Filter by research problem</Label>
                                <AutoComplete
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.PROBLEM}
                                    placeholder="Select or type to enter a research problem"
                                    onChange={handleResearchProblemSelect}
                                    value={filterResearchProblem}
                                    autoLoadOption={true}
                                    openMenuOnFocus={true}
                                    allowCreate={false}
                                    ols={false}
                                    isClearable
                                    autoFocus={false}
                                    inputId="filter-research-problem"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-label">Filter by label</Label>
                                <Input value={filterLabel} type="text" id="filter-label" maxLength={MAX_LENGTH_INPUT} onChange={handleLabelFilter} />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-class">Filter by class</Label>
                                <AutoComplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder="Select or type to enter a class"
                                    onChange={handleClassSelect}
                                    value={filterClass}
                                    autoLoadOption={true}
                                    openMenuOnFocus={true}
                                    allowCreate={false}
                                    ols={false}
                                    isClearable
                                    autoFocus={false}
                                    inputId="filter-class"
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
                            {templates.map(template => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
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
                            Load more templates
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};

export default Templates;
