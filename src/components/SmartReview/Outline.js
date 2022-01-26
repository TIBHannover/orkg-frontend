import propTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import readingTime from 'reading-time';
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
`;

const Outline = ({ editMode = false }) => {
    const sections = useSelector(state => state.smartReview.sections);

    const timeEstimation = useMemo(() => {
        const text = sections.flatMap(section => section.markdown?.label).join(' ');
        return text ? readingTime(text)?.text : '0 min read';
    }, [sections]);

    return (
        <Wrapper>
            <Box editMode={editMode}>
                <div className="mb-2 text-muted text-uppercase" style={{ fontWeight: 700, fontSize: '80%' }}>
                    {timeEstimation}
                </div>
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
