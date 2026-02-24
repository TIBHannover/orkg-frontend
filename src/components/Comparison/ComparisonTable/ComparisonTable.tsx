import { AnimatePresence } from 'motion/react';
import { FC, useMemo } from 'react';

import ColumnHeaders from '@/components/Comparison/ComparisonTable/ColumnHeaders/ColumnHeaders';
import useComparisonTable from '@/components/Comparison/ComparisonTable/hooks/useComparisonTable';
import useFilters from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/Filters/hooks/useFilters';
import ScrollShadow from '@/components/Comparison/ComparisonTable/ScrollShadow/ScrollShadow';
import SelectedPath from '@/components/Comparison/ComparisonTable/SelectedPath/SelectedPath';
import useScrollSync from '@/components/Comparison/ComparisonTable/useScrollSync/useScrollSync';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';

type ComparisonTableProps = { id: string };

const ComparisonTable: FC<ComparisonTableProps> = ({ id }) => {
    const { theadRef, tbodyRef, scrollbarRef, syncScroll, scrollWidth } = useScrollSync();
    const { filters, resetFilters } = useFilters();
    const { comparisonContents } = useComparison(id);
    const { hasData, columns, activeColumns } = useComparisonTable();

    const hasFilters = filters?.[id]?.length > 0;
    const visibleColumns = useMemo(() => columns.filter((_, i) => activeColumns[i]), [columns, activeColumns]);

    return (
        <div className="tw:relative">
            {(hasData || !hasFilters) && (
                <ScrollShadow tbodyRef={tbodyRef}>
                    <table id="comparisonTable" className="tw:mb-0 tw:p-0 tw:relative tw:flex tw:flex-col tw:h-max">
                        <thead
                            className="tw:w-full tw:flex tw:overflow-x-scroll tw:scrollbar-hidden tw:sticky tw:z-20 tw:top-[71px]"
                            ref={theadRef}
                            onScroll={syncScroll}
                        >
                            <ColumnHeaders columns={visibleColumns} />
                        </thead>
                        <tbody
                            className="tw:overflow-x-scroll tw:scrollbar-hidden tw:w-full tw:flex tw:flex-col"
                            ref={tbodyRef}
                            onScroll={syncScroll}
                        >
                            <AnimatePresence initial={false}>
                                {comparisonContents?.selected_paths.map((pathNode) => (
                                    <SelectedPath key={pathNode.id} pathNode={pathNode} rows={comparisonContents.values[pathNode.id] ?? []} />
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    <div
                        className="tw:sticky tw:bottom-0 tw:left-0 tw:w-full tw:overflow-x-scroll tw:z-40 tw:scrollbar-always-visible tw:-mt-[12px]"
                        onScroll={syncScroll}
                        ref={scrollbarRef}
                    >
                        <div
                            className="tw:h-[12px] tw:invisible"
                            style={{
                                width: `${scrollWidth}px`,
                            }}
                        />
                    </div>
                </ScrollShadow>
            )}

            {!hasData && columns.length > 1 && (
                <Alert color="info" className="tw:flex tw:gap-1 tw:!border-0">
                    No matching data found
                    {filters?.[id]?.length > 0 && (
                        <>
                            .{' '}
                            <Button color="link" className="tw:!p-0 tw:!border-0" onClick={resetFilters}>
                                Reset Filters
                            </Button>
                        </>
                    )}
                </Alert>
            )}
        </div>
    );
};

export default ComparisonTable;
