import { useState } from 'react';
import { Alert } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

const NewerVersionWarning = ({ versions, showViewHistory, comparisonId }) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    return (
        <Alert color="warning" className="container d-flex">
            <div className="flex-grow-1">
                Warning: a newer version of this comparison is available.{' '}
                {versions?.length > 0 && (
                    <>
                        <Link to={reverse(ROUTES.COMPARISON, { comparisonId: versions[0].id })}>View latest version</Link>
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
    versions: PropTypes.array
};

NewerVersionWarning.defaultProps = {
    showViewHistory: true
};

export default NewerVersionWarning;
