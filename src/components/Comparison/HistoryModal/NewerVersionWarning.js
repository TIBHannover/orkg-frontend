import Link from 'components/NextJsMigration/Link';
import { useState } from 'react';
import { Alert } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

const NewerVersionWarning = ({ versions, showViewHistory = true, comparisonId }) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    return (
        <Alert color="warning" fade={false} className="container d-flex box">
            <div className="flex-grow-1">
                Warning: a newer version of this comparison is available.{' '}
                {versions?.length > 0 && (
                    <>
                        <Link href={reverse(ROUTES.COMPARISON, { comparisonId: versions[0].id })}>View latest version</Link> or{' '}
                        <Link href={reverse(ROUTES.COMPARISON_DIFF, { oldId: comparisonId, newId: versions[0].id })}>compare to latest version</Link>.
                    </>
                )}
            </div>
            {showViewHistory && (
                <>
                    <div
                        onKeyPress={() => setIsOpenHistoryModal(true)}
                        role="button"
                        className="text-primary justify-content-end"
                        onClick={() => setIsOpenHistoryModal(true)}
                    >
                        <Icon icon={faHistory} /> View History
                    </div>
                    {isOpenHistoryModal && (
                        <HistoryModal comparisonId={comparisonId} toggle={() => setIsOpenHistoryModal(v => !v)} showDialog={isOpenHistoryModal} />
                    )}
                </>
            )}
        </Alert>
    );
};

NewerVersionWarning.propTypes = {
    comparisonId: PropTypes.string,
    showViewHistory: PropTypes.bool,
    versions: PropTypes.array,
};

export default NewerVersionWarning;
