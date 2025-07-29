import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import styled from 'styled-components';

import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import PaperMenuBar from '@/components/ViewPaper/PaperHeaderBar/PaperMenuBar';

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
        color: ${(props) => props.theme.secondaryDarker};
    }
`;

const AnimationContainer = styled(motion.div)`
    overflow: hidden;
`;

function PaperHeaderBar(props) {
    const title = useSelector((state) => state.viewPaper.paper.title);

    return (
        <AnimationContainer initial={{ maxHeight: 0 }} animate={{ maxHeight: 60 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <PaperHeaderBarContainer id="paperHeaderBar">
                <Container className="d-flex align-items-center py-2">
                    <div className="title flex-grow-1 text-truncate">
                        {props.editMode ? (
                            <>
                                Edit mode <span className="ps-2">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            title
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
