'use client';

import { faCaretDown, faEllipsisV, faPen, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Skeleton, Table as HeroUITable, tableVariants } from '@heroui/react';
import { type ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Chart from 'react-google-charts';
import useSWR from 'swr';

import CodeURLsTooltip from '@/components/Benchmarks/BenchmarkCard/CodeURLsTooltip';
import useBenchmarkDatasetPapers from '@/components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import useBenchmarkDatasetResource from '@/components/Benchmarks/hooks/useBenchmarkDatasetResource';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import useColorMode from '@/components/hooks/useColorMode';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { datasetsUrl, getDatasetsBenchmarksByResearchProblemId } from '@/services/backend/datasets';
import { reverseWithSlug } from '@/utilsTyped';

type BenchmarkPaper = {
    paper_id: string;
    paper_title: string;
    model_id: string;
    model_name: string | null;
    score: string;
    metric: string;
    code_urls: string[];
    paper_year: number;
    paper_month: number | null;
};

type BenchmarkResource = {
    id: string;
    label: string;
    description?: string;
    url?: string;
};

type ResearchProblem = { id: string; label: string };

type RouteParams = { datasetId: string; problemId: string };

type ChartTooltipRow = [Date, number, string];
type ChartHeaderRow = [string, string, { type: 'string'; role: 'tooltip'; p: { html: true } }];
type ChartData = [ChartHeaderRow, ...ChartTooltipRow[]];

function getTicksAxisH(data: ChartData) {
    const dateRange = data.slice(1).map((value) => (value as ChartTooltipRow)[0]);
    const maxDate = new Date(
        Math.max.apply(
            null,
            dateRange.map((d) => d.getTime()),
        ),
    );
    const minDate = new Date(
        Math.min.apply(
            null,
            dateRange.map((d) => d.getTime()),
        ),
    );
    const ticksAxisH: { v: Date; f: string }[] = [];
    let year = '';
    for (
        let i = dayjs(minDate.getTime()).subtract(1, 'month').valueOf();
        i <= dayjs(maxDate.getTime()).add(1, 'month').valueOf();
        i = dayjs(i).add(1, 'month').valueOf()
    ) {
        const tick = new Date(i);
        if (year !== dayjs(tick).format('MMM YYYY')) {
            ticksAxisH.push({ v: tick, f: dayjs(tick).format('MMM YYYY') });
            year = dayjs(tick).format('MMM YYYY');
        }
    }
    return ticksAxisH;
}

function Benchmark() {
    const { datasetId, problemId } = useParams<RouteParams>();
    const [resourceData, problemData, isLoading, isFailedLoading, loadResourceData] = (
        useBenchmarkDatasetResource as unknown as (args: {
            datasetId: string;
            problemId: string;
        }) => [BenchmarkResource | null, ResearchProblem | null, boolean, boolean, () => void]
    )({ datasetId, problemId });
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const router = useRouter();
    const {
        isLoading: isLoadingPapers,
        isFailedLoadingPapers,
        benchmarkDatasetPapers,
        datasetProblems,
        metrics,
        selectedMetric,
        setSelectedMetric,
    } = (
        useBenchmarkDatasetPapers as unknown as (args: { datasetId: string; problemId: string }) => {
            isLoading: boolean;
            isFailedLoadingPapers: boolean;
            benchmarkDatasetPapers: Record<string, BenchmarkPaper[]>;
            datasetProblems: ResearchProblem[];
            metrics: string[];
            selectedMetric: string | null;
            setSelectedMetric: (m: string) => void;
        }
    )({ datasetId, problemId });

    const { data: datasets, isLoading: isLoadingDatasets } = useSWR(
        [{ id: problemId, page: 0, size: 9999 }, datasetsUrl, 'getDatasetsBenchmarksByResearchProblemId'],
        ([params]) => getDatasetsBenchmarksByResearchProblemId(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const isDark = useColorMode() === 'dark';

    const columns = useMemo<ColumnDef<BenchmarkPaper>[]>(
        () => [
            {
                header: 'Paper Title',
                accessorKey: 'paper_title',
                cell: (info) => (
                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: info.row.original.paper_id })} className="no-underline">
                        <PaperTitle title={info.row.original.paper_title} />
                    </Link>
                ),
            },
            {
                header: 'Model',
                accessorKey: 'model_name',
                cell: (info) =>
                    info.getValue() ? (
                        <Link href={reverse(ROUTES.RESOURCE, { id: info.row.original.model_id })} className="no-underline">
                            {(info.getValue() as string) ?? '-'}
                        </Link>
                    ) : (
                        '-'
                    ),
            },
            {
                header: 'Score',
                accessorKey: 'score',
                cell: (info) => (info.getValue() as string) ?? '-',
            },
            {
                header: 'Metric',
                accessorKey: 'metric',
                cell: (info) => (info.getValue() as string) ?? '-',
            },
            {
                header: 'Code',
                accessorKey: 'code_urls',
                cell: (info) => (
                    <CodeURLsTooltip id={info.row.original.paper_id} title={info.row.original.paper_title} urls={info.row.original.code_urls} />
                ),
            },
        ],
        [],
    );

    const data = useMemo<BenchmarkPaper[]>(
        () => (selectedMetric && benchmarkDatasetPapers[selectedMetric] ? benchmarkDatasetPapers[selectedMetric] : []),
        [selectedMetric, benchmarkDatasetPapers],
    );

    const table = useReactTable({
        columns,
        data,
        initialState: { sorting: [{ id: 'score', desc: true }] },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const dataChart: ChartData = [
        ['Year', selectedMetric ?? '', { type: 'string', role: 'tooltip', p: { html: true } }],
        ...((selectedMetric && benchmarkDatasetPapers[selectedMetric]
            ? benchmarkDatasetPapers[selectedMetric]
                  .map((c) => {
                      const publishedOn = dayjs(`${c.paper_year}-${c.paper_month ? c.paper_month : '01'}`, 'YYYY-MM');
                      try {
                          return parseFloat(c.score)
                              ? ([
                                    publishedOn.toDate(),
                                    parseFloat(c.score),
                                    `<b>Paper</b>: ${c.paper_title}<br /> <b>Model</b>: ${c.model_name ?? '-'}<br /> <b>Score</b>: ${
                                        c.score
                                    }<br /> <b>Published on</b>: ${publishedOn.format('MM-YYYY')}`,
                                ] as ChartTooltipRow)
                              : null;
                      } catch (error) {
                          return null;
                      }
                  })
                  .filter((v): v is ChartTooltipRow => v !== null)
            : []) as ChartTooltipRow[]),
    ];

    const axisColor = isDark ? '#e5e7eb' : '#374151';
    const trendlineColor = isDark ? '#60a5fa' : '#2563eb';
    const tableSlots = tableVariants({ variant: 'primary' });

    return (
        <div>
            {isLoading && (
                <>
                    <Container className="mt-6 mb-6">
                        <Skeleton className="w-full h-5 rounded" />
                    </Container>
                    <Container className="mt-6 mb-6 box rounded p-4">
                        <div className="text-left flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </Container>
                </>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-6 mb-6">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && resourceData && problemData && (
                <>
                    <TitleBar
                        titleAddition={
                            <SubTitle>
                                {problemData.label} on {resourceData.label}
                            </SubTitle>
                        }
                        buttonGroup={
                            <div className="action-bar flex">
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    className="button--orkg-secondary !h-8"
                                    onClick={() => setEditMode((v) => !v)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Dropdown isOpen={menuOpen} onOpenChange={setMenuOpen}>
                                    <Button size="sm" className="button--orkg-secondary !h-8" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                href={`${reverse(ROUTES.RESOURCE, { id: datasetId })}?noRedirect`}
                                                textValue="View resource"
                                            >
                                                View resource
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </div>
                        }
                    >
                        Benchmark
                    </TitleBar>

                    {editMode && (
                        <DataBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode((v) => !v)}
                            id={datasetId}
                            label={resourceData.label}
                            isEditMode
                            onCloseModal={() => loadResourceData()}
                        />
                    )}

                    <Container className="p-4 box rounded">
                        <div>
                            <i>Research problem:</i>{' '}
                            <Link
                                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problemData.id, slug: problemData.label })}
                                className="no-underline"
                            >
                                {problemData.label}
                            </Link>
                        </div>
                        <div className="mt-4 mb-4 flex items-center">
                            <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                Dataset
                            </Button>
                            {isLoadingDatasets && (
                                <Button size="sm" isDisabled className="!h-8 rounded-l-none -ms-px">
                                    Loading...
                                </Button>
                            )}
                            {!isLoadingDatasets && (
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                        {resourceData.label} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                    </Button>
                                    <Dropdown.Popover>
                                        <Dropdown.Menu className="max-h-[280px] overflow-y-auto">
                                            {datasets?.content?.map((ds) => (
                                                <Dropdown.Item
                                                    key={ds.id}
                                                    isDisabled={isLoading}
                                                    onAction={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId: ds.id, problemId }))}
                                                    textValue={ds.label}
                                                >
                                                    {ds.label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            )}
                        </div>

                        {resourceData.description && <p className="m-0">{resourceData.description}</p>}
                        {resourceData.url && <div className="mb-6">{resourceData.url}</div>}
                    </Container>
                </>
            )}
            {!isLoading && !isFailedLoading && !isLoadingPapers && !isFailedLoadingPapers && problemData && resourceData && (
                <div>
                    <Container className="flex items-center mt-6 mb-6">
                        <div className="flex grow">
                            <h1 className="text-xl mb-0">Performance trend</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center">
                                <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                    Research problem
                                </Button>
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                        {problemData.label} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                    </Button>
                                    <Dropdown.Popover>
                                        <Dropdown.Menu>
                                            {datasetProblems.map((rp) => (
                                                <Dropdown.Item
                                                    key={rp.id}
                                                    isDisabled={isLoading}
                                                    onAction={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId, problemId: rp.id }))}
                                                    textValue={rp.label}
                                                >
                                                    {rp.label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </div>
                            {metrics?.length > 0 && (
                                <div className="flex items-center">
                                    <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                        Metric
                                    </Button>
                                    <Dropdown>
                                        <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                            {selectedMetric} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                        </Button>
                                        <Dropdown.Popover placement="bottom end">
                                            <Dropdown.Menu>
                                                {metrics.map((m) => (
                                                    <Dropdown.Item key={m} isDisabled={isLoading} onAction={() => setSelectedMetric(m)} textValue={m}>
                                                        {m}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </div>
                            )}
                        </div>
                    </Container>

                    <Container className="p-4 box rounded">
                        {dataChart?.length > 1 && (
                            <Chart
                                width="100%"
                                height={300}
                                chartType="ScatterChart"
                                loader={<div>Loading Chart</div>}
                                data={dataChart}
                                options={{
                                    backgroundColor: 'transparent',
                                    hAxis: {
                                        title: 'Year',
                                        format: 'MMM yyyy',
                                        ticks: getTicksAxisH(dataChart) as unknown as Date[],
                                        textStyle: { color: axisColor },
                                        titleTextStyle: { color: axisColor },
                                    },
                                    vAxis: {
                                        title: selectedMetric ?? '',
                                        textStyle: { color: axisColor },
                                        titleTextStyle: { color: axisColor },
                                    },
                                    legend: { position: 'right', textStyle: { color: axisColor } },
                                    tooltip: { isHtml: true },
                                    pointSize: 7,
                                    trendlines: {
                                        0: {
                                            labelInLegend: 'Linear trendline',
                                            tooltip: false,
                                            type: 'linear',
                                            visibleInLegend: true,
                                            color: trendlineColor,
                                        },
                                    },
                                }}
                                chartEvents={[
                                    {
                                        eventName: 'select',
                                        callback: ({ chartWrapper }) => {
                                            const chart = chartWrapper?.getChart();
                                            const selection = chart?.getSelection() ?? [];
                                            if (selection.length === 1 && selectedMetric) {
                                                const [selectedItem] = selection;
                                                const { row } = selectedItem;
                                                router.push(
                                                    reverse(ROUTES.VIEW_PAPER, {
                                                        resourceId: benchmarkDatasetPapers[selectedMetric][row].paper_id,
                                                    }),
                                                );
                                            }
                                        },
                                    },
                                ]}
                            />
                        )}
                        {dataChart?.length <= 1 && 'No data to plot!'}
                    </Container>
                    <TitleBar
                        titleSize="h5"
                        titleAddition={
                            <SubTitle className="mb-0">
                                <small className="text-gray-500 dark:text-gray-400 mb-0 text-small">Data imported from paperswithcode.com</small>
                            </SubTitle>
                        }
                    >
                        Papers
                    </TitleBar>
                    <Container className="p-0 rounded box">
                        {table.getRowModel().rows?.length > 0 && (
                            <HeroUITable className={tableSlots.base()}>
                                <table className={tableSlots.content()}>
                                    <thead className="table__header">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <th key={header.id} className="table__column">
                                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                            <div
                                                                className="flex cursor-pointer select-none"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        header.column.getToggleSortingHandler()?.(e);
                                                                    }
                                                                }}
                                                                role="button"
                                                                tabIndex={0}
                                                            >
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                <div className="ml-1">
                                                                    {{
                                                                        asc: <FontAwesomeIcon icon={faSortDown} />,
                                                                        desc: <FontAwesomeIcon icon={faSortUp} className="ml-1" />,
                                                                    }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex">
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                            </div>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="table__body">
                                        {table.getRowModel().rows.map((row) => (
                                            <tr key={row.id} className="table__row">
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="table__cell">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </HeroUITable>
                        )}

                        {!table.getRowModel().rows?.length && (
                            <div className="p-6">
                                No papers that addresses {problemData.label} on {resourceData.label} yet.
                                <div className="pt-4">
                                    Add your benchmark dataset and its evaluations to the ORKG by following the steps found in the{' '}
                                    <a href="https://orkg.org/about/18/Benchmarks" target="_blank" rel="noopener noreferrer">
                                        ORKG help center
                                    </a>
                                    .
                                </div>
                            </div>
                        )}
                    </Container>
                </div>
            )}
            {!isLoadingPapers && isFailedLoadingPapers && (
                <Container className="p-0 mt-4 rounded box">
                    <div className="text-center mt-6 mb-6">Failed loading benchmark papers.</div>
                </Container>
            )}
            {isLoadingPapers && !isFailedLoadingPapers && (
                <Container className="p-0 mt-4 rounded box">
                    <div className="text-center mt-6 mb-6 py-6">Loading benchmark papers...</div>
                </Container>
            )}
        </div>
    );
}

export default Benchmark;
