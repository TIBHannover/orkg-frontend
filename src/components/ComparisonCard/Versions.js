import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFile, faChartBar, faPaperclip, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { getStatementsBySubject } from 'services/backend/statements';
import { getComparisonData } from 'utils';

const VersionTooltip = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [version, setVersion] = useState(props.version);
    useEffect(() => {
        if (!!!version?.contributions?.length) {
            setIsLoading(true);
            getStatementsBySubject({ id: version.id }).then(statements => {
                setVersion(getComparisonData(version, statements));
                setIsLoading(false);
            });
        }
    }, [version]);

    return (
        <>
            {version.label}
            <div className="d-flex mt-1">
                {!isLoading && (
                    <div className="flex-grow-1">
                        {version?.contributions?.length && (
                            <>
                                <Icon size="sm" icon={faFile} className="mr-1" /> {version?.contributions?.length} Contributions
                            </>
                        )}
                        {version.visualizations && (
                            <>
                                <Icon size="sm" icon={faChartBar} className="ml-2 mr-1" /> {version.visualizations?.length} Visualizations
                            </>
                        )}
                        {(version.resources?.length > 0 || version.figures?.length > 0) && (
                            <>
                                <Icon size="sm" icon={faPaperclip} className="ml-2 mr-1" /> {version.resources.length + version.resources.length}{' '}
                                attachments
                            </>
                        )}
                    </div>
                )}
                {isLoading && <div className="flex-grow-1">Loading...</div>}
                <div>
                    <UserAvatar userId={version.created_by} />
                </div>
            </div>
        </>
    );
};

VersionTooltip.propTypes = {
    version: PropTypes.object
};

const Versions = props => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

    return (
        <div>
            <small>
                <Icon size="sm" icon={faCodeBranch} className="mr-1" /> Versions:{' '}
                {props.versions.slice(1).map((version, index) => (
                    <span key={version.id}>
                        <Tippy content={<VersionTooltip version={version} />}>
                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: version.id })}>
                                Version {moment(version.created_at).format('DD-MM-YYYY')}
                            </Link>
                        </Tippy>{' '}
                        {' • '}
                    </span>
                ))}
                <div
                    role="button"
                    className="d-inline text-primary"
                    onKeyPress={() => setIsOpenHistoryModal(true)}
                    onClick={() => setIsOpenHistoryModal(true)}
                >
                    View history
                </div>
                {isOpenHistoryModal && (
                    <HistoryModal comparisonId={props.id} toggle={() => setIsOpenHistoryModal(v => !v)} showDialog={isOpenHistoryModal} />
                )}
            </small>
        </div>
    );
};

Versions.propTypes = {
    id: PropTypes.string.isRequired,
    versions: PropTypes.array
};

Versions.defaultProps = {
    showHistory: true
};

export default Versions;
