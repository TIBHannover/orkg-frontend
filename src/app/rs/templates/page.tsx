'use client';

import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RSTemplateCard from 'components/Cards/RSTemplateCard/RSTemplateCard';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { getRSTemplates, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { RosettaStoneTemplate } from 'services/backend/types';

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
        document.title = 'Statement types - ORKG';
    }, []);

    const infoContainerText = (
        <>
            Statement types allows to define data schema patterns, and they can be used when describing research contributions.{' '}
            <a href="https://orkg.org/help-center/article/58/Statement_types" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    const handleSearch = debounce((term) => {
        setSearchTerm(term);
    }, 500);

    const buttons = (
        <RequireAuthentication
            component={Link}
            color="secondary"
            size="sm"
            className="btn btn-secondary btn-sm flex-shrink-0"
            href={reverse(ROUTES.RS_ADD_TEMPLATE)}
        >
            <FontAwesomeIcon icon={faPlus} /> Create statement type
        </RequireAuthentication>
    );

    const renderListItem = (template: RosettaStoneTemplate) => <RSTemplateCard template={template} key={template.id} />;

    const isFilterApplied = searchTerm !== '';

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                        {searchTerm !== '' ? 'items found by applying the filter' : 'items'}
                        {isFilterApplied && (
                            <Button onClick={() => setSearchTerm('')} className="ms-1 ps-2 pe-2" size="sm">
                                Reset
                            </Button>
                        )}
                    </div>
                }
                buttonGroup={buttons}
            >
                Statement types
            </TitleBar>

            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                {infoContainerText}
            </Container>

            <Container className="box rounded pt-4 pb-2 ps-4 pe-4 clearfix mb-3">
                <Form className="mb-3">
                    <FormGroup>
                        <Label for="filter-label">Filter by label</Label>
                        <Input
                            type="text"
                            id="filter-label"
                            maxLength={MAX_LENGTH_INPUT}
                            onChange={(e) => handleSearch(e.target.value)}
                            defaultValue={searchTerm}
                        />
                    </FormGroup>
                </Form>
            </Container>

            <ListPaginatedContent<RosettaStoneTemplate>
                renderListItem={renderListItem}
                pageSize={pageSize}
                label="statement types"
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
