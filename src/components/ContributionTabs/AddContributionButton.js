import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AddContribution } from 'components/ContributionTabs/styled';
import Tippy from '@tippyjs/react';

const AddContributionButton = ({ onClick, disabled = false }) => (
    <AddContribution className="my-1" disabled={disabled} color="link" onClick={onClick}>
        <Tippy content="Add contribution">
            <span>
                <FontAwesomeIcon size="xs" icon={!disabled ? faPlus : faSpinner} spin={disabled} />
            </span>
        </Tippy>
    </AddContribution>
);

AddContributionButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default AddContributionButton;
