import React from 'react';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import useHeaderBar from './hooks/useHeaderBar';
import { HeaderAnimationContainer, PageHeaderBarContainer } from './styled';
import VisibilitySensor from 'react-visibility-sensor';
import PropTypes from 'prop-types';

function ResearchProblemHeaderBar(props) {
    const [showHeaderBar, handleShowHeaderBar] = useHeaderBar(false);
    return (
        <div>
            {showHeaderBar && (
                <HeaderAnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
                    <PageHeaderBarContainer>
                        <Container className="d-flex align-items-center py-2">
                            <div className="title">{props.title}</div>
                            <Button size="sm" color="darkblue" className="float-right" onClick={() => props.toggleEdit()}>
                                <Icon icon={faPen} /> Edit
                            </Button>
                        </Container>
                    </PageHeaderBarContainer>
                </HeaderAnimationContainer>
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
