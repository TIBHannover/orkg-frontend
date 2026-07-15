import { Alert, Button } from '@heroui/react';
import { AnimatePresence } from 'motion/react';
import { FC, useMemo } from 'react';

import AiReviewAlert from '@/components/Comparison/ComparisonTable/AiReview/AiReviewAlert';
import ComparisonAiReviewProvider from '@/components/Comparison/ComparisonTable/AiReview/ComparisonAiReviewProvider';
import ColumnHeaders from '@/components/Comparison/ComparisonTable/ColumnHeaders/ColumnHeaders';
import ComparisonDialogs from '@/components/Comparison/ComparisonTable/ComparisonDialogs/ComparisonDialogs';
import useComparisonTable from '@/components/Comparison/ComparisonTable/hooks/useComparisonTable';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import ScrollShadow from '@/components/Comparison/ComparisonTable/ScrollShadow/ScrollShadow';
import SelectedPath from '@/components/Comparison/ComparisonTable/SelectedPath/SelectedPath';
import useScrollSync from '@/components/Comparison/ComparisonTable/useScrollSync/useScrollSync';
import useComparison from '@/components/Comparison/hooks/useComparison';

type ComparisonTableProps = { id: string };

const ComparisonTable: FC<ComparisonTableProps> = ({ id }) => {
    const { theadRef, tbodyRef, scrollbarRef, syncScroll, scrollWidth } = useScrollSync();
    const { filters, resetFilters } = useFilters();
    const { comparisonContents } = useComparison(id);
    const { hasData, columns, activeColumns } = useComparisonTable();

    const hasFilters = filters?.[id]?.length > 0;
    const visibleColumns = useMemo(() => columns.filter((_, i) => activeColumns[i]), [columns, activeColumns]);

    return (
        <ComparisonAiReviewProvider comparisonId={id}>
            <AiReviewAlert />
            <ComparisonDialogs />
            <div className="relative">
                {(hasData || !hasFilters) && (
                    <ScrollShadow tbodyRef={tbodyRef}>
                        <table id="comparisonTable" className="mb-0 p-0 relative flex flex-col h-max">
                            <thead
                                className="w-full flex overflow-x-scroll [scrollbar-width:none] sticky z-20 top-[71px]"
                                ref={theadRef}
                                onScroll={syncScroll}
                            >
                                <ColumnHeaders columns={visibleColumns} />
                            </thead>
                            <tbody className="overflow-x-scroll [scrollbar-width:none] w-full flex flex-col" ref={tbodyRef} onScroll={syncScroll}>
                                <AnimatePresence initial={false}>
                                    {comparisonContents?.selected_paths.map((pathNode) => (
                                        <SelectedPath key={pathNode.id} pathNode={pathNode} rows={comparisonContents.values[pathNode.id] ?? []} />
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        <div className="sticky bottom-0 left-0 w-full overflow-x-scroll z-40 -mt-[12px]" onScroll={syncScroll} ref={scrollbarRef}>
                            <div
                                className="h-[12px] invisible"
                                style={{
                                    width: `${scrollWidth}px`,
                                }}
                            />
                        </div>
                    </ScrollShadow>
                )}

                {!hasData && columns.length > 1 && (
                    <Alert status="accent" className="border-0">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No matching data</Alert.Title>
                            {hasFilters && <Alert.Description>Try adjusting or resetting your filters to see more results.</Alert.Description>}
                        </Alert.Content>
                        {hasFilters && (
                            <Button size="sm" variant="secondary" onPress={resetFilters}>
                                Reset filters
                            </Button>
                        )}
                    </Alert>
                )}
            </div>
        </ComparisonAiReviewProvider>
    );
};

export default ComparisonTable;
