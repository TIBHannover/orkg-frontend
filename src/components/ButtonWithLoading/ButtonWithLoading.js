import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const ButtonWithLoading = ({ children, isLoading = false, loadingMessage = 'Loading', ...props }) => (
    <Button disabled={isLoading} {...props}>
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
    loadingMessage: PropTypes.string,
};

export default ButtonWithLoading;
