'use client';

import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SortDescriptor } from '@heroui/react';
import { Table } from '@heroui/react';
import { DatasetSummaryRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import CodeURLsTooltip from '@/components/Benchmarks/BenchmarkCard/CodeURLsTooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type BenchmarkPapersTableProps = {
    data: DatasetSummaryRepresentation[];
    problemLabel: string;
    datasetLabel: string;
};

const SORTABLE_COLUMNS: Record<string, keyof DatasetSummaryRepresentation> = {
    paperTitle: 'paperTitle',
    modelName: 'modelName',
    score: 'score',
    metric: 'metric',
};

const SortIcon = ({ sortDirection }: { sortDirection: 'ascending' | 'descending' | undefined }) => {
    if (sortDirection === 'ascending') return <FontAwesomeIcon icon={faSortUp} className="text-xs" />;
    if (sortDirection === 'descending') return <FontAwesomeIcon icon={faSortDown} className="text-xs" />;
    return <FontAwesomeIcon icon={faSort} className="text-xs opacity-40" />;
};

const BenchmarkPapersTable = ({ data, problemLabel, datasetLabel }: BenchmarkPapersTableProps) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'score',
        direction: 'descending',
    });

    const sortedData = useMemo(() => {
        if (!sortDescriptor.column) return data;
        const columnKey = SORTABLE_COLUMNS[sortDescriptor.column.toString()];
        if (!columnKey) return data;
        return [...data].sort((a, b) => {
            const aVal = a[columnKey] ?? '';
            const bVal = b[columnKey] ?? '';
            const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [data, sortDescriptor]);

    return (
        <Table variant="primary">
            <Table.ScrollContainer>
                <Table.Content aria-label="Benchmark papers table" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                    <Table.Header>
                        <Table.Column id="paperTitle" isRowHeader allowsSorting>
                            {({ sortDirection }) => (
                                <span className="flex items-center gap-1">
                                    Paper Title
                                    <SortIcon sortDirection={sortDirection} />
                                </span>
                            )}
                        </Table.Column>
                        <Table.Column id="modelName" allowsSorting>
                            {({ sortDirection }) => (
                                <span className="flex items-center gap-1">
                                    Model
                                    <SortIcon sortDirection={sortDirection} />
                                </span>
                            )}
                        </Table.Column>
                        <Table.Column id="score" allowsSorting>
                            {({ sortDirection }) => (
                                <span className="flex items-center gap-1">
                                    Score
                                    <SortIcon sortDirection={sortDirection} />
                                </span>
                            )}
                        </Table.Column>
                        <Table.Column id="metric" allowsSorting>
                            {({ sortDirection }) => (
                                <span className="flex items-center gap-1">
                                    Metric
                                    <SortIcon sortDirection={sortDirection} />
                                </span>
                            )}
                        </Table.Column>
                        <Table.Column id="codeUrls">Code</Table.Column>
                    </Table.Header>
                    <Table.Body
                        items={sortedData.map((item, index) => ({
                            ...item,
                            _key: `${item.paperId}-${item.modelId ?? ''}-${item.metric}-${item.score}-${index}`,
                        }))}
                        renderEmptyState={() => (
                            <div className="p-6">
                                No papers that addresses {problemLabel} on {datasetLabel} yet.
                                <div className="pt-4">
                                    Add your benchmark dataset and its evaluations to the ORKG by following the steps found in the{' '}
                                    <a href="https://orkg.org/about/18/Benchmarks" target="_blank" rel="noopener noreferrer">
                                        ORKG help center
                                    </a>
                                    .
                                </div>
                            </div>
                        )}
                    >
                        {(item) => (
                            <Table.Row id={item._key}>
                                <Table.Cell>
                                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: item.paperId })} className="no-underline">
                                        <PaperTitle title={item.paperTitle} />
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    {item.modelName ? (
                                        <Link href={reverse(ROUTES.RESOURCE, { id: item.modelId ?? '' })} className="no-underline">
                                            {item.modelName}
                                        </Link>
                                    ) : (
                                        '-'
                                    )}
                                </Table.Cell>
                                <Table.Cell>{item.score ?? '-'}</Table.Cell>
                                <Table.Cell>{item.metric ?? '-'}</Table.Cell>
                                <Table.Cell>
                                    <CodeURLsTooltip id={item.paperId} title={item.paperTitle} urls={item.codeUrls} />
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Content>
            </Table.ScrollContainer>
        </Table>
    );
};

export default BenchmarkPapersTable;
