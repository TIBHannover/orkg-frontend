import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Container } from 'reactstrap';
import styled from 'styled-components';

const AnimationContainer = styled(motion.div)`
    overflow: hidden;
`;

export const EditModeContainer = styled(Container)`
    background-color: ${(props) => props.theme.secondary}!important;
    color: #fff;
    padding: 8px 25px !important;
    display: flex;
    align-items: center;
    box-shadow: 0px -2px 4px 0px rgb(0 0 0 / 13%);
    position: relative;
    z-index: 1;
`;

export const Title = styled.div`
    font-size: 1.1rem;
    flex-grow: 1;
    & span {
        font-size: small;
        color: ${(props) => props.theme.lightDarker};
    }
`;

type EditModeHeaderProps = {
    isVisible: boolean;
    message?: string | ReactNode;
};

function EditModeHeader({ isVisible, message = null }: EditModeHeaderProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <AnimationContainer
                    initial={{ maxHeight: 0 }}
                    animate={{ maxHeight: 50 }}
                    exit={{ maxHeight: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                >
                    <div>
                        <EditModeContainer className="rounded-top">
                            <Title>
                                {!message ? (
                                    <>
                                        Edit mode <span className="ps-2">Every change you make is automatically saved</span>
                                    </>
                                ) : (
                                    message
                                )}
                            </Title>
                        </EditModeContainer>
                    </div>
                </AnimationContainer>
            )}
        </AnimatePresence>
    );
}

export default EditModeHeader;
