import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
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

const AnimationContainer = styled(motion.div)`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 10000;
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
    <div style={{ position: 'relative' }}>
        <AnimatePresence>
            {isLoading && (
                <AnimationContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                    <Overlay className={classNameOverlay} aria-live="polite" aria-busy="true">
                        <FontAwesomeIcon icon={faSpinner} className="me-2" spin style={{ fontSize: 30 }} />
                        {loadingText}
                    </Overlay>
                </AnimationContainer>
            )}
        </AnimatePresence>
        {children}
    </div>
);

export default LoadingOverlay;
