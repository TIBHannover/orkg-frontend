import { faCheck, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

import ActionButton from '@/components/ActionButton/ActionButton';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import ROUTES from '@/constants/routes';
import { Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchProblemCardProps = {
    problem: Resource;
    options: {
        label: string;
        icon: IconDefinition;
        requireConfirmation: boolean;
        action: () => void;
    }[];
};

const ResearchProblemCard = ({ problem, options }: ResearchProblemCardProps) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: problem.id,
        unlisted: problem.unlisted,
        featured: problem.featured,
    });

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col shrink-0 w-[25px]">
                <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
            </div>
            <Link
                className="grow min-w-0 break-words"
                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id, slug: problem.label })}
            >
                {problem.label}
            </Link>
            {options && options.length > 0 && (
                <div className="shrink-0 flex items-center gap-1">
                    {options.map((option) => (
                        <ActionButton
                            title={option.label}
                            icon={option.icon}
                            key={`problem${problem.id}-${option.label}`}
                            requireConfirmation={option.requireConfirmation}
                            confirmationMessage="Are you sure?"
                            confirmationButtons={[
                                {
                                    title: 'Delete',
                                    color: 'danger',
                                    icon: faCheck,
                                    action: option.action,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResearchProblemCard;
