import { motion } from 'framer-motion';
import { FC } from 'react';
import styled from 'styled-components';

import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
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

type PaperHeaderBarProps = {
    editMode: boolean;
    disableEdit: boolean;
    toggle: (key: string) => void;
};

const PaperHeaderBar: FC<PaperHeaderBarProps> = ({ editMode, disableEdit, toggle }) => {
    const { resourceId } = useParams();
    const { paper } = useViewPaper({ paperId: resourceId });

    return (
        <AnimationContainer initial={{ maxHeight: 0 }} animate={{ maxHeight: 60 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <PaperHeaderBarContainer id="paperHeaderBar">
                <Container className="d-flex align-items-center py-2">
                    <div className="title flex-grow-1 text-truncate">
                        {editMode ? (
                            <>
                                Edit mode <span className="ps-2">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            paper?.title || ''
                        )}
                    </div>
                    <ButtonGroup className="flex-shrink-0">
                        <PaperMenuBar disableEdit={disableEdit} editMode={editMode} toggle={toggle} />
                    </ButtonGroup>
                </Container>
            </PaperHeaderBarContainer>
        </AnimationContainer>
    );
};

export default PaperHeaderBar;
