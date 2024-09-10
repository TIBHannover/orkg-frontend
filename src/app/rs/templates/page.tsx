'use client';

import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import RSTemplateCard from 'components/Cards/RSTemplateCard/RSTemplateCard';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { Button, Container, Form, FormGroup, Input, Label, ListGroup, ListGroupItem } from 'reactstrap';
import { getTemplates, GetTemplatesParams, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { VisibilityOptions } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

const Templates = () => {
    const pageSize = 25;

    const searchParams = useSearchParams();
    const router = useRouter();

    const getKey = (pageIndex: number): GetTemplatesParams => ({
        page: pageIndex,
        size: pageSize,
        sortBy: [{ property: 'created_at', direction: 'desc' }],
        visibility: searchParams.get('sort') as VisibilityOptions,
        q: searchParams.get('q'),
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), rosettaStoneUrl, 'getTemplates'],
        ([params]) => getTemplates(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    useEffect(() => {
        document.title = 'Statement types - ORKG';
    }, []);

    const totalElements = data?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && data[data.length - 1])?.last;
    const hasNextPage = !isLastPageReached;
    const isLoadingTemplates = isLoading || isValidating;
    const handleLoadMore = () => setSize(size + 1);

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
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.push(`?${params.toString()}`);
    }, 500);

    const isFilterApplied = searchParams.get('q')?.toString();

    const resetFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('sort');
        params.delete('q');
        router.push(`?${params.toString()}`);
    };

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
                    <RequireAuthentication
                        component={Link}
                        color="secondary"
                        size="sm"
                        className="btn btn-secondary btn-sm flex-shrink-0"
                        href={reverse(ROUTES.RS_ADD_TEMPLATE)}
                    >
                        <Icon icon={faPlus} /> Create statement type
                    </RequireAuthentication>
                }
            >
                Statement types
            </TitleBar>
            {infoContainerText && (
                <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                    {infoContainerText}
                </Container>
            )}
            <Container className="box rounded pt-4 pb-2 ps-4 pe-4 clearfix">
                <Form className="mb-3">
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
                </Form>
            </Container>
            <Container className="p-0 mt-4">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {data?.map((_templates) => _templates.content.map((template) => <RSTemplateCard key={template.id} template={template} />))}

                    {totalElements === 0 && !isLoadingTemplates && (
                        <ListGroupItem tag="div" className="text-center p-5">
                            No statement types
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
                            Load more statement types
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
