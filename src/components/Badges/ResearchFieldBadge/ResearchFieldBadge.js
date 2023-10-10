import Link from 'components/NextJsMigration/Link';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';
import { reverseWithSlug } from 'utils';

const ResearchFieldBadge = ({ researchField = null }) =>
    researchField && researchField.id ? (
        <Link
            href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}
            target="_blank"
            aria-label={`Visit research field page of ${researchField.label}`}
        >
            <Badge color="light" className="me-2 mb-2">
                <Icon icon={faBars} className="text-primary" /> {researchField.label}
            </Badge>
        </Link>
    ) : null;

ResearchFieldBadge.propTypes = {
    /** The research field that should be displayed */
    researchField: PropTypes.object,
};

export default ResearchFieldBadge;
