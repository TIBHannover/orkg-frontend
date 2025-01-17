import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

const Overlay = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffffffa3;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const AnimationContainer = styled(CSSTransition)`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
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
    children: React.ReactNode;
    classNameOverlay?: string;
    loadingText?: string | React.ReactNode;
};

const LoadingOverlay: FC<LoadingOverlayProps> = ({
    isLoading = false,
    children,
    classNameOverlay = '',
    loadingText = <h1 className="h4 m-0">Loading</h1>,
}) => (
    <div>
        <AnimationContainer in={isLoading} unmountOnExit classNames="fade-in" timeout={800}>
            <div>
                <Overlay className={classNameOverlay} aria-live="polite" aria-busy="true">
                    <FontAwesomeIcon icon={faSpinner} className="me-2" spin style={{ fontSize: 30 }} />
                    {loadingText}
                </Overlay>
            </div>
        </AnimationContainer>
        {children}
    </div>
);

export default LoadingOverlay;
