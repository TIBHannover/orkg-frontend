import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AddContribution } from 'components/ContributionTabs/styled';
import Tippy from '@tippyjs/react';

const AddContributionButton = ({ onClick, disabled }) => (
    <div className="mt-2">
        <AddContribution disabled={disabled} color="link" onClick={onClick}>
            <Tippy content="Add contribution">
                <span>
                    <Icon size="xs" icon={!disabled ? faPlus : faSpinner} spin={disabled} />
                </span>
            </Tippy>
        </AddContribution>
    </div>
);

AddContributionButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

AddContributionButton.defaultProps = {
    disabled: false,
};

export default AddContributionButton;
