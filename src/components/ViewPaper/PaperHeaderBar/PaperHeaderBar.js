import React from 'react';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PaperMenuBar from './PaperMenuBar';
import { CSSTransition } from 'react-transition-group';

const PaperHeaderBarContainer = styled.div`
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
    }
`;

const AnimationContainer = styled(CSSTransition)`
    &.fade-appear {
        max-height: 0;
        transition: max-height 0.5s ease;
        overflow: hidden;
        padding: 0;
    }

    &.fade-appear-active {
        transition: max-height 0.5s ease;
        max-height: 50px;
    }
`;

function PaperHeaderBar(props) {
    return (
        <AnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
            <PaperHeaderBarContainer>
                <Container className="d-flex align-items-center py-2">
                    <div className="title flex-grow-1 text-truncate">
                        {props.editMode ? (
                            <>
                                Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            props.paperTitle
                        )}
                    </div>
                    <PaperMenuBar editMode={props.editMode} paperLink={props.paperLink} toggle={props.toggle} />
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
}
PaperHeaderBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    toggle: PropTypes.func.isRequired,
    paperTitle: PropTypes.string.isRequired
};

export default PaperHeaderBar;
