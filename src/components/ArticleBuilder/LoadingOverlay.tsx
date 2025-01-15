import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

const Overlay = styled.div`
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #ffffffa3;
    display: flex;
    font-size: 30px;
    align-items: center;
    justify-content: center;
`;

const AnimationContainer = styled(CSSTransition)`
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 10000;

    &.fade-in-enter {
        opacity: 0;
    }
    &.fade-in-enter.fade-in-enter-active {
        opacity: 1;
        transition: 0.7s opacity;
    }
    &.fade-in-exit {
        opacity: 1;
    }
    &.fade-in-exit.fade-in-exit-active {
        opacity: 0;
        transition: 0.7s opacity;
    }
`;

type LoadingOverlayProps = {
    isLoading?: boolean;
};
const LoadingOverlay: FC<LoadingOverlayProps> = ({ isLoading = false }) => (
    <AnimationContainer in={isLoading} unmountOnExit classNames="fade-in" timeout={800}>
        <div>
            <Overlay className="text-secondary">
                <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                Loading...
            </Overlay>
        </div>
    </AnimationContainer>
);

export default LoadingOverlay;
