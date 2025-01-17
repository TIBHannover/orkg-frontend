import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';

type CopyIdProps = {
    id: string;
    text?: string;
};

const CopyId: FC<CopyIdProps> = ({ id, text = 'ID' }) => (
    <InputGroup size="sm">
        <InputGroupText className="py-0">{text}</InputGroupText>
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
                <FontAwesomeIcon icon={faClipboard} color="#6c757d" size="xs" />
            </Button>
        </CopyToClipboard>
    </InputGroup>
);

export default CopyId;
