import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfo, faClock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import moment from 'moment';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import { MISC } from 'constants/graphSettings';

const InfoTippy = props => {
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    return (
        <Tippy
            interactive={true}
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        <li className="mb-1">
                            Created:{' '}
                            <span title={value.statementCreatedAt}>
                                <Icon icon={faClock} /> {moment(value.statementCreatedAt).fromNow()}
                            </span>
                        </li>
                        {value.statementCreatedBy && (
                            <li>
                                Created by:{' '}
                                {value.statementCreatedBy !== MISC.UNKNOWN_ID ? (
                                    <UserAvatar linkTarget="_blank" size={18} showDisplayName={true} userId={value.statementCreatedBy} />
                                ) : (
                                    'Unknown'
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            }
            trigger="click"
        >
            <ActionButtonView action={e => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
        </Tippy>
    );
};

InfoTippy.propTypes = {
    id: PropTypes.string.isRequired
};

export default InfoTippy;
