import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';

import Button from '@/components/Ui/Button/Button';

const AutomaticContributionWarning = (props) => {
    function handleVerify() {
        props.onVerifyHandler(props.contribution.id);
    }
    return (
        <Alert color="smart">
            The information of this contribution are automatically extracted.
            {props.enableEdit && (
                <Button color="smart" size="sm" style={{ float: 'right' }} onClick={handleVerify}>
                    <FontAwesomeIcon icon={faCheck} /> Verify
                </Button>
            )}
        </Alert>
    );
};

AutomaticContributionWarning.propTypes = {
    contribution: PropTypes.object.isRequired,
    onVerifyHandler: PropTypes.object.isRequired,
    enableEdit: PropTypes.object.isRequired,
};

export default AutomaticContributionWarning;
