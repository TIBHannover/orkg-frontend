import { reverse } from 'named-urls';
import { FC } from 'react';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import ROUTES from '@/constants/routes';
import { RosettaStoneStatement } from '@/services/backend/types';

type VersionsModalProps = {
    id: string;
    show: boolean;
    toggle: () => void;
    versions: RosettaStoneStatement[];
};

const VersionsModal: FC<VersionsModalProps> = ({ id, show, toggle, versions }) => {
    const versionsWithLink = versions.map((version) => ({
        ...version,
        link: reverse(ROUTES.RESOURCE, { id: version.id }),
    }));

    return (
        <HistoryModalComponent
            id={id}
            show={show}
            toggle={toggle}
            title="Statement history"
            versions={versionsWithLink}
            routeDiff={ROUTES.ROSETTA_STONE_DIFF}
            showFeaturedButtons={false}
        />
    );
};

export default VersionsModal;
