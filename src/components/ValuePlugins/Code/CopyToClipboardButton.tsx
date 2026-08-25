import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { FC, ReactNode } from 'react';

import useCopyWithFeedback from '@/components/hooks/useCopyWithFeedback';

type CopyToClipboardButtonProps = {
    code: string;
    children?: ReactNode;
};

const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = ({ code, children }) => {
    const { isCopied, copy } = useCopyWithFeedback();

    return (
        <div className="relative">
            <Button
                variant="primary"
                size="sm"
                isIconOnly
                aria-label="Copy code to clipboard"
                className="absolute right-2.5 top-2.5"
                onPress={() => copy(code)}
            >
                <FontAwesomeIcon icon={isCopied ? faCheck : faClipboard} />
            </Button>
            {children}
        </div>
    );
};

export default CopyToClipboardButton;
