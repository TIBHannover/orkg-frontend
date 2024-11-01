import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import Link from 'next/link';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert } from 'reactstrap';
import ROUTES from 'constants/routes';

const NewerVersionWarning = ({ versions, showViewHistory = true, comparisonId }) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    return (
        <Alert color="warning" fade={false} className="container d-flex box-shadow">
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
                        <FontAwesomeIcon icon={faHistory} /> View History
                    </div>
                    {isOpenHistoryModal && (
                        <HistoryModal comparisonId={comparisonId} toggle={() => setIsOpenHistoryModal((v) => !v)} showDialog={isOpenHistoryModal} />
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
