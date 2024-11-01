import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import Link from 'next/link';
import { FC } from 'react';
import { Badge } from 'reactstrap';
import { Node } from 'services/backend/types';
import { reverseWithSlug } from 'utils';

type ResearchFieldBadgeProps = {
    researchField: Node;
};

const ResearchFieldBadge: FC<ResearchFieldBadgeProps> = ({ researchField = null }) =>
    researchField && researchField.id ? (
        <Link
            href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id, slug: researchField.label })}
            target="_blank"
            aria-label={`Visit research field page of ${researchField.label}`}
        >
            <Badge color="light" className="me-2 mb-2">
                <FontAwesomeIcon icon={faBars} className="text-primary" /> {researchField.label}
            </Badge>
        </Link>
    ) : null;

export default ResearchFieldBadge;
