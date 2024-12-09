import { ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Container } from 'reactstrap';
import styled from 'styled-components';

const AnimationContainer = styled(CSSTransition)`
    &.slide-enter {
        max-height: 0;
        overflow: hidden;
    }

    &.slide-enter.slide-enter-active,
    &.slide-exit {
        max-height: 50px;
        transition: 0.2s ease-out;
    }

    &.slide-exit.slide-exit-active {
        max-height: 0px;
        overflow: hidden;
        transition: 0.2s ease-in;
    }
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
        <AnimationContainer in={isVisible} unmountOnExit classNames="slide" timeout={{ enter: 800, exit: 800 }}>
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
    );
}

export default EditModeHeader;
