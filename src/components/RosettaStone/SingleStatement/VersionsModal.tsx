import { reverse } from 'named-urls';
import { FC } from 'react';
import useSWR from 'swr';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import ROUTES from '@/constants/routes';
import { getRSStatementVersions, rosettaStoneUrl } from '@/services/backend/rosettaStone';

type VersionsModalProps = {
    id: string;
    show: boolean;
    toggle: () => void;
};

const VersionsModal: FC<VersionsModalProps> = ({ id, show, toggle }) => {
    const { data: _versions } = useSWR(show && id ? [{ id }, rosettaStoneUrl, 'getRSStatementVersions'] : null, ([params]) =>
        getRSStatementVersions(params),
    );

    const versionsWithLink = _versions
        ? [..._versions].reverse().map((version) => ({
              ...version,
              link: reverse(ROUTES.RESOURCE, { id: version.id }),
          }))
        : [];

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
