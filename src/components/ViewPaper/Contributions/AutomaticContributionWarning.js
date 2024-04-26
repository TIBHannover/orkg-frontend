import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Button, Alert } from 'reactstrap';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const AutomaticContributionWarning = (props) => {
    function handleVerify() {
        props.onVerifyHandler(props.contribution.id);
    }
    return (
        <>
            <Alert color="smart">
                The information of this contribution are automatically extracted.
                {props.enableEdit && (
                    <Button color="smart" size="sm" style={{ float: 'right' }} onClick={handleVerify}>
                        <Icon icon={faCheck} /> Verify
                    </Button>
                )}
            </Alert>
        </>
    );
};

AutomaticContributionWarning.propTypes = {
    contribution: PropTypes.object.isRequired,
    onVerifyHandler: PropTypes.object.isRequired,
    enableEdit: PropTypes.object.isRequired,
};

export default AutomaticContributionWarning;
