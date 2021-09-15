import { Fragment } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfo, faClock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import moment from 'moment';
import capitalize from 'capitalize';
import { getResourceLink } from 'utils';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import { ENTITIES, MISC } from 'constants/graphSettings';

const InfoTippy = props => {
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    return (
        <Tippy
            interactive={true}
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        <li className="mb-1">Node id: {value.id}</li>
                        <li className="mb-1">Node type: {capitalize(value._class)}</li>
                        {value.classes?.length > 0 && (
                            <li className="mb-1">
                                Instance of:{' '}
                                {value.classes.map((c, index) => (
                                    <Fragment key={index}>
                                        <Link to={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                            {c}
                                        </Link>
                                        {index + 1 < value.classes.length && ','}
                                    </Fragment>
                                ))}
                            </li>
                        )}
                        <li className="mb-1">
                            Created:{' '}
                            <span title={value.created_at}>
                                <Icon icon={faClock} /> {moment(value.created_at).fromNow()}
                            </span>
                        </li>
                        <li>
                            Created by:{' '}
                            {value.created_by !== MISC.UNKNOWN_ID ? (
                                <UserAvatar linkTarget="_blank" size={18} showDisplayName={true} userId={value.created_by} />
                            ) : (
                                'Unknown'
                            )}
                        </li>
                    </ul>
                </div>
            }
        >
            <ActionButtonView action={e => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
        </Tippy>
    );
};

InfoTippy.propTypes = {
    id: PropTypes.string.isRequired
};

export default InfoTippy;
