import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { FC } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';

type AddContributionButtonProps = {
    onClick: () => void;
    disabled: boolean;
};

const AddContributionButton: FC<AddContributionButtonProps> = ({ onClick, disabled = false }) => (
    <Tooltip content="Add contribution">
        <Button
            isIconOnly
            size="sm"
            variant="secondary"
            isDisabled={disabled}
            onPress={onClick}
            aria-label="Add contribution"
            className="rounded-full !min-w-[25px] !w-[25px] !h-[25px] border border-border bg-surface-secondary text-foreground hover:!bg-accent hover:!text-accent-foreground mx-2 my-1"
        >
            <FontAwesomeIcon size="xs" icon={!disabled ? faPlus : faSpinner} spin={disabled} />
        </Button>
    </Tooltip>
);

export default AddContributionButton;
