'use client';

import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Input, Label } from '@heroui/react';
import { debounce } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect } from 'react';

import RSTemplateCard from '@/components/Cards/RSTemplateCard/RSTemplateCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getRSTemplates, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { RosettaStoneTemplate } from '@/services/backend/types';

const Templates = () => {
    const [searchTerm, setSearchTerm] = useQueryState('q', {
        defaultValue: '',
    });

    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(25));

    const {
        data: items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        totalPages,
        setPage,
        error,
    } = usePaginate({
        fetchFunction: getRSTemplates,
        fetchUrl: rosettaStoneUrl,
        fetchFunctionName: 'getRSTemplates',
        fetchExtraParams: { q: searchTerm },
        defaultPageSize: pageSize,
        defaultSortBy: 'created_at',
    });

    useEffect(() => {
        document.title = 'Statement templates - ORKG';
    }, []);

    const infoContainerText = (
        <>
            Statement templates allows to define data schema patterns, and they can be used when describing research contributions.{' '}
            <a href="https://orkg.org/help-center/article/58/Statement_types" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    const handleSearch = debounce((term: string) => {
        setSearchTerm(term);
    }, 500);

    const buttons = (
        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={reverse(ROUTES.RS_ADD_TEMPLATE)}>
            <FontAwesomeIcon icon={faPlus} /> Create statement template
        </RequireAuthentication>
    );

    const renderListItem = (template: RosettaStoneTemplate) => <RSTemplateCard template={template} key={template.id} />;

    const isFilterApplied = searchTerm !== '';

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-gray-500 mt-1">
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                        {searchTerm !== '' ? 'items found by applying the filter' : 'items'}
                        {isFilterApplied && (
                            <Button onPress={() => setSearchTerm('')} className="ml-1 pl-2 pr-2" size="sm" variant="ghost">
                                Reset
                            </Button>
                        )}
                    </div>
                }
                buttonGroup={buttons}
            >
                Statement templates
            </TitleBar>
            <Container className="mb-4">
                <div className="rounded p-4 bg-surface-tertiary">{infoContainerText}</div>
            </Container>
            <Container className="mb-4">
                <div className="box rounded pt-6 pb-2 pl-6 pr-6 flow-root">
                    <Form className="mb-4">
                        <div className="flex flex-col gap-1.5 w-full">
                            <Label htmlFor="filter-label">Filter by label</Label>
                            <Input
                                type="text"
                                id="filter-label"
                                maxLength={MAX_LENGTH_INPUT}
                                onChange={(e) => handleSearch(e.target.value)}
                                defaultValue={searchTerm}
                                className="w-full"
                            />
                        </div>
                    </Form>
                </div>
            </Container>
            <ListPaginatedContent<RosettaStoneTemplate>
                renderListItem={renderListItem}
                pageSize={pageSize}
                label="statement templates"
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
