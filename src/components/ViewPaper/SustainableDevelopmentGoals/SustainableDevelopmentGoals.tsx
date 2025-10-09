import { FC } from 'react';

import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from '@/constants/graphSettings';
import { updatePaper } from '@/services/backend/papers';
import { Node } from '@/services/backend/types';

type SustainableDevelopmentGoalsProps = {
    isEditable: boolean;
};

const SustainableDevelopmentGoals: FC<SustainableDevelopmentGoalsProps> = ({ isEditable }) => {
    const { resourceId } = useParams();
    const { paper, mutatePaper } = useViewPaper({ paperId: resourceId });

    const handleSave = async (newSdgs: Node[]) => {
        await updatePaper(resourceId, { sdgs: newSdgs.map((sdg) => SUSTAINABLE_DEVELOPMENT_GOALS[sdg.id]) });
        mutatePaper();
    };

    return <SdgBox handleSave={handleSave} sdgs={paper?.sdgs} maxWidth="100%" isEditable={isEditable} />;
};

export default SustainableDevelopmentGoals;
