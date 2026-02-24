'use client';

import { faEllipsisV, faPen, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Chart from 'react-google-charts';
import useSWR from 'swr';

import CodeURLsTooltip from '@/components/Benchmarks/BenchmarkCard/CodeURLsTooltip';
import useBenchmarkDatasetPapers from '@/components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import useBenchmarkDatasetResource from '@/components/Benchmarks/hooks/useBenchmarkDatasetResource';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import Container from '@/components/Ui/Structure/Container';
import Table from '@/components/Ui/Table/Table';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { datasetsUrl, getDatasetsBenchmarksByResearchProblemId } from '@/services/backend/datasets';
import { reverseWithSlug } from '@/utils';

function getTicksAxisH(data) {
    const dateRange = data.slice(1).map((value) => value[0]);
    const maxDate = new Date(Math.max.apply(null, dateRange));
    const minDate = new Date(Math.min.apply(null, dateRange));
    const ticksAxisH = [];
    let year = -1;
    for (
        let i = dayjs(minDate.getTime()).subtract(1, 'month').valueOf();
        i <= dayjs(maxDate.getTime()).add(1, 'month').valueOf();
        i = dayjs(i).add(1, 'month').valueOf()
    ) {
        const tick = new Date(i);
        if (year !== dayjs(tick).format('MMM YYYY')) {
            ticksAxisH.push({
                v: tick,
                f: dayjs(tick).format('MMM YYYY'),
            });
            year = dayjs(tick).format('MMM YYYY');
        }
    }
    return ticksAxisH;
}

function Benchmark() {
    const { datasetId, problemId } = useParams();
    const [resourceData, problemData, isLoading, isFailedLoading, loadResourceData] = useBenchmarkDatasetResource({ datasetId, problemId });
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
    } = useBenchmarkDatasetPapers({
        datasetId,
        problemId,
    });

    const { data: datasets, isLoading: isLoadingDatasets } = useSWR(
        [{ id: problemId, page: 0, size: 9999 }, datasetsUrl, 'getDatasetsBenchmarksByResearchProblemId'],
        ([params]) => getDatasetsBenchmarksByResearchProblemId(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const columns = useMemo(
        () => [
            {
                header: 'Paper Title',
                accessorKey: 'paper_title',
                cell: (info) => (
                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: info.row.original.paper_id })} style={{ textDecoration: 'none' }}>
                        <PaperTitle title={info.row.original.paper_title} />
                    </Link>
                ),
            },
            {
                header: 'Model',
                accessorKey: 'model_name',
                cell: (info) =>
                    info.getValue() ? (
                        <Link href={reverse(ROUTES.RESOURCE, { id: info.row.original.model_id })} style={{ textDecoration: 'none' }}>
                            {info.getValue() ?? '-'}
                        </Link>
                    ) : (
                        '-'
                    ),
            },
            {
                header: 'Score',
                accessorKey: 'score',
                cell: (info) => info.getValue() ?? '-',
            },
            {
                header: 'Metric',
                accessorKey: 'metric',
                cell: (info) => info.getValue() ?? '-',
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

    const data = useMemo(
        () => (benchmarkDatasetPapers && benchmarkDatasetPapers[selectedMetric] ? benchmarkDatasetPapers[selectedMetric] : []),
        [selectedMetric, benchmarkDatasetPapers],
    );

    const table = useReactTable({
        columns,
        data,
        initialState: {
            sorting: [
                {
                    id: 'score',
                    desc: true,
                },
            ],
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const dataChart = [
        ['Year', selectedMetric, { type: 'string', role: 'tooltip', p: { html: true } }],
        ...(benchmarkDatasetPapers[selectedMetric]
            ? benchmarkDatasetPapers[selectedMetric]
                  .map((c) => {
                      const publishedOn = dayjs(`${c.paper_year}-${c.paper_month ? c.paper_month : '01'}`, 'YYYY-MM');
                      try {
                          return parseFloat(c.score)
                              ? [
                                    publishedOn.toDate(),
                                    parseFloat(c.score),
                                    `<b>Paper</b>: ${c.paper_title}<br /> <b>Model</b>: ${c.model_name ?? '-'}<br /> <b>Score</b>: ${
                                        c.score
                                    }<br /> <b>Published on</b>: ${publishedOn.format('MM-YYYY')}`,
                                ]
                              : null;
                      } catch (error) {
                          return null;
                      }
                  })
                  .filter((v) => v)
            : []),
    ];

    return (
        <div>
            {isLoading && (
                <>
                    <div className="mt-4 mb-4 container">
                        <ContentLoader speed={2} width={400} height={20} viewBox="0 0 400 20" style={{ width: '100% !important' }}>
                            <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        </ContentLoader>
                    </div>
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                </>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <>
                    <TitleBar
                        titleAddition={
                            <SubTitle>
                                {problemData.label} on {resourceData.label}
                            </SubTitle>
                        }
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    className="float-end"
                                    onClick={() => setEditMode((v) => !v)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end="true">
                                        <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: datasetId })}?noRedirect`}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
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
                            onCloseModal={() => loadResourceData(datasetId)}
                        />
                    )}

                    <Container className="p-3 box rounded">
                        <div>
                            <i>Research problem:</i>{' '}
                            <Link
                                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problemData.id, slug: problemData.label })}
                                style={{ textDecoration: 'none', flex: 1 }}
                            >
                                {problemData.label}
                            </Link>
                        </div>
                        <div className="mt-3 mb-3">
                            <ButtonGroup size="sm">
                                <Button disabled>Dataset</Button>
                                {isLoadingDatasets && <Button disabled>Loading...</Button>}
                                {!isLoadingDatasets && (
                                    <UncontrolledButtonDropdown className="flex-shrink-0">
                                        <DropdownToggle caret size="sm" color="secondary">
                                            {resourceData.label}
                                        </DropdownToggle>
                                        <DropdownMenu style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                            {datasets?.content?.map((ds, index) => (
                                                <DropdownItem
                                                    key={index}
                                                    disabled={isLoading}
                                                    onClick={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId: ds.id, problemId }))}
                                                >
                                                    {ds.label}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                )}
                            </ButtonGroup>
                        </div>

                        <>{resourceData.description && <p className="m-0">{resourceData.description}</p>}</>
                        {resourceData.url && <div className="mb-4">{resourceData.url}</div>}
                    </Container>
                </>
            )}
            {!isLoading && !isFailedLoading && !isLoadingPapers && !isFailedLoadingPapers && (
                <div>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <div className="d-flex flex-grow-1">
                            <h1 className="h5 mb-0">Performance trend</h1>
                        </div>
                        <div>
                            <ButtonGroup size="sm">
                                <Button disabled>Research problem</Button>
                                <UncontrolledButtonDropdown className="flex-shrink-0 me-2">
                                    <DropdownToggle caret size="sm" color="secondary">
                                        {problemData.label}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {datasetProblems.map((rp, index) => (
                                            <DropdownItem
                                                key={index}
                                                disabled={isLoading}
                                                onClick={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId, problemId: rp.id }))}
                                            >
                                                {rp.label}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </ButtonGroup>
                            {metrics?.length > 0 && (
                                <ButtonGroup size="sm" className="mt-md-0 mt-sm-1">
                                    <Button disabled>Metric</Button>
                                    <UncontrolledButtonDropdown className="flex-shrink-0 ms-auto">
                                        <DropdownToggle caret size="sm" color="secondary">
                                            {selectedMetric}
                                        </DropdownToggle>
                                        <DropdownMenu end="true">
                                            {metrics.map((m, index) => (
                                                <DropdownItem key={index} disabled={isLoading} onClick={() => setSelectedMetric(m)}>
                                                    {m}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                </ButtonGroup>
                            )}
                        </div>
                    </Container>

                    <Container className="p-3 box rounded ">
                        {dataChart?.length > 1 && (
                            <Chart
                                width="100%"
                                height={300}
                                chartType="ScatterChart"
                                loader={<div>Loading Chart</div>}
                                data={dataChart}
                                options={{
                                    hAxis: { title: 'Year', format: 'MMM yyyy', ticks: getTicksAxisH(dataChart) },
                                    vAxis: { title: selectedMetric },
                                    legend: true,
                                    tooltip: { isHtml: true },
                                    pointSize: 7,
                                    trendlines: {
                                        0: { labelInLegend: 'Linear trendline', tooltip: false, type: 'linear', visibleInLegend: true },
                                    },
                                }}
                                chartEvents={[
                                    {
                                        eventName: 'select',
                                        callback: ({ chartWrapper }) => {
                                            const chart = chartWrapper.getChart();
                                            const selection = chart.getSelection();
                                            if (selection.length === 1) {
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
                                <small className="text-muted mb-0 text-small">Data imported from paperswithcode.com</small>
                            </SubTitle>
                        }
                    >
                        Papers
                    </TitleBar>
                    <Container className="p-0 rounded box">
                        {table.getRowModel().rows?.length > 0 && (
                            <Table>
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id}>
                                                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                        <div
                                                            className="d-flex cursor-pointer select-none"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    header.column.getToggleSortingHandler()(e);
                                                                }
                                                            }}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {/* Add a sort direction indicator */}
                                                            <div className="ms-1">
                                                                {{
                                                                    asc: <FontAwesomeIcon icon={faSortDown} />,
                                                                    desc: <FontAwesomeIcon icon={faSortUp} className="ms-1" />,
                                                                }[header.column.getIsSorted()] ?? null}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        {!table.getRowModel().rows?.length && (
                            <div className="p-4">
                                No papers that addresses {problemData.label} on {resourceData.label} yet.
                                <div className="pt-3">
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
                <Container className="p-0 mt-3 rounded box">
                    <div className="text-center mt-4 mb-4">Failed loading benchmark papers.</div>
                </Container>
            )}
            {isLoadingPapers && !isFailedLoadingPapers && (
                <Container className="p-0 mt-3 rounded box">
                    <div className="text-center mt-4 mb-4 py-4">Loading benchmark papers...</div>
                </Container>
            )}
        </div>
    );
}

export default Benchmark;
