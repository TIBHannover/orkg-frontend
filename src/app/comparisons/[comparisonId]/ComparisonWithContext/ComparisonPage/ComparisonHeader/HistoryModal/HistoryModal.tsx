import { reverse } from 'named-urls';
import { FC } from 'react';

import useComparison from '@/components/Comparison/hooks/useComparison';
import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import ROUTES from '@/constants/routes';

type HistoryModalProps = {
    comparisonId: string;
    toggle: () => void;
    showDialog?: boolean;
    comparedComparisonId?: string;
};

const HistoryModal: FC<HistoryModalProps> = ({ comparedComparisonId, toggle, showDialog = true, comparisonId }) => {
    const { comparison } = useComparison(comparisonId);

    if (!comparison) {
        return null;
    }

    const versions = comparison.versions.published.map((version) => ({
        ...version,
        isSelected: comparisonId === version.id || comparedComparisonId === version.id,
        link: reverse(ROUTES.COMPARISON, { comparisonId: version.id }),
        changelog: version.label,
    }));

    return (
        <HistoryModalComponent
            id={comparisonId}
            show={showDialog}
            toggle={toggle}
            title="Comparison history"
            versions={versions}
            routeDiff={ROUTES.COMPARISON_DIFF}
        />
    );
};

export default HistoryModal;
