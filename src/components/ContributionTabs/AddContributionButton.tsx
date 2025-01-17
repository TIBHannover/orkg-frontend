import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { AddContribution } from 'components/ContributionTabs/styled';
import { FC } from 'react';

type AddContributionButtonProps = {
    onClick: () => void;
    disabled: boolean;
};

const AddContributionButton: FC<AddContributionButtonProps> = ({ onClick, disabled = false }) => (
    <AddContribution className="my-1" disabled={disabled} color="link" onClick={onClick}>
        <Tippy content="Add contribution">
            <span>
                <FontAwesomeIcon size="xs" icon={!disabled ? faPlus : faSpinner} spin={disabled} />
            </span>
        </Tippy>
    </AddContribution>
);

export default AddContributionButton;
