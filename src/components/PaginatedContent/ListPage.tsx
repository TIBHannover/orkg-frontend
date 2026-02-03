import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { capitalize } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';

import HeaderSearchButton from '@/components/HeaderSearchButton/HeaderSearchButton';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { PaginatedResponse, Pagination } from '@/services/backend/types';

type ListPageProps<ItemType, FetchFunctionParams> = {
    label: string;
    fetchFunction: (params: FetchFunctionParams) => Promise<PaginatedResponse<ItemType> | Pagination<ItemType>>;
    fetchFunctionName: string;
    fetchUrl: string;
    fetchExtraParams: FetchFunctionParams;
    renderListItem: (item: ItemType) => React.ReactNode;
    defaultPageSize?: number;
    resourceClass?: string;
    buttons?: React.ReactNode;
    disableSearch?: boolean;
    infoContainerText?: React.ReactNode;
    hideTitleBar?: boolean;
    boxShadow?: boolean;
    flush?: boolean;
    defaultSortBy?: string;
};

const ListPage = <ItemType, FetchFunctionParams>({
    label,
    fetchFunction,
    fetchFunctionName,
    fetchUrl,
    fetchExtraParams,
    renderListItem,
    defaultPageSize = 30,
    resourceClass,
    buttons = null,
    disableSearch = false,
    infoContainerText = null,
    hideTitleBar = false,
    boxShadow = true,
    flush = false,
    defaultSortBy = 'created_at',
}: ListPageProps<ItemType, FetchFunctionParams>) => {
    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(defaultPageSize));

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
        fetchFunction,
        fetchUrl,
        fetchFunctionName,
        fetchExtraParams,
        defaultPageSize: pageSize,
        defaultSortBy,
    });

    return (
        <>
            {!error && !hideTitleBar && (
                <TitleBar
                    titleAddition={
                        <div className="text-muted mt-1">{isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements} items</div>
                    }
                    buttonGroup={
                        <>
                            {buttons} {!disableSearch && <HeaderSearchButton placeholder={`Search ${label}...`} type={resourceClass} />}
                        </>
                    }
                >
                    {capitalize(label)}
                </TitleBar>
            )}
            {!error && infoContainerText && (
                <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                    {infoContainerText}
                </Container>
            )}
            <ListPaginatedContent<ItemType>
                renderListItem={renderListItem}
                pageSize={pageSize}
                label={label}
                isLoading={isLoading}
                items={items ?? []}
                hasNextPage={hasNextPage}
                page={page}
                setPage={setPage}
                setPageSize={setPageSize}
                totalElements={totalElements}
                error={error}
                totalPages={totalPages}
                boxShadow={boxShadow}
                flush={flush}
            />
        </>
    );
};

export default ListPage;
