import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, toast, Tooltip } from '@heroui/react';
import { FC } from 'react';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';

type CopyIdButtonProps = {
    value: SingleValue<OptionType>;
    className?: string;
};

const CopyIdButton: FC<CopyIdButtonProps> = ({ value, className }) => {
    if (!value) {
        return null;
    }

    const handleCopyClick = () => {
        if (navigator.clipboard && value && value.id) {
            navigator.clipboard.writeText(value.id);
            toast.success('ID copied to clipboard');
        }
    };

    return (
        <Tooltip delay={0}>
            <Button isIconOnly variant="secondary" onPress={handleCopyClick} aria-label="Copy the id to clipboard" className={className}>
                <FontAwesomeIcon icon={faClipboard} size="sm" />
            </Button>
            <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                Copy the id to clipboard
            </Tooltip.Content>
        </Tooltip>
    );
};

export default CopyIdButton;
