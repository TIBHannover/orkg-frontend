import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import env from 'components/NextJsMigration/env';

const InviteResearchersButton = ({ comparisonId }) => {
    const emailLink = `mailto:email@example.com?subject=Please review my ORKG comparison&body=Dear researcher, %0D%0A%0D%0AUsing the Open Research Knowledge Graph (ORKG), I have created a comparison. I would highly appreciate it if you took the time to review my comparison. This helps me to further improve the comparison and helps other researcher to judge the quality. %0D%0A%0D%0AYou can see and review my comparison via the following link: %0D%0A${`${env(
        'NEXT_PUBLIC_URL',
    )}${reverse(ROUTES.COMPARISON, { comparisonId })}`}?requestFeedback=true %0D%0A%0D%0ABest regards,`;

    return (
        <Button tag="a" href={emailLink} color="secondary" size="sm">
            <Icon icon={faEnvelope} className="me-2" />
            Invite researchers
        </Button>
    );
};

InviteResearchersButton.propTypes = {
    comparisonId: PropTypes.string.isRequired,
};

export default InviteResearchersButton;
