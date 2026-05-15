import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, toast } from '@heroui/react';
import { FC, useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';

type CopyIdProps = {
    id: string;
    text?: string;
    size?: 'sm' | 'lg';
    fullWidth?: boolean;
};

const CopyId: FC<CopyIdProps> = ({ id, text = 'ID', size = 'sm', fullWidth = false }) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const rootClass = fullWidth ? 'flex w-full' : 'inline-flex';

    return (
        <span className={`${rootClass} items-center border border-border rounded-lg overflow-hidden ${textSize}`}>
            <span className="bg-default-100 text-default-600 px-2 py-0.5 border-r border-border whitespace-nowrap">{text}</span>
            <span className={`text-default-500 px-2 py-0.5 select-all ${fullWidth ? 'flex-1 min-w-0 truncate' : ''}`}>{id}</span>
            <Button
                size="sm"
                isIconOnly
                variant="tertiary"
                className="rounded-none border-l border-border"
                aria-label="Copy ID"
                onPress={() => copyToClipboard(id)}
            >
                <FontAwesomeIcon icon={faClipboard} />
            </Button>
        </span>
    );
};

export default CopyId;
