import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC } from 'react';

import useCopyWithFeedback from '@/components/hooks/useCopyWithFeedback';

type CopyIdProps = {
    id: string;
    text?: string;
    /** `xs` is the card variant: a bordered pill where the whole surface copies */
    size?: 'xs' | 'sm' | 'lg';
    fullWidth?: boolean;
};

const CopyId: FC<CopyIdProps> = ({ id, text = 'ID', size = 'sm', fullWidth = false }) => {
    const { isCopied, copy } = useCopyWithFeedback();

    const handleCopy = () => copy(id);

    if (size === 'xs') {
        // the only bordered element in a card metadata row, with an accent icon: both mark it as interactive
        // where the sibling text items are not. A restyled HeroUI Button so the Tooltip gets its hover wiring
        return (
            <Tooltip delay={300}>
                <Button
                    variant="tertiary"
                    onPress={handleCopy}
                    className={`${
                        fullWidth ? 'flex !w-full' : 'inline-flex'
                    } !h-6 !min-w-0 max-w-full !gap-1 items-center overflow-hidden !rounded-full !border !border-border !bg-transparent !px-2 text-xs font-medium text-foreground hover:!border-accent`}
                >
                    <FontAwesomeIcon icon={isCopied ? faCheck : faClipboard} size="sm" className={isCopied ? 'text-success' : 'text-accent'} />
                    <span className="sr-only">Copy {text} </span>
                    <span className="min-w-0 truncate">{id}</span>
                    <span aria-live="polite" className="sr-only">
                        {isCopied ? `${text} copied to clipboard` : ''}
                    </span>
                </Button>
                <Tooltip.Content>{isCopied ? 'Copied!' : `Copy ${text} to clipboard`}</Tooltip.Content>
            </Tooltip>
        );
    }

    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
    const rootClass = fullWidth ? 'flex w-full' : 'inline-flex';

    return (
        <span className={`${rootClass} items-center border border-border rounded-lg overflow-hidden ${textSize}`}>
            <span className="bg-default-100 text-default-600 px-2 py-0.5 border-r border-border whitespace-nowrap">{text}</span>
            <span className={`text-foreground px-2 py-0.5 select-all ${fullWidth ? 'flex-1 min-w-0 truncate' : ''}`}>{id}</span>
            <Button
                size="sm"
                isIconOnly
                variant="tertiary"
                className="rounded-none border-l border-border"
                aria-label={`Copy ${text} to clipboard`}
                onPress={handleCopy}
            >
                <FontAwesomeIcon icon={isCopied ? faCheck : faClipboard} className={isCopied ? 'text-success' : undefined} />
            </Button>
            <span aria-live="polite" className="sr-only">
                {isCopied ? `${text} copied to clipboard` : ''}
            </span>
        </span>
    );
};

export default CopyId;
