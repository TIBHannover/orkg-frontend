import LoadingOverlay from 'components/LoadingOverlay/LoadingOverlay';
import PropTypes from 'prop-types';
import { Modal } from 'reactstrap';

/**
 * Wrapper for Reactstrap Modal component that adds a loading state
 */
const ModalWithLoading = ({ children, isLoading = false, toggle = () => {}, backdrop = true, ...props }) => (
    <Modal backdrop={!isLoading ? backdrop : 'static'} toggle={!isLoading ? toggle : null} {...props}>
        <LoadingOverlay isLoading={isLoading} classNameOverlay="rounded">
            {children}
        </LoadingOverlay>
    </Modal>
);

ModalWithLoading.propTypes = {
    children: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
    toggle: PropTypes.func,
    backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default ModalWithLoading;
