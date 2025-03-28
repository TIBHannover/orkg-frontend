import { reverse } from 'named-urls';
import { FC } from 'react';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import useList from '@/components/List/hooks/useList';
import ROUTES from '@/constants/routes';

type HistoryModalProps = {
    id: string;
    toggle: () => void;
};

const HistoryModal: FC<HistoryModalProps> = ({ id, toggle }) => {
    const { list } = useList();

    const versions = list?.versions.published.map((version) => ({
        ...version,
        isSelected: id === version.id,
        link: reverse(ROUTES.LIST, { id: version.id }),
    }));

    return <HistoryModalComponent id={id} show toggle={toggle} title="Publish history" versions={versions} routeDiff={ROUTES.LIST_DIFF} />;
};

export default HistoryModal;
