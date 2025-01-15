import LoadingOverlay from 'components/LoadingOverlay/LoadingOverlay';
import { FC } from 'react';
import { Modal } from 'reactstrap';

type ModalWithLoadingProps = {
    children: React.ReactNode;
    isLoading?: boolean;
    toggle?: () => void;
    backdrop?: boolean | string;
} & React.ComponentProps<typeof Modal>;

/**
 * Wrapper for Reactstrap Modal component that adds a loading state
 */
const ModalWithLoading: FC<ModalWithLoadingProps> = ({ children, isLoading = false, toggle = () => {}, backdrop = true, ...props }) => (
    <Modal backdrop={!isLoading ? backdrop : 'static'} toggle={!isLoading ? toggle : undefined} {...props}>
        <LoadingOverlay isLoading={isLoading} classNameOverlay="rounded">
            {children}
        </LoadingOverlay>
    </Modal>
);

export default ModalWithLoading;
