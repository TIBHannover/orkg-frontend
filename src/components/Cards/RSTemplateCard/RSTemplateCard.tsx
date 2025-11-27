import { faCalendar, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { toInteger } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';

import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { RosettaStoneTemplate } from '@/services/backend/types';

type RSTemplateCardProps = {
    template: RosettaStoneTemplate;
    showBadge?: boolean;
};

const RSTemplateCard: FC<RSTemplateCardProps> = ({ template, showBadge = false }) => {
    const replacementFunction = (match: string) => {
        const i = toInteger(match);
        return <i key={i}>{template.properties[i]?.placeholder ?? i}</i>;
    };

    const formattedLabelWithPlaceholders = ReactStringReplace(
        template.formatted_label?.replaceAll(']', ' ').replaceAll('[', ' ') ?? '',
        /{(.*?)}/,
        replacementFunction,
    );

    return (
        <div className="list-group-item d-flex py-3 pe-4 ps-4">
            <div className="col-md-9 d-flex p-0">
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Statement template</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="small text-muted">{formattedLabelWithPlaceholders}</div>
                    {template.description && (
                        <div>
                            <small className="text-muted">{template.description}</small>
                        </div>
                    )}
                    <div className="mb-1">
                        <small>
                            <FontAwesomeIcon size="sm" icon={faShapes} className="me-1" /> {template.properties?.length} Positions
                            <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" /> {dayjs(template.created_at).format('DD-MM-YYYY')}
                        </small>
                    </div>
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                    <UserAvatar userId={template.created_by} />
                </div>
            </div>
        </div>
    );
};

export default RSTemplateCard;
