import { notFound, redirect } from 'next/navigation';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getStatements } from '@/services/backend/statements';

const ContributionRedirectPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: contributionId } = await params;

    const statements = await getStatements({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });

    if (!statements.length || ('classes' in statements[0].object && !statements[0].object.classes.includes(CLASSES.CONTRIBUTION))) {
        notFound();
    }

    const paperStatement = statements.find(
        (_statement) => _statement.subject.classes.includes(CLASSES.PAPER) || _statement.subject.classes.includes(CLASSES.SMART_REVIEW),
    );

    if (!paperStatement) {
        notFound();
    }

    const isReview = statements.some((_statement) => _statement.subject.classes.includes(CLASSES.SMART_REVIEW));
    const paperId = paperStatement.subject.id;

    if (isReview) {
        redirect(reverse(ROUTES.REVIEW, { id: paperId }));
    }

    redirect(reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: paperId, contributionId }));
};

export default ContributionRedirectPage;
