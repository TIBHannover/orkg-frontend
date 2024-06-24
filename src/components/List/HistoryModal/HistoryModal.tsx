import HistoryModalComponent from 'components/HistoryModal/HistoryModal';
import useList from 'components/List/hooks/useList';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC } from 'react';

type HistoryModalProps = {
    id: string;
    toggle: () => void;
};

const HistoryModal: FC<HistoryModalProps> = ({ id, toggle }) => {
    const { list } = useList();

    const versions = list?.versions.published.map((version) => ({
        ...version,
        created_by: version.created_by,
        created_at: version.created_at,
        isSelected: id === version.id,
        link: reverse(ROUTES.LIST, { id: version.id }),
        description: version.changelog,
    }));

    return <HistoryModalComponent id={id} show toggle={toggle} title="Publish history" versions={versions} routeDiff={ROUTES.LIST_DIFF} />;
};

export default HistoryModal;
