import { faClock, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { FC } from 'react';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import Tooltip from '@/components/FloatingUI/Tooltip';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { MISC } from '@/constants/graphSettings';
import { Statement } from '@/services/backend/types';

type InfoTippyProps = {
    statement: Statement;
};

const InfoTippy: FC<InfoTippyProps> = ({ statement }) => {
    return (
        <Tooltip
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        <li className="mb-1">
                            Created:{' '}
                            <span title={statement.createdAt}>
                                <FontAwesomeIcon icon={faClock} /> {dayjs(statement.createdAt).fromNow()}
                            </span>
                        </li>
                        {statement.createdBy && (
                            <li>
                                Created by:{' '}
                                {statement.createdBy !== MISC.UNKNOWN_ID ? (
                                    <UserAvatar linkTarget="_blank" size={18} showDisplayName userId={statement.createdBy} />
                                ) : (
                                    'Unknown'
                                )}
                            </li>
                        )}
                    </ul>
                </div>
            }
        >
            <ActionButtonView title="Show information about this statement" icon={faInfo} />
        </Tooltip>
    );
};

export default InfoTippy;
