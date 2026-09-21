import { FC } from 'react';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import useReview from '@/components/Review/hooks/useReview';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type HistoryModalProps = {
    id: string;
    toggle: () => void;
};

const HistoryModal: FC<HistoryModalProps> = ({ id, toggle }) => {
    const { review } = useReview();

    const versions = review?.versions?.published.map((version) => ({
        id: version.id,
        created_at: version.createdAt,
        created_by: version.createdBy,
        changelog: version.changelog,
        isSelected: id === version.id,
        link: reverse(ROUTES.REVIEW, { id: version.id }),
    }));

    return <HistoryModalComponent id={id} show toggle={toggle} title="Publish history" versions={versions} routeDiff={ROUTES.REVIEW_DIFF} />;
};

export default HistoryModal;
