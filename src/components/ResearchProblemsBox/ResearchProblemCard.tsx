import { faCheck, faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

import ActionButton from '@/components/ActionButton/ActionButton';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import ROUTES from '@/constants/routes';
import { Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

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
        <div className="d-flex">
            <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                <div>
                    <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                </div>
                <div>
                    <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                </div>
            </div>
            <div className="flex-grow-1">
                <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id, slug: problem.label })}>{problem.label}</Link>{' '}
                <small>
                    {options?.map?.((option) => (
                        <ActionButton
                            title={option.label}
                            icon={option.icon}
                            key={`problem${problem.id}`}
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
                </small>
            </div>
        </div>
    );
};

export default ResearchProblemCard;
