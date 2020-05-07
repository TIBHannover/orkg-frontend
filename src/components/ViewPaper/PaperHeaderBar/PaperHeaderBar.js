import React from 'react';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PaperMenuBar from './PaperMenuBar';

const PaperHeaderBarContainer = styled.div`
    padding: 10px 0;
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    background: #e0e2ea;
    z-index: 1040;
    border-bottom: 1px #d1d3d9 solid;
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.13);
    & .title {
        color: ${props => props.theme.darkblueDarker};
        span {
            font-size: smaller;
        }
    }
`;

function PaperHeaderBar(props) {
    return (
        <PaperHeaderBarContainer>
            <Container className="d-flex align-items-center">
                <div className="title flex-grow-1">
                    {props.editMode ? (
                        <>
                            Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                        </>
                    ) : (
                        <>View Paper</>
                    )}
                </div>
                <PaperMenuBar editMode={props.editMode} paperLink={props.paperLink} toggle={props.toggle} />
            </Container>
        </PaperHeaderBarContainer>
    );
}
PaperHeaderBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    toggle: PropTypes.func.isRequired
};

export default PaperHeaderBar;
