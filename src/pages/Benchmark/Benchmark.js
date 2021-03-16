import { useState, useEffect } from 'react';
import { Container, Table, Card, CardBody } from 'reactstrap';
import Chart from 'react-google-charts';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ResearchProblemHeaderBar from 'components/ResearchProblem/ResearchProblemHeaderBar';
import useBenchmarkDatasetResource from 'components/Benchmarks/hooks/useBenchmarkDatasetResource';
//we now have a backend service described here https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263
import useBenchmarkDatasetPapers from 'components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import PropTypes from 'prop-types';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
//import ROUTES from 'constants/routes';
import { usePrevious } from 'react-use';
import BenchmarkPaperRowCard from 'components/BenchmarkCard/BenchmarkPaperRowCard';

function Benchmark(props) {
    const [resourceData, isLoading, isFailedLoading, loadResourceData] = useBenchmarkDatasetResource();
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    //if we want to restric the page to display only 10 papers, etc. we would activate the functionality
    //const [benchmarkPapersData, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useBenchmarkDatasetPapers();
    const [benchmarkPapersData] = useBenchmarkDatasetPapers();
    const { resourceId } = props.match.params;

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResourceData(resourceId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

    return (
        <div>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <div>
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
                    {/*customized ResearchProblemHeaderBar with the parameters "Benchmark" */}
                    <ResearchProblemHeaderBar toggleEdit={() => setEditMode(v => !v)} header="Benchmark" title={resourceData.label} id={resourceId} />
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <h3 className="mt-4 mb-4">{resourceData && resourceData.label}</h3>
                                {resourceData.description && <div className="mb-4">{resourceData.description}</div>}
                                {resourceData.url && <div className="mb-4">{resourceData.url}</div>}
                            </CardBody>
                        </Card>
                    </Container>
                    <Container>
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Visualizations</h1>
                    </Container>
                    <Container>
                        <Chart
                            width={400}
                            height={300}
                            chartType="LineChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                [{ type: 'number', label: 'x' }, { type: 'number', label: 'values' }],
                                [1, 100],
                                [2, 120],
                                [3, 130],
                                [4, 90],
                                [5, 70],
                                [6, 30],
                                [7, 80],
                                [8, 100]
                            ]}
                            options={{
                                intervals: { style: 'sticks' },
                                legend: 'none'
                            }}
                        />
                    </Container>
                    <Container>
                        <h1 className="h4 mt-4 mb-4 flex-grow-y1">Papers</h1>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Paper Title</th>
                                        <th>Model</th>
                                        <th>Score</th>
                                        <th>Metric</th>
                                        <th>Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {benchmarkPapersData.length > 0 &&
                                        benchmarkPapersData.map(benchmarkPapersData => {
                                            return (
                                                benchmarkPapersData && (
                                                    <BenchmarkPaperRowCard key={`pc${resourceId}`} benchmark_details={benchmarkPapersData} />
                                                )
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

Benchmark.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            resourceId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default Benchmark;
