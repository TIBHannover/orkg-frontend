import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CardFactory from 'components/Cards/CardFactory/CardFactory';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import ContentTypeAsResourceList from 'components/ContentTypeList/ContentTypeAsResourceList';
import useDeletePapers from 'components/ViewPaper/hooks/useDeletePapers';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { flatten } from 'lodash';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { parseAsJson, useQueryState } from 'nuqs';
import { FC, useEffect, useState } from 'react';
import { Button, ListGroup } from 'reactstrap';
import { FilterConfig, Item, PaginatedResponse, Paper, Resource } from 'services/backend/types';
import { ALL_CONTENT_TYPES_ID } from 'constants/misc';

type ContentTypeListProps = {
    pageLabel: string;
    boxShadow?: boolean;
    flush?: boolean;
    isLoading: boolean;
    items: PaginatedResponse<Item | Resource>[];
    hasNextPage: boolean;
    isLastPageReached?: boolean;
    totalElements?: number;
    page: number;
    handleLoadMore: () => void;
    mutate?: () => void;
    showLoadMore?: boolean;
    showDelete?: boolean;
    contentType: string;
};

const ContentTypeList: FC<ContentTypeListProps> = ({
    pageLabel,
    boxShadow = false,
    flush = true,
    isLoading,
    items,
    hasNextPage,
    isLastPageReached,
    totalElements,
    page,
    handleLoadMore,
    mutate,
    showDelete = false,
    showLoadMore = true,
    contentType,
}) => {
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [filterConfig] = useQueryState<FilterConfig[]>('filter_config', parseAsJson());

    const { deletePapers, isLoading: loadingDeletePapers } = useDeletePapers({
        paperIds: selectedItems,
        finishLoadingCallback: mutate,
    });

    const comparePapers = () => {
        const contributionIds = flatten(
            (flatten(items?.map((r) => r.content)).filter((r) => selectedItems.includes(r.id)) as Paper[])?.map((c) =>
                c.contributions?.map((ctrId) => ctrId.id),
            ),
        );
        router.push(`${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${contributionIds.join(',')}`);
    };

    const handleSelect = (paperId: string) => {
        if (selectedItems.includes(paperId)) {
            setSelectedItems(selectedItems.filter((id) => id !== paperId));
        } else {
            setSelectedItems([...selectedItems, paperId]);
        }
    };

    useEffect(() => {
        if (loadingDeletePapers) {
            mutate?.();
            setSelectedItems([]);
        }
    }, [loadingDeletePapers, mutate]);

    return (
        <>
            {!!totalElements && totalElements > 0 && (
                <ListGroup flush={flush} className="rounded">
                    {items.map((item, i: number) =>
                        contentType === CLASSES.PAPER && filterConfig ? (
                            <ContentTypeAsResourceList key={i} content={item.content as Resource[]} />
                        ) : (
                            item?.content?.map((it) => (
                                <CardFactory
                                    showBadge={contentType === ALL_CONTENT_TYPES_ID}
                                    showCurationFlags
                                    showAddToComparison
                                    key={it.id}
                                    item={it as Item}
                                    selectable={showDelete}
                                    selected={selectedItems.includes(it.id)}
                                    onSelect={() => handleSelect(it.id)}
                                />
                            ))
                        ),
                    )}
                    {showLoadMore && !isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={!isLoading ? handleLoadMore : undefined}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (!isLoading) {
                                        handleLoadMore();
                                    }
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            Load more content
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center m-2">You have reached the last page</div>}
                </ListGroup>
            )}
            {totalElements === 0 && !isLoading && (
                <div className={boxShadow ? 'container box rounded' : ''}>
                    <div className="p-5 text-center mt-4 mb-4">There are no content for this {pageLabel} that matches this filter, yet</div>
                </div>
            )}
            {isLoading && (
                <div className={`mt-4 mb-4 ${page === 1 ? 'p-5' : ''} ${boxShadow ? 'container box rounded' : ''}`}>
                    {page !== 1 && (
                        <div className="text-center">
                            <FontAwesomeIcon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {page === 1 && (
                        <div className="text-left">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            )}

            {contentType === CLASSES.PAPER && selectedItems.length > 0 && (
                <div className="mx-2 my-2">
                    <Button size="sm" color="secondary" className="mt-2 me-2" onClick={comparePapers}>
                        Compare selected papers({selectedItems.length})
                    </Button>

                    <Button size="sm" color="danger" className="mt-2" onClick={deletePapers}>
                        Delete selected papers ({selectedItems.length})
                    </Button>
                </div>
            )}
        </>
    );
};

export default ContentTypeList;
