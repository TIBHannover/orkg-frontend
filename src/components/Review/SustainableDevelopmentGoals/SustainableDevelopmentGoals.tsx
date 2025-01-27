import useReview from 'components/Review/hooks/useReview';
import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { FC } from 'react';
import { Node } from 'services/backend/types';

type SustainableDevelopmentGoalsProps = {
    isEditable?: boolean;
};

const SustainableDevelopmentGoals: FC<SustainableDevelopmentGoalsProps> = ({ isEditable = false }) => {
    const { review, updateReview } = useReview();

    if (!review) {
        return null;
    }

    const handleSave = (sdgs: Node[]) => {
        updateReview({ sdgs });
    };

    return <SdgBox handleSave={handleSave} sdgs={review.sdgs} maxWidth="100%" isEditable={isEditable} />;
};

export default SustainableDevelopmentGoals;
