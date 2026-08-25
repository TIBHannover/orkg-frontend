import { faBullseye, faCalendar, faLock, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Template } from '@/services/backend/types';

type TemplateCardProps = {
    template: Template;
    showBadge?: boolean;
};

const TemplateCard: FC<TemplateCardProps> = ({ template, showBadge = false }) => (
    <CardShell>
        <CardColumns researchField={template.relations.research_fields?.[0]} createdBy={template.created_by}>
            <div className="mb-2">
                <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                {showBadge && (
                    <span className="ml-2 inline-block align-middle">
                        <CardBadge>Template</CardBadge>
                    </span>
                )}
            </div>
            <MetadataRow
                className="mb-1"
                items={[
                    {
                        key: 'properties',
                        node: (
                            <span className="inline-flex items-center">
                                <FontAwesomeIcon size="sm" icon={faShapes} className="me-1 text-muted" />
                                {pluralize('property', template.properties?.length ?? 0, true)}
                            </span>
                        ),
                    },
                    template.is_closed && {
                        key: 'closed',
                        node: (
                            <span className="inline-flex items-center" title="Closed template: no other properties can be added">
                                <FontAwesomeIcon size="sm" icon={faLock} className="me-1 text-muted" />
                                Closed
                            </span>
                        ),
                    },
                    {
                        key: 'target-class',
                        node: (
                            <span className="inline-flex min-w-0 items-center">
                                <FontAwesomeIcon size="sm" icon={faBullseye} className="me-1 text-muted" />
                                <span className="sr-only">Target class </span>
                                <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class.id })} className="truncate">
                                    {template.target_class.label}
                                </Link>
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
            {template.description && <div className="text-sm text-muted">{template.description}</div>}
        </CardColumns>
    </CardShell>
);

export default TemplateCard;
