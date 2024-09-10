import { faCalendar, faLock, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { FC } from 'react';
import { Template } from 'services/backend/types';

type TemplateCardProps = {
    template: Template;
};

const TemplateCard: FC<TemplateCardProps> = ({ template }) => (
    <div className="list-group-item d-flex py-3 pe-4 ps-4">
        <div className="col-md-9 d-flex p-0">
            <div className="d-flex flex-column flex-grow-1">
                <div className="mb-2">
                    <Link href={reverse(ROUTES.TEMPLATE, { id: template.id })}>{template.label ? template.label : <em>No title</em>}</Link>
                </div>
                <div className="mb-1">
                    <small>
                        <Icon size="sm" icon={faShapes} className="me-1" /> {template.properties?.length} Properties
                        {template.is_closed && (
                            <>
                                <Icon size="sm" icon={faLock} className="ms-2 me-1" /> Closed
                            </>
                        )}
                        <Icon size="sm" icon={faCalendar} className="ms-2 me-1" /> {moment(template.created_at).format('DD-MM-YYYY')}
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
