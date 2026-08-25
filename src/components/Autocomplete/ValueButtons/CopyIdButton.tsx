import { faCheck, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip } from '@heroui/react';
import { FC } from 'react';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import useCopyWithFeedback from '@/components/hooks/useCopyWithFeedback';

type CopyIdButtonProps = {
    value: SingleValue<OptionType>;
    className?: string;
};

const CopyIdButton: FC<CopyIdButtonProps> = ({ value, className }) => {
    const { isCopied, copy } = useCopyWithFeedback();

    if (!value) {
        return null;
    }

    const handleCopyClick = () => {
        if (value?.id) {
            copy(value.id);
        }
    };

    return (
        <>
            <Tooltip delay={0}>
                <Button isIconOnly variant="secondary" onPress={handleCopyClick} aria-label="Copy the id to clipboard" className={className}>
                    <FontAwesomeIcon icon={isCopied ? faCheck : faClipboard} size="sm" className={isCopied ? 'text-success' : undefined} />
                </Button>
                <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    {isCopied ? 'Copied!' : 'Copy the id to clipboard'}
                </Tooltip.Content>
            </Tooltip>
            <span aria-live="polite" className="sr-only">
                {isCopied ? 'ID copied to clipboard' : ''}
            </span>
        </>
    );
};

export default CopyIdButton;
