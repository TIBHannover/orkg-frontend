'use client';

import { faEllipsisV, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TemplatesFilters from 'components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from 'components/Templates/TemplatesFilters/useTemplateGallery';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, Button, ButtonDropdown, Container, DropdownItem, DropdownMenu, DropdownToggle, ListGroup, ListGroupItem } from 'reactstrap';

const Templates = () => {
    const { key, data, isLoadingTemplates, totalElements, isLastPageReached, hasNextPage, size, handleLoadMore, isFilterApplied, resetFilters } =
        useTemplateGallery({});

    useEffect(() => {
        document.title = 'Templates - ORKG';
    }, []);

    const [menuOpen, setMenuOpen] = useState(false);

    const infoContainerText = (
        <>
            Templates allows to specify the structure of content types, and they can be used when describing research contributions.{' '}
            <a href="https://orkg.org/about/19/Templates" rel="noreferrer" target="_blank">
                Visit the help center
            </a>{' '}
            or{' '}
            <a href="https://academy.orkg.org/orkg-academy/main/courses/template-course.html" rel="noreferrer" target="_blank">
                learn more in the academy
            </a>
            .
        </>
    );

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        {totalElements === 0 && isLoadingTemplates ? <Icon icon={faSpinner} spin /> : totalElements}{' '}
                        {isFilterApplied ? 'items found by applying the filter' : 'items'}
                        {isFilterApplied && (
                            <Button onClick={resetFilters} className="ms-1 ps-2 pe-2" size="sm">
                                Reset
                            </Button>
                        )}
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
            <Container className="box rounded pt-4 pb-3 ps-4 pe-4 clearfix">
                <TemplatesFilters isLoading={isLoadingTemplates} key={key} />
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
