import { faCalendar, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { toInteger } from 'lodash';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
        <CardShell>
            <CardColumns createdBy={template.created_by}>
                <div className="mb-2">
                    <Link href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>Statement template</CardBadge>
                        </span>
                    )}
                </div>
                <div className="text-sm text-muted">{formattedLabelWithPlaceholders}</div>
                {template.description && <div className="text-sm text-muted">{template.description}</div>}
                <MetadataRow
                    className="mb-1"
                    items={[
                        {
                            key: 'positions',
                            node: (
                                <span className="inline-flex items-center">
                                    <FontAwesomeIcon size="sm" icon={faShapes} className="me-1 text-muted" />
                                    {pluralize('position', template.properties?.length ?? 0, true)}
                                </span>
                            ),
                        },
                        !!template.created_at && {
                            key: 'created-at',
                            node: (
                                <span className="inline-flex items-center" title={`Created ${dayjs(template.created_at).format('DD MMMM YYYY')}`}>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                    {dayjs(template.created_at).format('DD MMM YYYY')}
                                </span>
                            ),
                        },
                    ]}
                />
            </CardColumns>
        </CardShell>
    );
};

export default RSTemplateCard;
