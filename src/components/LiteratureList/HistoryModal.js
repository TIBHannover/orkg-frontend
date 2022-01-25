import HistoryModalComponent from 'components/HistoryModal/HistoryModal';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';

const HistoryModal = ({ id, show, toggle }) => {
    const literatureVersions = useSelector(state => state.literatureList.versions);

    const versions = literatureVersions.map(version => ({
        ...version,
        created_by: version.creator,
        created_at: version.date,
        isSelected: id === version.id,
        link: reverse(ROUTES.LITERATURE_LIST, { id: version.id })
    }));

    return (
        <HistoryModalComponent
            id={id}
            show={show}
            toggle={toggle}
            title="Publish history"
            versions={versions}
            routeDiff={ROUTES.LITERATURE_LIST_DIFF}
        />
    );
};

HistoryModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default HistoryModal;
