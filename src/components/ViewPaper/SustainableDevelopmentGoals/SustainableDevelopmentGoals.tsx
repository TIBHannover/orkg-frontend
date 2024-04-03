import SdgBox from 'components/SustainableDevelopmentGoals/SdgBox';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from 'constants/graphSettings';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePaper } from 'services/backend/papers';
import { Node } from 'services/backend/types';
import { loadPaper } from 'slices/viewPaperSlice';

type SustainableDevelopmentGoalsProps = {
    isEditable: boolean;
};

const SustainableDevelopmentGoals: FC<SustainableDevelopmentGoalsProps> = ({ isEditable }) => {
    // @ts-expect-error
    const paperId = useSelector((state) => state.viewPaper.paper?.id);
    // @ts-expect-error
    const sdgs = useSelector((state) => state.viewPaper.paper.sdgs);
    const dispatch = useDispatch();

    const handleSave = async (newSdgs: Node[]) => {
        await updatePaper(paperId, { sdgs: newSdgs.map((sdg) => SUSTAINABLE_DEVELOPMENT_GOALS[sdg.id]) });
        dispatch(
            loadPaper({
                sdgs: newSdgs,
            }),
        );
    };

    return <SdgBox handleSave={handleSave} sdgs={sdgs} maxWidth="100%" isEditable={isEditable} />;
};

export default SustainableDevelopmentGoals;
