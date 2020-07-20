import React from 'react';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import useHeaderBar from './hooks/useHeaderBar';
import VisibilitySensor from 'react-visibility-sensor';
import PropTypes from 'prop-types';

const PageHeaderBarContainer = styled.div`
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    background: #e0e2ea;
    z-index: 1000;
    border-bottom: 1px #d1d3d9 solid;
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.13);
    & .title {
        color: ${props => props.theme.darkblueDarker};
        font-size: 1.1rem;
        flex-grow: 1;
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

function ResearchProblemHeaderBar(props) {
    const [showHeaderBar, handleShowHeaderBar] = useHeaderBar(false);
    return (
        <div>
            {showHeaderBar && (
                <AnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
                    <PageHeaderBarContainer>
                        <Container className="d-flex align-items-center py-2">
                            <div className="title">{props.title}</div>
                            <Button size="sm" color="darkblue" className="float-right" onClick={() => props.toggleEdit()}>
                                <Icon icon={faPen} /> Edit
                            </Button>
                        </Container>
                    </PageHeaderBarContainer>
                </AnimationContainer>
            )}
            <VisibilitySensor onChange={handleShowHeaderBar}>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Research problem</h1>
                    <Button size="sm" color="darkblue" className="float-right" onClick={() => props.toggleEdit()}>
                        <Icon icon={faPen} /> Edit
                    </Button>
                </Container>
            </VisibilitySensor>
        </div>
    );
}

ResearchProblemHeaderBar.propTypes = {
    title: PropTypes.string.isRequired,
    toggleEdit: PropTypes.func.isRequired
};

export default ResearchProblemHeaderBar;
