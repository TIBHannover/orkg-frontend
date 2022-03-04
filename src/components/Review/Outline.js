import propTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.aside`
    position: absolute;
    left: -200px;
    height: 100%;

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
    border-radius: ${props => (props.editMode ? '6px' : '6px 0 0 6px')};
    margin-top: ${props => (props.editMode ? '0px' : '150px')};
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

    &:first-child {
        border-top: none;
    }
`;

const Outline = ({ editMode = false }) => {
    const sections = useSelector(state => state.review.sections);

    return (
        <Wrapper>
            <Box editMode={editMode}>
                <ol style={{ listStyle: 'none' }} className="p-0 m-0">
                    {sections
                        .filter(section => section?.title?.label)
                        .map(section => (
                            <ListItem key={section.id}>
                                <Link to={`#section-${section.id}`} className="text-secondary">
                                    {section.title.label}
                                </Link>
                            </ListItem>
                        ))}
                    <ListItem>
                        <Link to="#section-acknowledgements" className="text-secondary">
                            Acknowledgements
                        </Link>
                    </ListItem>
                    <ListItem>
                        <Link to="#section-references" className="text-secondary">
                            References
                        </Link>
                    </ListItem>
                </ol>
            </Box>
        </Wrapper>
    );
};

Outline.propTypes = {
    editMode: propTypes.bool
};

export default Outline;
