import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { Button } from 'reactstrap';

const CopyToClipboardButton = ({ code, children }) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('Copied');
        }
    }, [state.value]);

    return (
        <div className="position-relative">
            <Button color="primary" className="position-absolute" size="sm" style={{ right: 10, top: 10 }} onClick={() => copyToClipboard(code)}>
                <FontAwesomeIcon icon={faClipboard} />
            </Button>

            {children}
        </div>
    );
};

CopyToClipboardButton.propTypes = {
    code: PropTypes.string.isRequired,
    children: PropTypes.node,
};

export default CopyToClipboardButton;
