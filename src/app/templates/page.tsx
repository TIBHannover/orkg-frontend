'use client';

import { faEllipsisV, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/AutocompleteStringDefaultValue';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import Link from 'components/NextJsMigration/Link';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { debounce, isBoolean } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import {
    Badge,
    ButtonDropdown,
    Button,
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
import { getTemplates, templatesUrl, getTemplatesParams } from 'services/backend/templates';
import { Node, VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

const Templates = () => {
    const pageSize = 25;

    const searchParams = useSearchParams();
    const router = useRouter();

    const getKey = (pageIndex: number): getTemplatesParams => ({
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: searchParams.get('sort') as VisibilityOptions,
        researchField: searchParams.get('researchField'),
        includeSubfields: searchParams.get('includeSubfields') ? searchParams.get('includeSubfields') === 'true' : undefined,
        researchProblem: searchParams.get('researchProblem'),
        targetClass: searchParams.get('targetClass'),
        q: searchParams.get('q'),
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), templatesUrl, 'getTemplates'],
        ([params]) => getTemplates(params),
    );

    useEffect(() => {
        document.title = 'Templates - ORKG';
    }, []);

    const totalElements = data?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && data[data.length - 1])?.last;
    const hasNextPage = !isLastPageReached;
    const isLoadingTemplates = isLoading || isValidating;
    const handleLoadMore = () => setSize(size + 1);

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

    const handleChangeFilter = (value: Node | null | boolean, filerId: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && !isBoolean(value)) {
            params.set(filerId, value?.id);
        } else if (isBoolean(value)) {
            params.set(filerId, value.toString());
        } else {
            params.delete(filerId);
        }
        router.push(`?${params.toString()}`);
    };

    const handleSearch = debounce((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.push(`?${params.toString()}`);
    }, 500);

    const isFilterApplied =
        searchParams.get('researchField')?.toString() ||
        searchParams.get('researchProblem')?.toString() ||
        searchParams.get('targetClass')?.toString() ||
        searchParams.get('q')?.toString();

    const filterCommonProps = {
        autoLoadOption: true,
        openMenuOnFocus: true,
        allowCreate: false,
        isClearable: true,
        autoFocus: false,
        ols: false,
    };

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('sort');
        params.delete('researchField');
        params.delete('includeSubfields');
        params.delete('researchProblem');
        params.delete('targetClass');
        params.delete('q');
        router.push(`?${params.toString()}`);
    };

    return (
        <>
            <TitleBar
                // @ts-expect-error
                titleAddition={
                    <div className="text-muted mt-1">
                        {totalElements === 0 && isLoadingTemplates ? <Icon icon={faSpinner} spin /> : totalElements}{' '}
                        {isFilterApplied ? 'items found by applying the filter' : 'items'}
                        {isFilterApplied && (
                            <>
                                <Button onClick={resetFilters} className="ms-1 ps-2 pe-2" size="sm">
                                    Reset
                                </Button>
                            </>
                        )}
                    </div>
                }
                // @ts-expect-error
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
                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
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
                                <Label for="filter-research-field" className="d-flex">
                                    <div className="flex-grow-1">Filter by research field</div>
                                    <Label check className="mb-0 me-0">
                                        <Input
                                            onChange={(e) => handleChangeFilter(e.target.checked, 'includeSubfields')}
                                            defaultValue={searchParams.get('includeSubfields')?.toString()}
                                            type="checkbox"
                                            disabled={isLoading}
                                        />{' '}
                                        Include subfields
                                    </Label>
                                </Label>
                                <AutoComplete
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.RESEARCH_FIELD}
                                    placeholder="Select or type to enter a research field"
                                    onChange={(v: Node | null) => handleChangeFilter(v, 'researchField')}
                                    inputId="filter-research-field"
                                    defaultValue={searchParams.get('researchField')?.toString()}
                                    {...filterCommonProps}
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
                                    onChange={(v: Node | null) => handleChangeFilter(v, 'researchProblem')}
                                    inputId="filter-research-problem"
                                    defaultValue={searchParams.get('researchProblem')?.toString()}
                                    {...filterCommonProps}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-label">Filter by label</Label>
                                <Input
                                    type="text"
                                    id="filter-label"
                                    maxLength={MAX_LENGTH_INPUT}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    defaultValue={searchParams.get('q')?.toString()}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filter-class">Filter by class</Label>
                                <AutoComplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder="Select or type to enter a class"
                                    onChange={(v: Node | null) => handleChangeFilter(v, 'targetClass')}
                                    inputId="filter-class"
                                    defaultValue={searchParams.get('targetClass')?.toString()}
                                    {...filterCommonProps}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            </Container>
            <Container className="p-0 mt-4">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {data?.map((_templates) => _templates.content.map((template) => <TemplateCard key={template.id} template={template} />))}

                    {totalElements === 0 && !isLoadingTemplates && (
                        <ListGroupItem tag="div" className="text-center p-5">
                            No templates
                            {isFilterApplied && ' match this filter'}.
                        </ListGroupItem>
                    )}
                    {isLoadingTemplates && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isLoadingTemplates && hasNextPage && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                            action
                            onClick={!isLoadingTemplates ? handleLoadMore : undefined}
                        >
                            Load more templates
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && size !== 1 && (
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
