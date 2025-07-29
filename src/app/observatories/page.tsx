'use client';

import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { ReactNode, useEffect, useState } from 'react';
import { Container, Row } from 'reactstrap';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import ObservatoryCard from '@/components/Cards/ObservatoryCard/ObservatoryCard';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import SortingSelector from '@/components/Observatory/SortingSelector/SortingSelector';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import PreventModal from '@/components/Resource/PreventModal/PreventModal';
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import ROUTES from '@/constants/routes';
import { getObservatories, getResearchFieldOfObservatories, observatoriesUrl } from '@/services/backend/observatories';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Observatory } from '@/services/backend/types';

const defaultSortBy = 'name';
const defaultSortDirection = 'asc';

const Observatories = () => {
    const [isOpenPreventModal, setIsOpenPreventModal] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    useEffect(() => {
        document.title = 'Observatories - ORKG';
    }, []);

    const [researchFieldId, setResearchFieldId] = useQueryState('researchFieldId', { defaultValue: 'all' });

    const router = useRouter();

    const renderListItem = (item: Observatory) => <ObservatoryCard key={`${item.id}`} observatory={item} />;

    const getKey = (pageIndex: number) => ({
        page: pageIndex,
        size: 20,
    });

    const {
        data,
        isLoading: isLoadingResearchFields,
        size,
        setSize,
    } = useSWRInfinite(
        (pageIndex: number) => [getKey(pageIndex), observatoriesUrl, 'getResearchFieldOfObservatories'],
        ([params]) => getResearchFieldOfObservatories(params),
    );

    const researchFields = data?.map((page) => page.content).flat() ?? [];
    const isLastPageReached = (data && data[data.length - 1])?.page.number === ((data && data[data.length - 1])?.page.total_pages || 0) - 1;
    const hasNextPage = !isLastPageReached;
    const loadNextPage = () => setSize(size + 1);

    const {
        data: observatories,
        isLoading: observatoriesIsLoading,
        hasNextPage: observatoriesHasNextPage,
        page: observatoriesPage,
        setPage: observatoriesSetPage,
        pageSize: observatoriesPageSize,
        setPageSize: observatoriesSetPageSize,
        totalElements: observatoriesTotalElements,
        totalPages: observatoriesTotalPages,
        error: observatoriesError,
    } = usePaginate({
        fetchFunction: getObservatories,
        fetchFunctionName: 'getObservatories',
        fetchUrl: observatoriesUrl,
        fetchExtraParams: { researchFieldId: researchFieldId === 'all' ? undefined : researchFieldId },
        defaultPageSize: 20,
        defaultSortBy,
        defaultSortDirection,
    });

    const { data: researchFieldSelected } = useSWR(
        researchFieldId && researchFieldId !== 'all' && researchFields.find((rf) => rf.id === researchFieldId)?.id
            ? null
            : [researchFieldId, resourcesUrl, 'getResource'],
        ([params]) => getResource(params),
    );

    const _researchFields = [
        { id: 'all', label: 'All research fields' },
        ...(researchFieldSelected ? [researchFieldSelected] : []),
        ...(researchFields || []),
    ];

    const onTabChange = (key: string) => {
        if (key === 'loadMore') {
            loadNextPage();
        } else {
            setResearchFieldId(key);
        }
    };

    const labelWrapper = (children: ReactNode, label: string) => <Tooltip content={label}>{children as React.ReactElement}</Tooltip>;

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        <SortingSelector
                            isLoading={observatoriesIsLoading}
                            defaultSortBy={defaultSortBy}
                            defaultSortDirection={defaultSortDirection}
                        />
                        <RequireAuthentication
                            component={Button}
                            className="float-end"
                            color="secondary"
                            size="sm"
                            onClick={() => {
                                if (!isCurationAllowed) {
                                    setIsOpenPreventModal(true);
                                } else {
                                    router.push(reverse(ROUTES.ADD_OBSERVATORY));
                                }
                            }}
                        >
                            Create observatory
                        </RequireAuthentication>
                    </>
                }
            >
                Observatories
            </TitleBar>
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                Observatories organize research contributions in a particular research field and are curated by research organizations active in the
                respective field.{' '}
                <a href="https://orkg.org/about/27/Observatories" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>
            {isOpenPreventModal && (
                <PreventModal
                    header="Create observatory"
                    content="Observatories can only be created by curators. Contact the ORKG team for proposing a new observatory"
                    isOpen={isOpenPreventModal}
                    toggle={() => setIsOpenPreventModal((v) => !v)}
                />
            )}
            <Container className="box rounded p-4 clearfix">
                {_researchFields?.length > 0 && (
                    <Tabs
                        className="mb-3"
                        destroyOnHidden
                        onChange={onTabChange}
                        activeKey={researchFieldId ?? 'all'}
                        items={[
                            ..._researchFields.map((researchField) => ({
                                label: (
                                    <ConditionalWrapper
                                        condition={researchField.label?.length > 40}
                                        wrapper={(children: React.ReactNode) => labelWrapper(children, researchField.label)}
                                    >
                                        <div className="text-truncate" style={{ maxWidth: 250 }}>
                                            {researchField.id === null || '' ? 'Others' : researchField.label}
                                        </div>
                                    </ConditionalWrapper>
                                ),
                                key: researchField.id,
                                children: (
                                    <ListPaginatedContent<Observatory>
                                        ListGroupComponent={Row}
                                        renderListItem={renderListItem}
                                        pageSize={observatoriesPageSize}
                                        label="research field"
                                        isLoading={observatoriesIsLoading}
                                        items={observatories ?? []}
                                        hasNextPage={observatoriesHasNextPage}
                                        page={observatoriesPage}
                                        setPage={observatoriesSetPage}
                                        setPageSize={observatoriesSetPageSize}
                                        totalElements={observatoriesTotalElements}
                                        error={observatoriesError}
                                        totalPages={observatoriesTotalPages}
                                        boxShadow={false}
                                        flush={false}
                                    />
                                ),
                            })),
                            ...(hasNextPage
                                ? [
                                      {
                                          label: <div className="opacity-75">{isLoadingResearchFields ? 'Loading...' : 'Load more...'}</div>,
                                          key: 'loadMore',
                                      },
                                  ]
                                : []),
                        ]}
                        tabPosition="left"
                    />
                )}
                {_researchFields?.length === 0 && <div className="text-center mt-4 mb-4">No observatories yet</div>}
            </Container>
        </>
    );
};

export default Observatories;
