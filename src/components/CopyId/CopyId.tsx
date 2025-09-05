import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';

import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import InputGroupText from '@/components/Ui/Input/InputGroupText';

type CopyIdProps = {
    id: string;
    text?: string;
    size?: 'sm' | 'lg' | undefined;
};

const CopyId: FC<CopyIdProps> = ({ id, text = 'ID', size = 'sm' }) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    let iconSize = size === 'sm' ? 'xs' : size;

    if (size === 'lg') {
        iconSize = 'md';
    }

    return (
        <InputGroup size={size}>
            <InputGroupText className="py-0">{text}</InputGroupText>
            <Input
                bsSize={size}
                className="text-muted py-0 bg-white"
                length={id.length}
                disabled
                value={id}
                style={{ width: 80, minHeight: 'initial', fontSize: size === 'sm' ? '80%' : '100%' }}
                aria-label="ID"
            />

            <Button
                className="py-0 border border-light-darker d-flex align-items-center"
                size={size}
                color="light"
                onClick={() => copyToClipboard(id)}
            >
                <FontAwesomeIcon icon={faClipboard} color="#6c757d" size={iconSize as SizeProp} />
            </Button>
        </InputGroup>
    );
};

export default CopyId;
