import useScroll from 'components/Review/hooks/useScroll';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.aside`
    position: absolute;
    left: -200px;
    display: ${props => (!props.fullWidth ? 'block' : 'none')};
    height: 100%;
    z-index: 999;
    // when the screen is too small, hide the outline, the responsiveness can be improved in the future
    @media only screen and (max-width: 1750px) {
        display: none;
    }
`;

const Box = styled.div`
    position: sticky;
    top: 150px;
    bottom: 250px;
    width: 200px;
    background: #d7dae3;
    margin-bottom: 50px;
    border-radius: ${props => (props.fullWidth ? '0 6px 6px 0' : '6px 0 0 6px')};
    padding: 10px;
    max-height: calc(100vh - 190px);
    overflow-y: auto;

    a:focus {
        color: ${props => props.theme.secondary} !important;
    }
`;

const ListItem = styled.li`
    border-top: 1px solid #c7ccda;
    padding: 5px 0;
    font-size: 95%;
    a {
        color: #5c5c75;
    }
    &:first-child {
        border-top: none;
    }
`;

const Outline = () => {
    useScroll();
    const showReferences = useSelector(state => state.comparison.comparisonResource?.references?.length > 0 ?? false);
    const showRelatedResources = useSelector(state => state.comparison.comparisonResource?.resources?.length > 0 ?? false);
    const showRelatedFigures = useSelector(state => state.comparison.comparisonResource?.figures?.length > 0 ?? false);
    const showVisualizations = useSelector(state => state.comparison.comparisonResource?.visualizations?.length > 0 ?? false);

    const fullWidth = useSelector(state => state.comparison.configuration.fullWidth ?? false);

    return (
        <Wrapper fullWidth={fullWidth}>
            <Box fullWidth={fullWidth}>
                <ol style={{ listStyle: 'none' }} className="p-0 m-0">
                    <ListItem>
                        <Link to="#description">Description</Link>
                    </ListItem>
                    {showVisualizations && (
                        <ListItem>
                            <Link to="#visualizations">Visualizations</Link>
                        </ListItem>
                    )}
                    <ListItem>
                        <Link to="#comparisonTable">Comparison table</Link>
                    </ListItem>
                    {showRelatedResources && (
                        <ListItem>
                            <Link to="#relatedResources">Related resources</Link>
                        </ListItem>
                    )}
                    {showRelatedFigures && (
                        <ListItem>
                            <Link to="#relatedFigures">Related figures</Link>
                        </ListItem>
                    )}
                    {showReferences && (
                        <ListItem>
                            <Link to="#dataSources">Data sources</Link>
                        </ListItem>
                    )}
                    <ListItem>
                        <Link to="#provenance">Provenance</Link>
                    </ListItem>
                </ol>
            </Box>
        </Wrapper>
    );
};

export default Outline;
