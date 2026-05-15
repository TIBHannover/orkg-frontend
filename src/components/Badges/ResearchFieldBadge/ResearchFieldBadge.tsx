import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

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
            <Chip className="mr-2 mb-2">
                <FontAwesomeIcon icon={faBars} className="text-accent" /> {researchField.label}
            </Chip>
        </Link>
    ) : null;

export default ResearchFieldBadge;
