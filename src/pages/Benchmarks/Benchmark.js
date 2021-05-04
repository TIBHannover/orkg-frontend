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
import { SubTitle, SubtitleSeparator } from 'components/styled';
import useBenchmarkDatasetResource from 'components/Benchmarks/hooks/useBenchmarkDatasetResource';
import useBenchmarkDatasetPapers from 'components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import CodeURLsTooltip from 'components/BenchmarkCard/CodeURLsTooltip';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { useParams } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { useTable, useSortBy } from 'react-table';

function Benchmark() {
    const [resourceData, isLoading, isFailedLoading, loadResourceData] = useBenchmarkDatasetResource();
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const { resourceId } = useParams();
    const history = useHistory();
    const {
        isLoading: isLoadingPapers,
        isFailedLoading: isFailedLoadingPapers,
        benchmarkDatasetPapers,
        metrics,
        selectedMetric,
        selectedMetricVisualization,
        setSelectedMetric,
        setSelectedMetricVisualization
    } = useBenchmarkDatasetPapers({
        datasetId: resourceId
    });

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResourceData(resourceId);
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
                        <div className="text-left">
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
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <h1 className="h5 flex-shrink-0 mb-0">Benchmark</h1>
                        <>
                            <SubtitleSeparator />
                            <SubTitle className="h5 mb-0"> {resourceData.label}</SubTitle>
                        </>
                        {editMode && (
                            <StatementBrowserDialog
                                show={editMode}
                                toggleModal={() => setEditMode(v => !v)}
                                id={resourceId}
                                label={resourceData.label}
                                enableEdit={true}
                                syncBackend={true}
                            />
                        )}
                        <ButtonGroup className="flex-shrink-0" style={{ marginLeft: 'auto' }}>
                            <RequireAuthentication
                                component={Button}
                                size="sm"
                                color="secondary"
                                className="float-right"
                                onClick={() => setEditMode(v => !v)}
                            >
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: resourceId })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </ButtonGroup>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <>
                                    {resourceData.description && <p className="m-0">{resourceData.description}</p>}
                                    {!resourceData.description && <p className="m-0">{resourceData.label}</p>}
                                </>
                                {resourceData.url && <div className="mb-4">{resourceData.url}</div>}
                            </CardBody>
                        </Card>
                    </Container>
                </>
            )}
            {!isLoadingPapers && !isFailedLoadingPapers && (
                <div>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <div className="d-flex flex-grow-1">
                            <h1 className="h5 flex-shrink-0 mb-0">Visualizations</h1>
                        </div>
                        <UncontrolledButtonDropdown className="flex-shrink-0 ml-auto">
                            <DropdownToggle caret size="sm" color="secondary">
                                Metric: {selectedMetricVisualization}
                            </DropdownToggle>
                            <DropdownMenu>
                                {metrics.map((m, index) => (
                                    <DropdownItem key={index} disabled={isLoading} onClick={() => setSelectedMetricVisualization(m)}>
                                        {m}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <Chart
                                    width="100%"
                                    height={300}
                                    chartType="ScatterChart"
                                    loader={<div>Loading Chart</div>}
                                    data={[
                                        ['Year', selectedMetricVisualization, { type: 'string', role: 'tooltip', p: { html: true } }],
                                        ...(benchmarkDatasetPapers[selectedMetricVisualization]
                                            ? benchmarkDatasetPapers[selectedMetricVisualization].map(c => {
                                                  const publishedOn = moment(`${c.paper_year}-${c.paper_month ? c.paper_month : '01'}`, 'YYYY-MM');
                                                  return [
                                                      publishedOn.toDate(),
                                                      c.score,
                                                      `<b>Paper</b>: ${c.paper_title}<br /> <b>Model</b>: ${c.model_name}<br /> <b>Score</b>: ${
                                                          c.score
                                                      }<br /> <b>Published on</b>: ${publishedOn.format('MM-YYYY')}`
                                                  ];
                                              })
                                            : [])
                                    ]}
                                    options={{
                                        hAxis: { title: 'Year', format: 'MMM yyyy' },
                                        vAxis: { title: selectedMetricVisualization },
                                        legend: 'none',
                                        tooltip: { isHtml: true }
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
                                                            resourceId: benchmarkDatasetPapers[selectedMetricVisualization][row].paper_id
                                                        })
                                                    );
                                                }
                                            }
                                        }
                                    ]}
                                />
                            </CardBody>
                        </Card>
                    </Container>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <div className="d-flex flex-grow-1">
                            <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                            <>
                                <SubtitleSeparator />
                                <SubTitle className="mb-0">
                                    <small className="text-muted mb-0 text-small">Data imported from paperswithcode.com</small>
                                </SubTitle>
                            </>
                        </div>
                        <UncontrolledButtonDropdown className="flex-shrink-0 ml-auto">
                            <DropdownToggle caret size="sm" color="secondary">
                                Metric: {selectedMetric}
                            </DropdownToggle>
                            <DropdownMenu>
                                {metrics.map((m, index) => (
                                    <DropdownItem key={index} disabled={isLoading} onClick={() => setSelectedMetric(m)}>
                                        {m}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </Container>
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
                                                        <div className="ml-1">
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <Icon icon={faSortUp} className="ml-1" />
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
                                    {rows.map((row, i) => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()}>
                                                {row.cells.map(cell => {
                                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card>
                    </Container>
                </div>
            )}
        </div>
    );
}

export default Benchmark;
