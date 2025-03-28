import { faCalendar, faLock, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';

import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { Template } from '@/services/backend/types';

type TemplateCardProps = {
    template: Template;
    showBadge?: boolean;
};

const TemplateCard: FC<TemplateCardProps> = ({ template, showBadge = false }) => (
    <div className="list-group-item d-flex py-3 pe-4 ps-4">
        <div className="col-md-9 d-flex p-0">
            <div className="d-flex flex-column flex-grow-1">
                <div className="mb-2">
                    <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                    {showBadge && (
                        <div className="d-inline-block ms-2">
                            <CardBadge color="primary">Template</CardBadge>
                        </div>
                    )}
                </div>
                <div className="mb-1">
                    <small>
                        <FontAwesomeIcon size="sm" icon={faShapes} className="me-1" /> {template.properties?.length} Properties
                        {template.is_closed && (
                            <>
                                <FontAwesomeIcon size="sm" icon={faLock} className="ms-2 me-1" /> Closed
                            </>
                        )}
                        <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" /> {dayjs(template.created_at).format('DD-MM-YYYY')}
                    </small>
                </div>
                <div className="mb-1">
                    <small>
                        Target class:
                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class.id })}>
                            {template.target_class.label}
                        </Link>{' '}
                    </small>
                </div>
                {template.description && (
                    <div>
                        <small className="text-muted">{template.description}</small>
                    </div>
                )}
            </div>
        </div>
        <div className="col-md-3 d-flex align-items-end flex-column p-0">
            <div className="flex-grow-1 mb-1">
                <div className="d-none d-md-flex align-items-end justify-content-end">
                    <RelativeBreadcrumbs researchField={template.relations.research_fields?.[0]} />
                </div>
            </div>
            <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                <UserAvatar userId={template.created_by} />
            </div>
        </div>
    </div>
);

export default TemplateCard;
