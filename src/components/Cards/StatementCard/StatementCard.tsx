import { faClock, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Statement } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

function StatementCard({ statement }: { statement: Statement }) {
    return (
        <div>
            <div className="row">
                <div className="col-sm col-3">
                    <div className="px-3">
                        <DescriptionTooltip classes={statement.subject.classes} id={statement.subject.id} _class={statement.subject._class}>
                            {getLinkByEntityType(statement.subject._class, statement.subject.id) ? (
                                <Link href={getLinkByEntityType(statement.subject._class, statement.subject.id)}>
                                    {('formatted_label' in statement.subject && statement.subject.formatted_label) || statement.subject.label || (
                                        <i>No label</i>
                                    )}
                                </Link>
                            ) : (
                                statement.subject.label || 'No label'
                            )}
                        </DescriptionTooltip>
                    </div>
                </div>
                <div className="col-sm col-3">
                    <DescriptionTooltip id={statement.predicate.id} _class={statement.predicate._class}>
                        <Link href={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })}>{statement.predicate.label}</Link>
                    </DescriptionTooltip>
                </div>
                <div className="col-sm col-3">
                    {statement.object._class !== ENTITIES.LITERAL && (
                        <Link href={getLinkByEntityType(statement.object._class, statement.object.id)}>
                            {('formatted_label' in statement.object && statement.object.formatted_label) || statement.object.label || <i>No label</i>}
                        </Link>
                    )}
                    {statement.object._class === ENTITIES.LITERAL && <span>{statement.object.label || 'No label'}</span>}
                </div>
                <div className="col-sm col-3">
                    <Tooltip
                        content={
                            <div className="p-1">
                                <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                                    <li className="mb-1">
                                        Created:{' '}
                                        <span title={statement.created_at}>
                                            <FontAwesomeIcon icon={faClock} /> {dayjs(statement.created_at).fromNow()}
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
                    >
                        <ActionButtonView action={(e) => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
                    </Tooltip>
                </div>
            </div>
            <hr />
        </div>
    );
}

export default StatementCard;
