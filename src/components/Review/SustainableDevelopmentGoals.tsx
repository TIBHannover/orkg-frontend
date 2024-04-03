import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { PREDICATES, SUSTAINABLE_DEVELOPMENT_GOALS } from 'constants/graphSettings';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createResourceStatement, deleteStatementsByIds, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { Node } from 'services/backend/types';
import { setSdgs } from 'slices/reviewSlice';

type SustainableDevelopmentGoalsProps = {
    isEditable: boolean;
};

const SustainableDevelopmentGoals: FC<SustainableDevelopmentGoalsProps> = ({ isEditable }) => {
    // @ts-expect-error
    const reviewId = useSelector((state) => state.review.articleId);
    // @ts-expect-error
    const sdgs = useSelector((state) => state.review.sdgs);
    const dispatch = useDispatch();

    const handleSave = async (newSdgs: Node[]) => {
        const existingStatements = await getStatementsBySubjectAndPredicate({
            subjectId: reviewId,
            predicateId: PREDICATES.SUSTAINABLE_DEVELOPMENT_GOAL,
        });
        await deleteStatementsByIds(existingStatements.map((statement) => statement.id));
        await Promise.all(
            newSdgs.map((sdg) => createResourceStatement(reviewId, PREDICATES.SUSTAINABLE_DEVELOPMENT_GOAL, SUSTAINABLE_DEVELOPMENT_GOALS[sdg.id])),
        );
        dispatch(setSdgs(newSdgs));
    };

    return <SdgBox handleSave={handleSave} sdgs={sdgs} maxWidth="100%" isEditable={isEditable} />;
};

export default SustainableDevelopmentGoals;
