import styled from 'styled-components';
import useSWR from 'swr';

import ComparisonCard from '@/components/Cards/ComparisonCard/ComparisonCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Container from '@/components/Ui/Structure/Container';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { comparisonUrl, getComparison } from '@/services/backend/comparisons';
import { getStatements, GetStatementsParams, statementsUrl } from '@/services/backend/statements';
import { Comparison, Statement } from '@/services/backend/types';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const ContributionComparisons = ({ contributionId }: { contributionId: string }) => {
    const renderListItem = (item: Comparison) => <ComparisonCard comparison={item} key={item.id} showCurationFlags={false} showBadge={false} />;

    const {
        data: comparisonsStatements,
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
        fetchFunction: (params: GetStatementsParams<false>) => getStatements({ ...params, returnContent: false }),
        fetchUrl: statementsUrl,
        fetchFunctionName: 'getStatements',
        defaultPageSize: 3,
        fetchExtraParams: {
            objectId: contributionId,
            predicateId: PREDICATES.COMPARE_CONTRIBUTION,
            subjectClasses: [CLASSES.COMPARISON],
            sortBy: [{ property: 'created_at', direction: 'desc' as const }],
        },
    });

    const { data: comparisons, isLoading: isLoadingComparisons } = useSWR(
        comparisonsStatements ? [comparisonsStatements?.map((s: Statement) => s.subject.id) ?? [], comparisonUrl, 'getComparison'] : null,
        ([params]) => Promise.all(params.map((id: string) => getComparison(id)) ?? []),
    );

    if (!comparisons || (comparisons && comparisons.length === 0 && !isLoadingComparisons)) {
        return null;
    }

    return (
        <div>
            <Title>Comparisons</Title>

            <Container className="mt-3 p-0">
                <ListPaginatedContent<Comparison>
                    renderListItem={renderListItem}
                    pageSize={pageSize}
                    label="comparison"
                    isLoading={isLoading}
                    items={comparisons ?? []}
                    hasNextPage={hasNextPage}
                    page={page}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalElements={totalElements}
                    error={error}
                    totalPages={totalPages}
                    boxShadow={false}
                    flush={false}
                />
            </Container>
        </div>
    );
};

export default ContributionComparisons;
