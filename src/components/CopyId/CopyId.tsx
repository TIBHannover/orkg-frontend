import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';

type CopyIdProps = {
    id: string;
    text?: string;
};

const CopyId: FC<CopyIdProps> = ({ id, text = 'ID' }) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    return (
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

            <Button className="py-0 border border-light-darker d-flex align-items-center" size="sm" color="light" onClick={() => copyToClipboard(id)}>
                <FontAwesomeIcon icon={faClipboard} color="#6c757d" size="xs" />
            </Button>
        </InputGroup>
    );
};

export default CopyId;
