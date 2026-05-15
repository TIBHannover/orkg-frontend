import { faClock, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Separator, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Statement } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

function StatementCard({ statement }: { statement: Statement }) {
    const subjectLink = getLinkByEntityType(statement.subject._class, statement.subject.id);
    const subjectLabel = ('formatted_label' in statement.subject && statement.subject.formatted_label) || statement.subject.label || (
        <i className="text-muted">No label</i>
    );
    const objectLabel = ('formatted_label' in statement.object && statement.object.formatted_label) || statement.object.label || (
        <i className="text-muted">No label</i>
    );

    return (
        <div className="group">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 px-4 py-3 transition-colors group-hover:bg-surface-secondary/50">
                <div className="min-w-0 break-words">
                    <DescriptionTooltip classes={statement.subject.classes} id={statement.subject.id} _class={statement.subject._class}>
                        {subjectLink ? <Link href={subjectLink}>{subjectLabel}</Link> : subjectLabel}
                    </DescriptionTooltip>
                </div>
                <div className="min-w-0 break-words">
                    <DescriptionTooltip id={statement.predicate.id} _class={statement.predicate._class}>
                        <Link href={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })}>{statement.predicate.label}</Link>
                    </DescriptionTooltip>
                </div>
                <div className="min-w-0 break-words">
                    {statement.object._class !== ENTITIES.LITERAL ? (
                        <Link href={getLinkByEntityType(statement.object._class, statement.object.id)}>{objectLabel}</Link>
                    ) : (
                        <span>{statement.object.label || <i className="text-muted">No label</i>}</span>
                    )}
                </div>
                <div className="min-w-0">
                    <Tooltip>
                        <Tooltip.Trigger className="inline-flex">
                            <ActionButtonView action={(e) => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <div className="flex flex-col gap-1 p-1">
                                <div>
                                    Created:{' '}
                                    <span title={statement.created_at}>
                                        <FontAwesomeIcon icon={faClock} /> {dayjs(statement.created_at).fromNow()}
                                    </span>
                                </div>
                                {statement.created_by && (
                                    <div>
                                        Created by:{' '}
                                        {statement.created_by !== MISC.UNKNOWN_ID ? (
                                            <UserAvatar linkTarget="_blank" size={18} showDisplayName userId={statement.created_by} />
                                        ) : (
                                            'Unknown'
                                        )}
                                    </div>
                                )}
                            </div>
                        </Tooltip.Content>
                    </Tooltip>
                </div>
            </div>
            <Separator />
        </div>
    );
}

export default StatementCard;
