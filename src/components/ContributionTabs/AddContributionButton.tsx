import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

import { AddContribution } from '@/components/ContributionTabs/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';

type AddContributionButtonProps = {
    onClick: () => void;
    disabled: boolean;
};

const AddContributionButton: FC<AddContributionButtonProps> = ({ onClick, disabled = false }) => (
    <AddContribution className="my-1" disabled={disabled} color="link" onClick={onClick}>
        <Tooltip content="Add contribution">
            <span>
                <FontAwesomeIcon size="xs" icon={!disabled ? faPlus : faSpinner} spin={disabled} />
            </span>
        </Tooltip>
    </AddContribution>
);

export default AddContributionButton;
