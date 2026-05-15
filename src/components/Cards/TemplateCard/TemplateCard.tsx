import { faCalendar, faLock, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Template } from '@/services/backend/types';

type TemplateCardProps = {
    template: Template;
    showBadge?: boolean;
};

const TemplateCard: FC<TemplateCardProps> = ({ template, showBadge = false }) => (
    <div className="list-group-item flex py-4 pr-6 pl-6">
        <div className="flex w-full p-0 md:w-9/12 md:shrink-0 md:grow-0 md:basis-9/12 md:max-w-9/12">
            <div className="flex grow flex-col">
                <div className="mb-2">
                    <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <Chip color="accent" variant="primary" size="sm">
                                Template
                            </Chip>
                        </span>
                    )}
                </div>
                <div className="mb-1">
                    <small>
                        <FontAwesomeIcon size="sm" icon={faShapes} className="mr-1 text-muted" /> {template.properties?.length} Properties
                        {template.is_closed && (
                            <>
                                <FontAwesomeIcon size="sm" icon={faLock} className="ml-2 mr-1 text-muted" /> Closed
                            </>
                        )}
                        <FontAwesomeIcon size="sm" icon={faCalendar} className="ml-2 mr-1 text-muted" />{' '}
                        {dayjs(template.created_at).format('DD-MM-YYYY')}
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
        <div className="flex w-full flex-col items-end p-0 md:w-3/12 md:shrink-0 md:grow-0 md:basis-3/12 md:max-w-3/12">
            <div className="mb-1 grow">
                <div className="hidden items-end justify-end md:flex">
                    <RelativeBreadcrumbs researchField={template.relations.research_fields?.[0]} />
                </div>
            </div>
            <div className="mt-1 hidden items-end justify-end md:flex">
                <UserAvatar userId={template.created_by} />
            </div>
        </div>
    </div>
);

export default TemplateCard;
