import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

/**
 * Wrapper for Reactstrap Button component that adds a loading state
 */
const ButtonWithLoading = ({ children, isLoading = false, loadingMessage = 'Loading', isDisabled = false, ...props }) => (
    <Button disabled={isLoading || isDisabled} {...props}>
        {!isLoading ? (
            children
        ) : (
            <span>
                <Icon icon={faSpinner} spin /> {loadingMessage}
            </span>
        )}
    </Button>
);

ButtonWithLoading.propTypes = {
    children: PropTypes.node.isRequired,
    isLoading: PropTypes.bool,
    isDisabled: PropTypes.bool,
    loadingMessage: PropTypes.string,
};

export default ButtonWithLoading;
