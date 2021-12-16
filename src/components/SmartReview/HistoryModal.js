import HistoryModalComponent from 'components/HistoryModal/HistoryModal';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';

const HistoryModal = ({ id, show, toggle }) => {
    const reviewVersions = useSelector(state => state.smartReview.versions);

    const versions = reviewVersions.map(version => ({
        ...version,
        created_by: version.creator,
        created_at: version.date,
        isSelected: id === version.id,
        link: reverse(ROUTES.SMART_REVIEW, { id: version.id })
    }));

    return (
        <HistoryModalComponent id={id} show={show} toggle={toggle} title="Publish history" versions={versions} routeDiff={ROUTES.SMART_REVIEW_DIFF} />
    );
};

HistoryModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default HistoryModal;
