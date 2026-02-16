import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Alert from '@/components/Ui/Alert/Alert';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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
            {!lastItem && <hr className="mb-0 mt-3" />}
        </div>
    );

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Top authors</ModalHeader>
            <ModalBody className="px-3">
                <Alert color="info" className="m-3">
                    The authors listed below are engaged researchers. Each author is linked to a paper displayed in the comparison. The list can be
                    used to find suitable peer-reviewers.
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
                    noDataComponent={<div className="mt-4 mb-4">No authors yet</div>}
                />
            </ModalBody>
        </Modal>
    );
};

export default ComparisonAuthorsModel;
