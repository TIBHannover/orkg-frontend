import React from 'react';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import BenchmarkCard from 'components/BenchmarkCard/BenchmarkCard';
import useBenchmarks from 'components/Benchmarks/hooks/useBenchmarks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Col, Row, FormGroup, Label, Form, Input, Container } from 'reactstrap';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

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

const SubTitle = styled.div`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
`;

function Benchmarks(props) {
    const [filterLabel, setFilterLabel] = React.useState('');
    const handleLabelFilter = e => {
        setFilterLabel(e.target.value);
    };

    const [benchmarks, isLoadingBenchmarks, hasNextPage, isLastPageReached, loadMoreBenchmarks] = useBenchmarks();

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
                    <SubTitle className="mb-0">
                        <small className="text-muted mb-0 text-small">
                            Data imported from{' '}
                            <a href="https://paperswithcode.com/" target="_blank" rel="noopener noreferrer">
                                paperswithcode.com
                            </a>
                        </small>
                    </SubTitle>
                </p>
                <Form className="mb-3">
                    <Row form>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="filterLabel">Filter by Label</Label>
                                <Input value={filterLabel} type="text" name="filterLabel" onChange={handleLabelFilter} />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
                {/*<hr className="mt-3" />*/}
                {/*<SharePaper title={this.props.viewPaper.title} />*/}

                <Row noGutters={true}>
                    <Col md={12} sm={12} className="d-flex">
                        <StyledResearchFieldWrapper className="row flex-grow-1 justify-content-center">
                            {benchmarks.map(benchmark => {
                                return (
                                    <BenchmarkCard key={`${benchmark.research_field.label}-${benchmark.id}`} research_problem_benchmark={benchmark} />
                                );
                            })}
                        </StyledResearchFieldWrapper>
                    </Col>
                </Row>
                {benchmarks.length === 0 && !isLoadingBenchmarks && <div className="text-center mt-4 mb-4">No benchmarks yet!</div>}
                {isLoadingBenchmarks && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!isLoadingBenchmarks && hasNextPage && !isLastPageReached && (
                    <div style={{ cursor: 'pointer' }} className="text-center" action onClick={!isLoadingBenchmarks ? loadMoreBenchmarks : undefined}>
                        <Icon icon={faAngleDoubleDown} /> Load more benchmarks
                    </div>
                )}
                {!hasNextPage && isLastPageReached && <div className="text-center mt-4 mb-4">You have reached the last page.</div>}
            </Container>
        </>
    );
}

Benchmarks.propTypes = {
    location: PropTypes.object.isRequired
};

export default withRouter(Benchmarks);
