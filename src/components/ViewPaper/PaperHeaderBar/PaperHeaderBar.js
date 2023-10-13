import { ButtonGroup, Container } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import { useSelector } from 'react-redux';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';

const PaperHeaderBarContainer = styled.div`
    position: fixed;
    top: 72px;
    right: 0;
    left: 0;
    background: #e0e2ea;
    z-index: 1000;
    border-bottom: 1px #d1d3d9 solid;
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.13);
    & .title {
        color: ${props => props.theme.secondaryDarker};
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
    const label = useSelector(state => state.viewPaper.paperResource?.label);

    return (
        <AnimationContainer in={true} appear={true} classNames="fade" timeout={500}>
            <PaperHeaderBarContainer id="paperHeaderBar">
                <Container className="d-flex align-items-center py-2">
                    <div className="title flex-grow-1 text-truncate">
                        {props.editMode ? (
                            <>
                                Edit mode <span className="ps-2">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            label
                        )}
                    </div>
                    <ButtonGroup className="flex-shrink-0">
                        <PaperMenuBar disableEdit={props.disableEdit} editMode={props.editMode} toggle={props.toggle} />
                    </ButtonGroup>
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
}
PaperHeaderBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    disableEdit: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default PaperHeaderBar;
