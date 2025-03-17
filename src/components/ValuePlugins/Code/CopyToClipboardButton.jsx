import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';

const CopyToClipboardButton = ({ code, children }) => (
    <div className="position-relative">
        <CopyToClipboard
            text={code}
            onCopy={() => {
                toast.dismiss();
                toast.success('Copied');
            }}
        >
            <Button color="primary" className="position-absolute" size="sm" style={{ right: 10, top: 10 }}>
                <FontAwesomeIcon icon={faClipboard} />
            </Button>
        </CopyToClipboard>
        {children}
    </div>
);

CopyToClipboardButton.propTypes = {
    code: PropTypes.string.isRequired,
    children: PropTypes.node,
};

export default CopyToClipboardButton;
