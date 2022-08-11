import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Button, ModalFooter } from 'reactstrap';

function FilterModalFooter({ handleApply, handleCancel, handleReset }) {
    return (
        <ModalFooter className="d-flex justify-content-between">
            <Button className="mx-1" color="light" onClick={handleReset}>
                <Icon icon={faRedoAlt} className="text-secondary" /> Reset
            </Button>
            <div>
                <Button className="mx-1" color="light" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button className="mx-1" color="primary" onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </ModalFooter>
    );
}

FilterModalFooter.propTypes = {
    handleApply: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    handleReset: PropTypes.func.isRequired,
};

export default FilterModalFooter;
