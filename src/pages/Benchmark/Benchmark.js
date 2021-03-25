import { useState, useEffect } from 'react';
import { Container, Table, Card, CardBody } from 'reactstrap';
import styled from 'styled-components';
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

export const SubtitleSeparator = styled.div`
    background: ${props => props.theme.darkblue};
    width: 2px;
    height: 24px;
    margin: 0 15px;
    content: '';
    display: block;
    opacity: 0.7;
`;

export const SubTitle = styled.div`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
`;

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
                        <div style={{ display: 'flex' }}>
                            <Chart
                                width={400}
                                height={300}
                                chartType="ScatterChart"
                                loader={<div>Loading Chart</div>}
                                data={[['Year', 'F-score'], [2017, 80], [2019, 65], [2020, 70], [2020, 85]]}
                                options={{
                                    hAxis: { title: 'Year', format: '####' },
                                    vAxis: { title: 'F-score', minValue: 0 },
                                    legend: 'none'
                                }}
                            />
                            <Chart
                                width={400}
                                height={300}
                                chartType="ScatterChart"
                                loader={<div>Loading Chart</div>}
                                data={[
                                    ['Year', 'Accuracy'],
                                    [2015, 43],
                                    [2015, 20],
                                    [2016, 55],
                                    [2016, 57],
                                    [2016, 60],
                                    [2018, 64],
                                    [2018, 65],
                                    [2019, 68.5],
                                    [2019, 70],
                                    [2019, 72],
                                    [2019, 75.4],
                                    [2019, 78],
                                    [2019, 69],
                                    [2020, 70],
                                    [2021, 90]
                                ]}
                                options={{
                                    hAxis: { title: 'Year', format: '####' },
                                    vAxis: { title: 'Accuracy', minValue: 0 },
                                    legend: 'none'
                                }}
                            />
                        </div>
                    </Container>
                    <Container>
                        <div className="d-flex flex-grow-1 mt-4 mb-4">
                            <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                            <>
                                <SubtitleSeparator />
                                <SubTitle className="mb-0">
                                    <small className="text-muted mb-0 text-small">Data imported from paperswithcode.com</small>
                                </SubTitle>
                            </>
                        </div>
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
