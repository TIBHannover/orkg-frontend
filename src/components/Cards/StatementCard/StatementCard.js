import Link from 'next/link';
import { reverse } from 'named-urls';
import { getLinkByEntityType } from 'utils';
import ROUTES from 'constants/routes';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfo, faClock } from '@fortawesome/free-solid-svg-icons';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import Tippy from '@tippyjs/react';
import moment from 'moment';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import { MISC } from 'constants/graphSettings';

function StatementCard({ statement }) {
    return (
        <div>
            <div className="row">
                <div className="col-sm">
                    <div className="px-3">
                        <DescriptionTooltip classes={statement.subject.classes} id={statement.subject.id} _class={statement.subject._class}>
                            {getLinkByEntityType(statement.subject._class, statement.subject.id) ? (
                                <Link href={getLinkByEntityType(statement.subject._class, statement.subject.id)}>{statement.subject.label}</Link>
                            ) : (
                                statement.subject.label
                            )}
                        </DescriptionTooltip>
                    </div>
                </div>
                <div className="col-sm">
                    <DescriptionTooltip id={statement.predicate.id} _class={statement.predicate._class}>
                        <Link href={reverse(ROUTES.PROPERTY, { id: statement.predicate.id })}>{statement.predicate.label}</Link>
                    </DescriptionTooltip>
                </div>
                <div className="col-sm">{statement.object.label}</div>
                <div className="col-sm">
                    <Tippy
                        interactive
                        content={
                            <div className="p-1">
                                <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                                    <li className="mb-1">
                                        Created:{' '}
                                        <span title={statement.created_at}>
                                            <Icon icon={faClock} /> {moment(statement.created_at).fromNow()}
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
                    </Tippy>
                </div>
            </div>
            <hr />
        </div>
    );
}

StatementCard.propTypes = {
    statement: PropTypes.object.isRequired,
};

export default StatementCard;
