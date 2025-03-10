import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OptionType } from 'components/Autocomplete/types';
import Tooltip from 'components/FloatingUI/Tooltip';
import { FC } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';

type CopyIdButtonProps = {
    value: SingleValue<OptionType>;
};

const CopyIdButton: FC<CopyIdButtonProps> = ({ value }) => {
    if (!value) {
        return null;
    }

    /**
     * Handle click on copy to clipboard button
     */
    const handleCopyClick = () => {
        if (navigator.clipboard && value && value.id) {
            navigator.clipboard.writeText(value.id);
            toast.success('ID copied to clipboard');
        }
    };

    return (
        <Button onClick={handleCopyClick} outline className="px-2">
            <Tooltip content="Copy the id to clipboard">
                <span>
                    <FontAwesomeIcon icon={faClipboard} size="sm" />
                </span>
            </Tooltip>
        </Button>
    );
};

export default CopyIdButton;
