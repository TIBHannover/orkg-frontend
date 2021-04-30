import { useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import BenchmarkCard from 'components/BenchmarkCard/BenchmarkCard';
import useBenchmarks from 'components/Benchmarks/hooks/useBenchmarks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PWC_LOGO from 'assets/img/poweredby/papers-with-code.png';
import { Row, Container } from 'reactstrap';
import styled from 'styled-components';

const ObservatoryBoxStyled = styled.div`
    float: right;
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    align-items: center;
    max-width: 200px;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

function Benchmarks() {
    const [filterLabel, setFilterLabel] = useState('');
    const handleLabelFilter = e => {
        setFilterLabel(e.target.value);
    };

    const { benchmarks, isLoadingBenchmarks } = useBenchmarks();

    return (
        <>
            <Container>
                <h1 className="h4 mt-4 mb-4">View all benchmarks</h1>
            </Container>
            <Container className="box rounded p-4 clearfix">
                <div>
                    <ObservatoryBoxStyled>
                        Data imported from{' '}
                        <a href="https://paperswithcode.com/" target="_blank" rel="noopener noreferrer" className="text-center">
                            <img className="p-2" src={PWC_LOGO} alt="papers with code logo" style={{ maxWidth: 200, maxHeight: 60 }} />
                        </a>
                    </ObservatoryBoxStyled>
                </div>
                <p>
                    <i>Benchmarks</i> organize the state-of-the-art empirical research within research fields and are powered in part by automated
                    information extraction within a human-in-the-loop curation model.{' '}
                </p>
                <div>
                    Further information about benchmarks can be also found in the{' '}
                    <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Benchmarks" target="_blank" rel="noopener noreferrer">
                        ORKG wiki
                    </a>
                </div>

                <Row className="mt-3 flex-grow-1 justify-content-center">
                    {benchmarks?.length > 0 &&
                        benchmarks.map(benchmark => {
                            return <BenchmarkCard key={`${benchmark.id}`} benchmark={benchmark} />;
                        })}
                </Row>

                {benchmarks.length === 0 && !isLoadingBenchmarks && <div className="text-center mt-4 mb-4">No benchmarks yet!</div>}
                {isLoadingBenchmarks && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
}

export default Benchmarks;
