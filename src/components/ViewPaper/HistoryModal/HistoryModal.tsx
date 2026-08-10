import { FC } from 'react';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type HistoryModalProps = {
    paperId: string;
    toggle: () => void;
    showDialog?: boolean;
};

const HistoryModal: FC<HistoryModalProps> = ({ paperId, toggle, showDialog = true }) => {
    const { publishedVersions, isLoading } = useViewPaper({ paperId });

    const versions = publishedVersions.map((version) => ({
        id: version.id,
        created_at: version.createdAt,
        created_by: version.createdBy,
        changelog: version.changelog,
        link: reverse(ROUTES.VIEW_PAPER, { resourceId: version.id }),
    }));

    return <HistoryModalComponent id={paperId} show={showDialog} toggle={toggle} title="Publish history" versions={versions} isLoading={isLoading} />;
};

export default HistoryModal;
