import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';
import HistoryModalComponent from 'components/HistoryModal/HistoryModal';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

function HistoryModal({ comparedComparisonId, toggle, showDialog, comparisonId }) {
    const { versions: comparisonVersions, isLoading, loadVersions } = useComparisonVersions({ comparisonId });

    const versions = !isLoading
        ? comparisonVersions.map(version => ({
              ...version,
              isSelected: comparisonId === version.id || comparedComparisonId === version.id,
              link: reverse(ROUTES.COMPARISON, { comparisonId: version.id })
          }))
        : [];

    useEffect(() => {
        loadVersions(comparisonId);
    }, [loadVersions, comparisonId]);

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
}

HistoryModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    comparisonId: PropTypes.string,
    comparedComparisonId: PropTypes.string
};

export default HistoryModal;
