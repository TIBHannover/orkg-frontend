import { faCheckCircle, faLock, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Template } from '@/services/backend/types';

type TemplateListItemProps = {
    template: Template;
    isApplied?: boolean;
    action: ReactNode;
};

const TemplateListItem: FC<TemplateListItemProps> = ({ template, isApplied, action }) => (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary/60 transition-colors list-none">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <Link
                    href={reverse(ROUTES.TEMPLATE, { id: template.id })}
                    target="_blank"
                    className="font-medium text-foreground hover:text-accent truncate"
                >
                    {template.label || <em>No title</em>}
                </Link>
                {isApplied && (
                    <Chip size="sm" className="bg-success/15 text-success-foreground h-5">
                        <FontAwesomeIcon icon={faCheckCircle} size="sm" className="mr-1" />
                        Applied
                    </Chip>
                )}
                {template.is_closed && (
                    <Chip size="sm" className="bg-secondary/15 text-secondary-darker h-5 dark:text-secondary">
                        <FontAwesomeIcon icon={faLock} size="sm" className="mr-1" />
                        Closed
                    </Chip>
                )}
            </div>
            {template.description && <div className="text-sm text-muted mt-1 line-clamp-2">{template.description}</div>}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted flex-wrap">
                <span>
                    Target:{' '}
                    <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class.id })} className="text-accent hover:underline">
                        {template.target_class.label}
                    </Link>
                </span>
                <span className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faShapes} size="sm" />
                    {template.properties?.length ?? 0} {template.properties?.length === 1 ? 'property' : 'properties'}
                </span>
                <span>{dayjs(template.created_at).format('DD MMM YYYY')}</span>
            </div>
        </div>
        <div className="shrink-0">{action}</div>
    </li>
);

export default TemplateListItem;
