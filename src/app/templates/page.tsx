'use client';

import { faEllipsisV, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TemplateCard from 'components/Cards/TemplateCard/TemplateCard';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TemplatesFilters from 'components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from 'components/Templates/TemplatesFilters/useTemplateGallery';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, Button, ButtonDropdown, Container, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Template } from 'services/backend/types';

const Templates = () => {
    const {
        key,
        items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        totalPages,
        setPage,
        error,
        pageSize,
        isFilterApplied,
        resetFilters,
        setPageSize,
    } = useTemplateGallery({});

    useEffect(() => {
        document.title = 'Templates - ORKG';
    }, []);

    const renderListItem = (template: Template) => <TemplateCard template={template} key={template.id} />;

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
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
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
                            <FontAwesomeIcon icon={faPlus} /> Create template
                        </RequireAuthentication>
                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end="true">
                                <RequireAuthentication
                                    component={DropdownItem}
                                    tag={Link}
                                    color="secondary"
                                    size="sm"
                                    end="true"
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

            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                {infoContainerText}
            </Container>

            <Container className="box rounded pt-4 pb-3 ps-4 pe-4 clearfix mb-3">
                <TemplatesFilters isLoading={isLoading} key={key} />
            </Container>

            <ListPaginatedContent<Template>
                renderListItem={renderListItem}
                pageSize={pageSize}
                label="templates"
                isLoading={isLoading}
                items={items ?? []}
                hasNextPage={hasNextPage}
                page={page}
                setPage={setPage}
                setPageSize={setPageSize}
                totalElements={totalElements}
                error={error}
                totalPages={totalPages}
                boxShadow
                flush={false}
            />
        </>
    );
};

export default Templates;
