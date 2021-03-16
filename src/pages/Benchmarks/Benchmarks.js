import { Component } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import BenchmarkCard from 'components/BenchmarkCard/BenchmarkCard';
import { getBenchmarksByResearchFieldId } from 'services/backend/researchFields';
import { getResearchFieldsWithBenchmarks } from 'services/backend/benchmarks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Container } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane, NavLink } from 'reactstrap';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
`;

export const StyledResearchFieldWrapper = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border: ${props => props.theme.borderWidth} solid ${props => props.theme.orkgPrimaryColor};
    padding: 15px 30px;
`;

export const StyledResearchFieldList = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;
`;

const StyledResearchFieldItem = styled(NavLink)`
    padding: 12px 10px 12px 15px;
    margin-bottom: 5px;
    transition: 0.3s background;
    border-top-left-radius: ${props => props.theme.borderRadius};
    border-bottom-left-radius: ${props => props.theme.borderRadius};
    border: 1px solid ${props => props.theme.ultraLightBlueDarker};
    background-color: ${props => props.theme.ultraLightBlue};
    color: inherit;

    cursor: pointer !important;

    > span {
        cursor: pointer;
    }

    &.active {
        background: ${props => props.theme.orkgPrimaryColor};
        color: #fff;
        cursor: initial !important;
        border-color: ${props => props.theme.orkgPrimaryColor};
    }
`;

class Benchmarks extends Component {
    state = {
        benchmarks: [],
        isNextPageLoading: false,
        failedLoading: false,
        activeTab: 0
    };

    componentDidMount() {
        document.title = 'Benchmarks - ORKG';
        this.loadBenchmarks();
        this.setActiveTab();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.hash !== this.props.location.hash) {
            this.setActiveTab();
        }
    }

    setActiveTab = () => {
        const { hash } = this.props.location;

        if (!hash) {
            return;
        }

        const activeTab = hash.replace('#', '');

        this.setState({
            activeTab: parseInt(activeTab)
        });
    };

    /*
    loadBenchmarks = () => {
        this.setState({ isNextPageLoading: true });
        //the response is a series of dictionaries with each item as id and label
        //since it is one variable , we replace the Promise.all with the function call
        getResearchFieldsWithBenchmarks()
            .then(async data => {
                const benchmarksData = [];
                //here each researchField item is a dictionary
                for (const researchField of data) {
                    const benchmarksStats = await getBenchmarksByResearchFieldId(researchField.id);

                    //here each benchmark item is a dictionary too
                    for (const benchmarkObject of benchmarksStats) {
                        benchmarkObject['research_field'] = researchField;
                    }

                    benchmarksData.push(benchmarksStats);
                }
                const g = groupBy(benchmarksData, 'research_field.label');

                this.setState({
                    benchmarks: g,
                    isNextPageLoading: false,
                    failedLoading: false
                });
            })
            .catch(e => {
                this.setState({
                    failedLoading: true,
                    isNextPageLoading: false
                });
            });
    };
    */

    loadBenchmarks = () => {
        this.setState({ isNextPageLoading: true });
        const benchmarksData = [
            {
                id: 'R9143',
                name: 'Question Answering',
                numDatasets: 10,
                numPapers: 20,
                numCode: 11,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R69806',
                name: 'Named Entity Recognition',
                numDatasets: 5,
                numPapers: 10,
                numCode: 9,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R9145',
                name: 'Semantic Question Answering',
                numDatasets: 1,
                numPapers: 2,
                numCode: 0,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R2039',
                name: 'Collaborative question answering',
                numDatasets: 1,
                numPapers: 1,
                numCode: 1,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R44249',
                name: 'Named Entity Recognition and Classification',
                numDatasets: 14,
                numPapers: 50,
                numCode: 29,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R49505',
                name: 'Document classification',
                numDatasets: 24,
                numPapers: 140,
                numCode: 57,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R34275',
                name: 'Machine translation',
                numDatasets: 30,
                numPapers: 250,
                numCode: 140,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R38192',
                name: 'End-to-end relation extraction',
                numDatasets: 10,
                numPapers: 30,
                numCode: 11,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R44342',
                name: 'Relation extraction',
                numDatasets: 40,
                numPapers: 200,
                numCode: 86,
                research_field: { id: 'R133', label: 'Artificial Intelligence/Robotics' }
            },
            {
                id: 'R38193',
                name: 'Joint entity and relation extraction',
                numDatasets: 1,
                numPapers: 1,
                numCode: 0,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            },
            {
                id: 'R44284',
                name: 'Named entity recognition and relation classification',
                numDatasets: 3,
                numPapers: 14,
                numCode: 5,
                research_field: { id: 'R132', label: 'Computer Sciences' }
            }
        ];
        const g = groupBy(benchmarksData, 'research_field.label');
        this.setState({
            benchmarks: g,
            isNextPageLoading: false,
            failedLoading: false
        });
    };

    render() {
        return (
            <>
                <Container>
                    <h1 className="h4 mt-4 mb-4">View all benchmarks</h1>
                </Container>
                <Container className="box rounded p-4 clearfix">
                    <p>
                        <i>Benchmarks</i> organize the state-of-the-art empirical research within research fields and are powered in part by automated
                        information extraction within a human-in-the-loop curation model.{' '}
                    </p>
                    <p>
                        Further information about benchmarks can be also found in the{' '}
                        <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Benchmarks" target="_blank" rel="noopener noreferrer">
                            ORKG wiki
                        </a>
                        .
                    </p>
                    {this.state.benchmarks && Object.keys(this.state.benchmarks).length > 0 && (
                        <Row noGutters={true}>
                            <Col md={3} sm={12}>
                                <StyledResearchFieldList>
                                    {Object.keys(this.state.benchmarks)
                                        .reverse()
                                        .map((rf, key) => (
                                            <li key={`${rf}`}>
                                                <StyledResearchFieldItem className={this.state.activeTab === key ? 'active' : ''} href={`#${key}`}>
                                                    {rf === 'null' || '' ? 'Others' : rf}
                                                </StyledResearchFieldItem>
                                            </li>
                                        ))}
                                </StyledResearchFieldList>
                            </Col>

                            <Col md={9} sm={12} className="d-flex">
                                <StyledResearchFieldWrapper className="flex-grow-1 justify-content-center">
                                    <TabContent activeTab={this.state.activeTab}>
                                        {Object.keys(this.state.benchmarks)
                                            .reverse()
                                            .map((rf, key) => (
                                                <TabPaneStyled key={`${rf}`} tabId={key}>
                                                    <Row>
                                                        {this.state.benchmarks[rf].map(benchmark => (
                                                            //when connecting to the service, we would then use 'research_problem' as key
                                                            //query upon the id
                                                            //<BenchmarkCard key={`${rf}-${benchmark[research_problem].id}`} research_problem_benchmark={benchmark} />
                                                            <BenchmarkCard key={`${rf}-${benchmark.id}`} research_problem_benchmark={benchmark} />
                                                        ))}
                                                    </Row>
                                                </TabPaneStyled>
                                            ))}
                                    </TabContent>
                                </StyledResearchFieldWrapper>
                            </Col>
                        </Row>
                    )}
                    {Object.keys(this.state.benchmarks).length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No benchmarks yet!</div>
                    )}
                    {this.state.failedLoading && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">Something went wrong while loading benchmarks!</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                </Container>
            </>
        );
    }
}

Benchmarks.propTypes = {
    location: PropTypes.object.isRequired
};

export default withRouter(Benchmarks);
