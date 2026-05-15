'use client';

import { faEllipsisV, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Dropdown } from '@heroui/react';
import { useEffect } from 'react';

import TemplateCard from '@/components/Cards/TemplateCard/TemplateCard';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TemplatesFilters from '@/components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from '@/components/Templates/TemplatesFilters/useTemplateGallery';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Template } from '@/services/backend/types';

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
                    <div className="text-gray-500 mt-1">
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                        {isFilterApplied ? 'items found by applying the filter' : 'items'}
                        {isFilterApplied && (
                            <Button onPress={resetFilters} className="ml-1 pl-2 pr-2" size="sm" variant="ghost">
                                Reset
                            </Button>
                        )}
                    </div>
                }
                buttonGroup={
                    <>
                        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={reverse(ROUTES.ADD_TEMPLATE)}>
                            <FontAwesomeIcon icon={faPlus} /> Create template
                        </RequireAuthentication>
                        <Dropdown>
                            <Button size="sm" className="button--orkg-secondary" isIconOnly aria-label="More options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu>
                                    <RequireAuthentication component={Dropdown.Item} href={reverse(ROUTES.IMPORT_SHACL)} textValue="Import SHACL">
                                        Import SHACL
                                        <Chip color="accent" size="sm" className="ml-2">
                                            Beta
                                        </Chip>
                                    </RequireAuthentication>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </>
                }
            >
                Templates
            </TitleBar>
            <div className="mx-auto mb-4 max-w-container px-3">
                <div className="rounded bg-surface-tertiary p-4">{infoContainerText}</div>
            </div>
            <Container className="mb-4">
                <div className="box rounded pt-6 pb-4 pl-6 pr-6 flow-root">
                    <TemplatesFilters isLoading={isLoading} key={key} />
                </div>
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
