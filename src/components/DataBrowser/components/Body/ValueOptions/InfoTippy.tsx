import { faClock, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ActionButtonView from 'components/ActionButton/ActionButtonView';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { MISC } from 'constants/graphSettings';
import moment from 'moment';
import { FC } from 'react';
import { Statement } from 'services/backend/types';

type InfoTippyProps = {
    statement: Statement;
};

const InfoTippy: FC<InfoTippyProps> = ({ statement }) => {
    return (
        <Tippy
            interactive
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        <li className="mb-1">
                            Created:{' '}
                            <span title={statement.created_at}>
                                <FontAwesomeIcon icon={faClock} /> {moment(statement.created_at).fromNow()}
                            </span>
                        </li>
                        {statement.created_by && (
                            <li>
                                Created by:{' '}
                                {statement.created_by !== MISC.UNKNOWN_ID ? (
                                    <UserAvatar linkTarget="_blank" size={18} showDisplayName userId={statement.created_by} />
                                ) : (
                                    'Unknown'
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            }
            trigger="click"
            appendTo={document.body}
        >
            <ActionButtonView action={(e) => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
        </Tippy>
    );
};

export default InfoTippy;
