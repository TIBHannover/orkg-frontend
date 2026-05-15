import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { env } from 'next-runtime-env';
import { AnchorHTMLAttributes, FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type InviteResearchersButtonProps = {
    comparisonId: string;
};

const InviteResearchersButton: FC<InviteResearchersButtonProps> = ({ comparisonId }) => {
    const emailLink = `mailto:email@example.com?subject=Please review my ORKG comparison&body=Dear researcher, %0D%0A%0D%0AUsing the Open Research Knowledge Graph (ORKG), I have created a comparison. I would highly appreciate it if you took the time to review my comparison. This helps me to further improve the comparison and helps other researcher to judge the quality. %0D%0A%0D%0AYou can see and review my comparison via the following link: %0D%0A${`${env(
        'NEXT_PUBLIC_URL',
    )}${reverse(ROUTES.COMPARISON, { comparisonId })}`}?requestFeedback=true %0D%0A%0D%0ABest regards,`;

    return (
        <Button
            variant="secondary"
            size="sm"
            aria-label="Invite researchers"
            render={(props) => <a {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={emailLink} />}
        >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            Invite researchers
        </Button>
    );
};

export default InviteResearchersButton;
