import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';

const CopyId = ({ id }) => (
    <InputGroup size="sm">
        <InputGroupText className="py-0">ID</InputGroupText>
        <Input
            bsSize="sm"
            className="text-muted py-0 bg-white"
            length={id.length}
            disabled
            value={id}
            style={{ width: 80, minHeight: 'initial', fontSize: '80%' }}
            aria-label="ID"
        />
        <CopyToClipboard
            text={id}
            onCopy={() => {
                toast.dismiss();
                toast.success('ID copied to clipboard');
            }}
        >
            <Button className="py-0 border border-light-darker d-flex align-items-center" size="sm" color="light">
                <Icon icon={faClipboard} color="#6c757d" size="xs" />
            </Button>
        </CopyToClipboard>
    </InputGroup>
);

CopyId.propTypes = {
    id: PropTypes.string.isRequired,
};

export default CopyId;
