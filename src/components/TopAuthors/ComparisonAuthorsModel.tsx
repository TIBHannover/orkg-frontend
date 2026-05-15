import { Alert, Modal } from '@heroui/react';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { ComparisonTopAuthor, comparisonUrl, getAuthorsByComparisonId } from '@/services/backend/comparisons';

type ComparisonAuthorsModelProps = {
    comparisonId: string;
    toggle: () => void;
};

const ComparisonAuthorsModel = ({ comparisonId, toggle }: ComparisonAuthorsModelProps) => {
    const {
        data: authors,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getAuthorsByComparisonId,
        fetchUrl: comparisonUrl,
        fetchFunctionName: 'getAuthorsByComparisonId',
        prefixParams: 'comparisonAuthors_',
        fetchExtraParams: {
            id: comparisonId,
        },
        defaultPageSize: 10,
    });

    const renderListItem = (author: ComparisonTopAuthor, lastItem?: boolean, index: number = 0) => (
        <div className="px-2 py-2" key={`comparisonAuthor${index}`}>
            <AuthorCard author={author.author.value} isVisibleGoogleScholar isVisibleShowCitations papers={author.info} />
        </div>
    );

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    toggle();
                }
            }}
            isDismissable
        >
            <Modal.Container>
                <Modal.Dialog className="mt-20 max-w-4xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Top authors</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <Alert status="accent" className="mt-2 mb-4 rounded-2xl">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Engaged researchers</Alert.Title>
                                <Alert.Description>
                                    Each author listed below is linked to a paper displayed in the comparison. The list can be used to find suitable
                                    peer-reviewers.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                        <ListPaginatedContent<ComparisonTopAuthor>
                            renderListItem={renderListItem}
                            pageSize={pageSize}
                            label="top authors"
                            isLoading={isLoading}
                            items={authors ?? []}
                            hasNextPage={hasNextPage}
                            page={page}
                            setPage={setPage}
                            setPageSize={setPageSize}
                            totalElements={totalElements}
                            error={error}
                            totalPages={totalPages}
                            boxShadow={false}
                            flush={false}
                            listGroupProps={{ className: 'pt-2 pb-2' }}
                            prefixParams="comparisonAuthors_"
                            noDataComponent={<div className="my-6">No authors yet</div>}
                        />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ComparisonAuthorsModel;
