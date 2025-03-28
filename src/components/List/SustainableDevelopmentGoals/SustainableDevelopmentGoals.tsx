import { FC } from 'react';

import useList from '@/components/List/hooks/useList';
import SdgBox from '@/components/SustainableDevelopmentGoals/SdgBox';
import { Node } from '@/services/backend/types';

type SustainableDevelopmentGoalsProps = {
    isEditable?: boolean;
};

const SustainableDevelopmentGoals: FC<SustainableDevelopmentGoalsProps> = ({ isEditable = false }) => {
    const { list, updateList } = useList();

    if (!list) {
        return null;
    }

    const handleSave = (sdgs: Node[]) => {
        updateList({ sdgs });
    };

    return <SdgBox handleSave={handleSave} sdgs={list.sdgs} maxWidth="100%" isEditable={isEditable} />;
};

export default SustainableDevelopmentGoals;
