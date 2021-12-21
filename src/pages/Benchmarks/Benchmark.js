import { useState, useEffect, useMemo } from 'react';
import { Container, Table, Card, CardBody, Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ROUTES from 'constants/routes';
import { Link, useHistory } from 'react-router-dom';
import { reverse } from 'named-urls';
import moment from 'moment';
import { UncontrolledButtonDropdown } from 'reactstrap';
import Chart from 'react-google-charts';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faEllipsisV, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { NavLink } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import { reverseWithSlug } from 'utils';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import useBenchmarkDatasetResource from 'components/Benchmarks/hooks/useBenchmarkDatasetResource';
import useBenchmarkDatasetPapers from 'components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import CodeURLsTooltip from 'components/Benchmarks/BenchmarkCard/CodeURLsTooltip';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { useParams } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { useTable, useSortBy } from 'react-table';
import TitleBar from 'components/TitleBar/TitleBar';

function getTicksAxisH(data) {
    const dateRange = data.slice(1).map(function(value, index) {
        return value[0];
    });
    const maxDate = new Date(Math.max.apply(null, dateRange));
    const minDate = new Date(Math.min.apply(null, dateRange));
    const ticksAxisH = [];
    let year = -1;
    for (
        let i = moment(minDate.getTime())
            .subtract(1, 'M')
            .valueOf();
        i <=
        moment(maxDate.getTime())
            .add(1, 'M')
            .valueOf();
        i = moment(i)
            .add(1, 'M')
            .valueOf()
    ) {
        const tick = new Date(i);
        if (year !== moment(tick).format('MMM yyyy')) {
            ticksAxisH.push({
                v: tick,
                f: moment(tick).format('MMM yyyy')
            });
            year = moment(tick).format('MMM yyyy');
        }
    }
    return ticksAxisH;
}

function Benchmark() {
    const { datasetId, problemId } = useParams();
    const [resourceData, problemData, isLoading, isFailedLoading, loadResourceData] = useBenchmarkDatasetResource({ datasetId, problemId });
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const history = useHistory();
    const {
        isLoading: isLoadingPapers,
        isFailedLoadingPapers,
        benchmarkDatasetPapers,
        datasetProblems,
        metrics,
        selectedMetric,
        setSelectedMetric
    } = useBenchmarkDatasetPapers({
        datasetId,
        problemId
    });

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResourceData(datasetId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

    const columns = useMemo(
        () => [
            {
                Header: 'Paper Title',
                accessor: 'paper_title',
                Cell: cell => (
                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: cell.row.original.paper_id })} style={{ textDecoration: 'none' }}>
                        {cell.row.original.paper_title ?? '-'}
                    </Link>
                )
            },
            {
                Header: 'Model',
                accessor: 'model_name',
                Cell: cell => cell.value ?? '-'
            },
            {
                Header: 'Score',
                accessor: 'score',
                Cell: cell => cell.value ?? '-'
            },
            {
                Header: 'Metric',
                accessor: 'metric',
                Cell: cell => cell.value ?? '-'
            },
            {
                Header: 'Code',
                accessor: 'code_urls',
                Cell: cell => (
                    <CodeURLsTooltip id={cell.row.original.paper_id} title={cell.row.original.paper_title} urls={cell.row.original.code_urls} />
                )
            }
        ],
        []
    );

    const data = useMemo(() => (benchmarkDatasetPapers && benchmarkDatasetPapers[selectedMetric] ? benchmarkDatasetPapers[selectedMetric] : []), [
        selectedMetric,
        benchmarkDatasetPapers
    ]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
            initialState: {
                sortBy: [
                    {
                        id: 'score',
                        desc: true
                    }
                ]
            }
        },
        useSortBy
    );

    const dataChart = [
        ['Year', selectedMetric, { type: 'string', role: 'tooltip', p: { html: true } }],
        ...(benchmarkDatasetPapers[selectedMetric]
            ? benchmarkDatasetPapers[selectedMetric]
                  .map(c => {
                      const publishedOn = moment(`${c.paper_year}-${c.paper_month ? c.paper_month : '01'}`, 'YYYY-MM');
                      try {
                          return parseFloat(c.score)
                              ? [
                                    publishedOn.toDate(),
                                    parseFloat(c.score),
                                    `<b>Paper</b>: ${c.paper_title}<br /> <b>Model</b>: ${c.model_name ?? '-'}<br /> <b>Score</b>: ${
                                        c.score
                                    }<br /> <b>Published on</b>: ${publishedOn.format('MM-YYYY')}`
                                ]
                              : null;
                      } catch (error) {
                          return null;
                      }
                  })
                  .filter(v => v)
            : [])
    ];

    return (
        <div>
            {isLoading && (
                <>
                    <div className="mt-4 mb-4 container">
                        <ContentLoader
                            speed={2}
                            width={400}
                            height={20}
                            viewBox="0 0 400 20"
                            style={{ width: '100% !important' }}
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                        >
                            <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        </ContentLoader>
                    </div>
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
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
                            <>
                                <SubtitleSeparator />
                                <SubTitle>
                                    {problemData.label} on {resourceData.label}
                                </SubTitle>
                            </>
                        }
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    color="secondary"
                                    className="float-end"
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: datasetId })}>
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
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={datasetId}
                            label={resourceData.label}
                            enableEdit={true}
                            syncBackend={true}
                        />
                    )}

                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <div>
                                    <i>Research problem:</i>{' '}
                                    <Link
                                        to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problemData.id, slug: problemData.label })}
                                        style={{ textDecoration: 'none', flex: 1 }}
                                    >
                                        {problemData.label}
                                    </Link>
                                </div>
                                <div>
                                    <i>Dataset:</i> {resourceData.label}
                                </div>

                                <>{resourceData.description && <p className="m-0">{resourceData.description}</p>}</>
                                {resourceData.url && <div className="mb-4">{resourceData.url}</div>}
                            </CardBody>
                        </Card>
                    </Container>
                </>
            )}
            {!isLoading && !isFailedLoading && !isLoadingPapers && !isFailedLoadingPapers && (
                <div>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <div className="d-flex flex-grow-1">
                            <h1 className="h5 flex-shrink-0 mb-0">Performance trend</h1>
                        </div>
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
                                            onClick={() => history.push(reverse(ROUTES.BENCHMARK, { datasetId: datasetId, problemId: rp.id }))}
                                        >
                                            {rp.label}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </ButtonGroup>
                        {metrics?.length > 0 && (
                            <ButtonGroup size="sm">
                                <Button disabled>Metric</Button>
                                <UncontrolledButtonDropdown className="flex-shrink-0 ms-auto">
                                    <DropdownToggle caret size="sm" color="secondary">
                                        {selectedMetric}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {metrics.map((m, index) => (
                                            <DropdownItem key={index} disabled={isLoading} onClick={() => setSelectedMetric(m)}>
                                                {m}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </ButtonGroup>
                        )}
                    </Container>

                    <Container className="p-0">
                        <Card>
                            <CardBody>
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
                                                0: { labelInLegend: 'Linear trendline', tooltip: false, type: 'linear', visibleInLegend: true }
                                            }
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
                                                        history.push(
                                                            reverse(ROUTES.VIEW_PAPER, {
                                                                resourceId: benchmarkDatasetPapers[selectedMetric][row].paper_id
                                                            })
                                                        );
                                                    }
                                                }
                                            }
                                        ]}
                                    />
                                )}
                                {dataChart?.length <= 1 && 'No data to plot!'}
                            </CardBody>
                        </Card>
                    </Container>
                    <TitleBar
                        titleSize="h5"
                        titleAddition={
                            <>
                                <SubtitleSeparator />
                                <SubTitle className="mb-0">
                                    <small className="text-muted mb-0 text-small">Data imported from paperswithcode.com</small>
                                </SubTitle>
                            </>
                        }
                    >
                        Papers
                    </TitleBar>
                    <Container className="p-0">
                        <Card>
                            <Table {...getTableProps()}>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th key={column.getHeaderProps(column.getSortByToggleProps()).key}>
                                                    <div className="d-flex" {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                        {column.render('Header')}
                                                        {/* Add a sort direction indicator */}
                                                        <div className="ms-1">
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <Icon icon={faSortUp} className="ms-1" />
                                                                ) : (
                                                                    <Icon icon={faSortDown} />
                                                                )
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {rows?.length > 0 &&
                                        rows.map((row, i) => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map(cell => {
                                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    {!rows?.length && (
                                        <tr>
                                            <td>
                                                No papers that addresses {problemData.label} on {resourceData.label} yet!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Container>
                </div>
            )}
            {!isLoadingPapers && isFailedLoadingPapers && (
                <Container className="p-0 mt-3">
                    <Card>
                        <div className="text-center mt-4 mb-4">Failed loading benchmark papers.</div>
                    </Card>
                </Container>
            )}
        </div>
    );
}

export default Benchmark;
