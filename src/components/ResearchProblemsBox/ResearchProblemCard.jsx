import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import PropTypes from 'prop-types';

import ActionButton from '@/components/ActionButton/ActionButton';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

const ResearchProblemCard = (props) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.problem.id,
        unlisted: props.problem.unlisted,
        featured: props.problem.featured,
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
                <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: props.problem.id, slug: props.problem.label })}>
                    {props.problem.label}
                </Link>{' '}
                <small>
                    {props.options?.map?.((option) => (
                        <ActionButton
                            title={option.label}
                            icon={option.icon}
                            key={`problem${props.problem.id}`}
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

ResearchProblemCard.propTypes = {
    problem: PropTypes.object.isRequired,
    options: PropTypes.array,
};

export default ResearchProblemCard;
